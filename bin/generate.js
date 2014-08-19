var fs = require('fs');

var SRC_DIR = __dirname + '/../src';
var OUTPUT_FILENAME = 'weather-outfit.js';
var OUTPUT_FILE = __dirname + '/../' + OUTPUT_FILENAME;

function buildJs() {
  function include(filename) {
    return fs.readFileSync(SRC_DIR + '/' + filename, 'utf-8');
  }

  function define(variable, filename) {
    return 'var ' + variable + ' = ' +
           JSON.stringify(include(filename)) + ';';
  }

  fs.writeFileSync(OUTPUT_FILE, [
    '// This file was auto-generated, please do not edit it.',
    define('OUTFIT_HTML', 'outfit.html'),
    define('ERROR_HTML', 'error.html'),
    include('mustache.js'),
    include('weather-outfit-base.js')
  ].join('\n\n'));
}

module.exports = buildJs;
module.exports.OUTPUT_FILENAME = OUTPUT_FILENAME;

if (!module.parent) {
  console.log("Generating " + OUTPUT_FILENAME + "...");
  buildJs();
  console.log("Done.");
}
