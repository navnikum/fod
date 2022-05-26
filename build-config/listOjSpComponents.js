const fs = require('fs');
const readline = require('readline');
const path = require('path');

const START_TAG = '<oj-sp-';

const processLineByLine = async (fileName, result) => {
  const fileStream = fs.createReadStream(fileName);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    if (line.includes(START_TAG)) {
      let componentName = line.substring(line.indexOf(START_TAG) + 1);
      if (componentName.indexOf(' ') !== -1) {
        componentName = componentName.substring(0, componentName.indexOf(' '));
      }
      result.add(componentName);
      // console.log(`Component: ${componentName}`);
    }
    // console.log(`Line from file: ${line}`);
  }
};

function walkSync(currentDirPath, callback) {
  fs.readdirSync(currentDirPath).forEach(function(name) {
    var filePath = path.join(currentDirPath, name);
    var stat = fs.statSync(filePath);
    if (stat.isFile()) {
      callback(filePath, stat);
    } else if (stat.isDirectory()) {
      walkSync(filePath, callback);
    }
  });
}

const getAllHtmlFiles = () => {
  const htmlFiles = [];
  for (const folder of ['./dynamicLayouts', './webApps']) {
    walkSync(folder, fileName => {
      if (fileName.endsWith('.html')) {
        htmlFiles.push(fileName);
      }
    });
  }

  return htmlFiles;
};

const main = async () => {
  const components = new Set();
  const files = getAllHtmlFiles();
  // console.log(files);
  for (const fileName of files) {
    await processLineByLine(fileName, components);
  }
  const sortedComponents = Array.from(components).sort();
  for (const component of sortedComponents) {
    console.log(component);
  }
};

main();
