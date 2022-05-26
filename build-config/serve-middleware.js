'use strict';

const fse = require('fs-extra');
const stream = require('stream');
const open = require('open');
const args = require('yargs').argv;
const express = require('express');
const cors = require('cors');
const https = require('https');
const path = require('path');

const { Readable } = stream;
const BUILD_CONFIG = require('./build-config.json');
const CATALOG_PATH = 'webApps/rwdref/services/catalog.json';
const ATTACHMENT_PATH = 'webApps/rwdref/services/attachments/openapi3.json';
const CHANGE_BACKENDS = ['fscmRestApi', 'crmRestApi'];
const JET_CDN_PATH = BUILD_CONFIG.jet.cdn;
const JET_CDN_VERSION = BUILD_CONFIG.jet.version;
const VBCS_CDN_PATH = BUILD_CONFIG.vb.cdn;
const VBCS_CDN_VERSION = BUILD_CONFIG.vb.version;
const OJ_SP_VERSION = BUILD_CONFIG.ojsp.version;
const OJ_DYNAMIC = BUILD_CONFIG.ojdyn.path+"/"+BUILD_CONFIG.ojdyn.version+"/min";
const OJ_SP_PATH = BUILD_CONFIG.ojsp.path;
const TELEMETRY_CDN = BUILD_CONFIG.telemetry.cdn;
const TELEMETRY_VERSION = BUILD_CONFIG.telemetry.version;
const SERVICES_HOST = BUILD_CONFIG.servicesHost;
const SERVICES_AUTH = `Basic ${Buffer.from(BUILD_CONFIG.servicesAuth, 'binary').toString('base64')}`;

const MARKER = '/vp/';
const RESOURCES = '/resources/';
const EXTENSIONS = ['.css', '.js', '.html', '.json', '.png', '.svg', '.jpeg'];

//copy dynamicLayouts before start in local
const layoutFolder = 'dynamicLayouts';
const destLayoutFolder =  'webApps/rwdref/dynamicLayouts';
fse.copySync(layoutFolder, destLayoutFolder);

//copy services too
const servicesFolder = 'services';
const destServicesFolder =  'webApps/rwdref/services';
fse.copySync(servicesFolder, destServicesFolder);

if(fse.existsSync(CATALOG_PATH)){
  let catalog = require('../'+CATALOG_PATH);
  catalog.backends.fa.servers[0] = JSON.parse(`{
    "url": "https://${SERVICES_HOST}",
    "x-vb": {
      "forceProxy": "false",
      "headers": {
        "Authorization": "${SERVICES_AUTH}"
      }
    },
    "description": "Default Server"
  }`);
  fse.writeFile(CATALOG_PATH, JSON.stringify(catalog, null, 2), function writeJSON(err) {
    if (err) return console.log(err);
  });
}

const joinPath = (url, vpath) => {
  return url.substring(0, url.length - 1) + path.join(url[url.length - 1], vpath);
}

let scripts = '<script type="text/javascript">\n';

scripts += `window.vbInitConfig = {
  JET_CDN_PATH: '${JET_CDN_PATH}',
  JET_CDN_VERSION: '${JET_CDN_VERSION}',
  VBCS_CDN_PATH: '${VBCS_CDN_PATH}',
  VBCS_CDN_VERSION: '${VBCS_CDN_VERSION}',
  BASE_URL: '/'
}\n`;

scripts += `window.faConfig = window.faConfig || {};\n`;
scripts += `window.faConfig.OJ_SP_VERSION = '${OJ_SP_VERSION}';\n`;
scripts += `window.faConfig['PROFILE'] = {"ORA_CLS_TRACE_ENABLED":"Y"};\n`;

scripts += `window.FAEndPoints = {
  OJ_DYNAMIC: '${OJ_DYNAMIC}',
  CDN_LOCATION: '${OJ_SP_PATH}'
}\n`;

scripts += `
window.vbInitParams  = window.vbInitParams || {};
window.vbInitParams['services.global.oraClientLoggingServiceApp'] = "https://localhost:3000/trace";
window.vbInitParams['services.catalog.common.oraClientLoggingServiceApp'] = "https://localhost:3000/trace";`;

const TELEMETRY_PATH = joinPath(TELEMETRY_CDN, TELEMETRY_VERSION);

