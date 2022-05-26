'use strict';
  
/**
 * Gruntfile.js template for FA VB app UI extension
 *
 * This contains configurations of VB grunt tasks for build & optimizating VB app
 & It also defines "fa-cdn" grunt task for producing VB app content on CDN to be used when deploying & serving VB app UI from FA monolith (Weblogic based environment) outside VBS Design-time
 *
 * Usage:
 * Copy this Gruntfile.js template to <VB app UI extension GIT repo root>/ & customize it to tailor your own VB app. See "CUSTOMIZE ME" markers in the template
 * To invoke "fa-cdn" grunt task:
 * - Run 'npm install'
 * - Run './node_modules/.bin/grunt fa-cdn --vbExtensionID=<extension ID> --vbExtensionVer=<version> --url:ce=http://exchange.oraclecorp.com/api/0.2.0
 *   e.g. './node_modules/.bin/grunt fa-cdn --vbExtensionID=oracle_ui_hcm_test --vbExtensionVer=2201.0.0 --url:ce=http://exchange.oraclecorp.com/api/0.2.0'
 * - Output of "fa-cdn" grunt task will be in build/cdn/
 *
 * Dependency:
 * <VB app GIT repo root>/package.json needs to contain following packages and versions (& beyond):
 *   "@oracle/grunt-vb-build": "https://static.oracle.com/cdn/vb/tools/npm/grunt-vb-build/grunt-vb-build-2110.0.10.tar.gz",
 *   "grunt": "^1.0.3",
 *   "grunt-cli": "^1.3.2",
 *   "load-grunt-tasks": "^4.0.0",
 *   "adm-zip": "^0.4.16"
 */
module.exports = (grunt) => {
    require('load-grunt-tasks')(grunt);
  
    grunt.initConfig({      
        // disable images minification
        'vb-image-minify': {
            'options': {
              'skip': true,
            },
        },
        // configure requirejs modules bundling
        "vb-require-bundle": {
            options: {
                transpile: true,
                minify: true,
                bundles: {
                    "vb-app-bundle": {
                        "modules": {
                            // Text based files used at run-time that should be included/excluded in the generated optimized bundle
                            // CUSTOMIZE ME: Specify below entries for anything needed to be excluded from the optimized bundle relative to what's source
                            //               controlled in GIT under <VB app GIT repo root>/extension1/sources/ with "!^" expressions in "find" array below.
                            //               Examples would be design-time configuration files (private/settings directories) or mock data files that should be excluded.
                            "find": [
                                ".*(\.(js|json|html|css))$",
                                "!^ui/self/applications/rwdref/resources/mockdata",
                                "!^services/businessObjects/service.json",
                                "!^settings"
                            ]
                        }
                    }
                }
            }
        },
    });
  
  
    //////////////////////////////////////////////////////////////////////////
    // Internal implementations begin
    //////////////////////////////////////////////////////////////////////////
  
    // Private task for extracting content into build/cdn directory from the generated VX file
    grunt.registerTask('copy-cdn', () => {
      var AdmZip = require('adm-zip');
      var zip = new AdmZip('build/' + grunt.option('vbExtensionID') + '.vx');
      zip.extractAllTo('build/cdn/' + grunt.option('vbExtensionID') + '/' + grunt.option('vbExtensionVer'), true);
    });
  
    // Public task for creating content ready to be packaged & publish to CDN
    grunt.registerTask('fa-cdn', () => {
        if ( grunt.option('vbExtensionID') === undefined || grunt.option('vbExtensionVer') === undefined || grunt.option('url:ce') === undefined ) {
            grunt.fail.fatal("Must provide options '--vbExtensionID=<VB app UI extension ID> --vbExtensionVer=<version> --url:ce=<Exchange URL>'");
        }
  
        grunt.option('mode', 'fa');
 
        // Can only enable this option when VBS-11655, VBS-11661 are delivered
        //grunt.option('clean-bundled-resources', true);
 
        grunt.option('vx-version', grunt.option('vbExtensionVer'));
 
        grunt.task.run(['vb-clean', 'vb-process-local', 'vb-package', 'copy-cdn']);
    });
};