scripts += '</script>\n';
scripts += `
<script type="text/javascript" src="${joinPath(JET_CDN_PATH, JET_CDN_VERSION)}/3rdparty/require/require.js"></script>
<script id="telemetry-trace-3rthparty" type="text/javascript" src="${TELEMETRY_PATH}/3rdparty/trace-3rdparty.js" charset="UTF-8"></script>
<script id="telemetry-trace-client-core" type="text/javascript" src="${TELEMETRY_PATH}/default/js/trace-client-core.js" charset="UTF-8"></script>
<script id="telemetry-trace-console-bundle" type="text/javascript" src="${TELEMETRY_PATH}/default/js/bundles/trace-smartplatform-bundle.js" charset="UTF-8"></script>
<script type="text/javascript" src="${joinPath(JET_CDN_PATH, JET_CDN_VERSION)}/default/js/bundles-config-debug.js"></script>
<script type="text/javascript" src="${joinPath(VBCS_CDN_PATH, VBCS_CDN_VERSION)}/lib/third-party-libs.js"></script>
<script id="vbrt" type="text/javascript" src="${joinPath(VBCS_CDN_PATH, VBCS_CDN_VERSION)}/visual-runtime-debug.js"></script>`;

const headContent = `<link rel="stylesheet" href="${joinPath(JET_CDN_PATH, JET_CDN_VERSION)}/default/css/redwood/oj-redwood-min.css" id="css" type="text/css"/>`;

const SRC = BUILD_CONFIG.deploy.target; // root location for loading contents


const sendAppFlowJson = (url, req, res, next) => {
  const filePath = `${SRC}/${url}`;
  fse.readFile(filePath, 'utf8', (err, data) => {
    if (!data) {
      console.log(
        `ERROR in sendAppFlowJson, no data for file. check the path: ${filePath}. ${err}`,
      );
    } else {
      try {
        let appFlow = JSON.parse(data);
        if (appFlow) {
          appFlow.requirejs.paths['smartplatform/vb'] = `${TELEMETRY_PATH}/default/js/smartplatform/smart-platform-client`;
          appFlow.requirejs.paths['smartplatform/provider/SuggestionsInstanceDataProvider'] = `${TELEMETRY_PATH}/default/js/smartplatform/smart-platform-client`;
          const out = new Readable();
          out.push(JSON.stringify(appFlow));
          out.push(null);
          out.pipe(res);
        } else {
          next();
        }
      } catch (e) {
        console.log(`exception in sendAppFlowJson. check the path: ${filePath} : ${e}`);
      }
    }
  });
};

const sendIndex = (url, req, res, next) => {
  const filePath = `${SRC}/${url}`;
  fse.readFile(filePath, 'utf8', (err, data) => {
    if (!data) {
      console.log(
        `ERROR in sendIndex, no data for file. check the path: ${filePath}. ${err}`,
      );
    } else {
      let contents = data;
      try {
        if (contents) {
          contents = contents.replace('<!-- vb:inject id="headContent" theme="resources/css/dt.theme.redwood" -->', headContent);
          contents = contents.replace('<!-- visualBuilderScripts -->', scripts);
          const out = new Readable();
          out.push(contents);
          out.push(null);
          out.pipe(res);
        } else {
          next();
        }
      } catch (e) {
        console.log(`exception in sendIndex. check the path: ${filePath} : ${e}`);
      }
    }
  });
};

const startServer = function() {
  var privateKey  = fse.readFileSync('build-config/ssl/key.pem', 'utf8');
  var certificate = fse.readFileSync('build-config/ssl/cert.pem', 'utf8');

  var credential = {key: privateKey, cert: certificate};

  const PORT = BUILD_CONFIG.deploy.port;

  const HOST = '0.0.0.0';

  const app = express();

  const corsOptions = {
    origin: function(origin, callback) {
      callback(null, true);
    },
    credentials: true,
  };

  app.use(cors());

  app.use(function(req, res, next) {
    const indexHtml = 'index.html';
    let { url } = req;
    const queryIndex = url.indexOf('?');
    if (queryIndex > 0) {
      url = url.substring(0, queryIndex);
    }

    const markerIndex = req.url.indexOf(MARKER);
    const baseUrl = req.url.substring(0, markerIndex + 1);
    if (markerIndex >= 0) {
      const isResource = EXTENSIONS.some((str) => url.endsWith(str));
      if (isResource) {
        const resourceBasePath = url.substring(url.lastIndexOf(RESOURCES) + 1);
        const newPath = baseUrl + resourceBasePath;
        sendIndex(newPath, req, res, next);
      } else {
        const newPath = `${baseUrl}index.html`;
        sendIndex(newPath, req, res, next);
      }
    } else if (url.endsWith(indexHtml) || url.endsWith("/")) {
      if (!url.endsWith(indexHtml)) {
        url += indexHtml;
      }
      sendIndex(url, req, res, next);
    } else if (url.endsWith('app-flow.json')) {
      sendAppFlowJson(url, req, res, next);
    } else {
      next();
    }
  });

  app.use(express.static(SRC));

  var httpsServer = https.createServer(credential, app);

  httpsServer.listen(PORT, HOST, function() {
    console.log(`app listening on localhost port: ${PORT}`);
  });
};
startServer();
