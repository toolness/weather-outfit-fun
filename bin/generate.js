var fs = require('fs');
var SourceMapGenerator = require('source-map').SourceMapGenerator;

var SRC_DIR = __dirname + '/../src';
var OUTPUT_FILENAME = 'weather-outfit.js';
var OUTPUT_FILE = __dirname + '/../' + OUTPUT_FILENAME;
var MAP_FILENAME = OUTPUT_FILENAME + '.map';
var MAP_FILE = OUTPUT_FILE + '.map';

function buildJs() {
  var map = new SourceMapGenerator({
    file: OUTPUT_FILENAME,
    sourceRoot: '/src/'
  });
  var lines = ['//# sourceMappingURL=' + MAP_FILENAME];

  function write(content, source) {
    content.split('\n').forEach(function(line, i) {
      if (source)
        map.addMapping({
          generated: {line: lines.length + 1, column: 0},
          source: source,
          original: {line: 1 + i, column: 0}
        });
      lines.push(line);
    });
  }

  function readFile(filename) {
    return fs.readFileSync(SRC_DIR + '/' + filename, 'utf-8');
  }

  function include(filename) {
    write(readFile(filename), filename);
  }

  function define(variable, filename) {
    write('var ' + variable + ' = ' +
          JSON.stringify(readFile(filename)) + ';');
  }

  define('OUTFIT_HTML', 'outfit.html'),
  define('ERROR_HTML', 'error.html'),
  include('mustache.js'),
  include('weather-outfit-base.js')

  fs.writeFileSync(OUTPUT_FILE, lines.join('\n'));
  fs.writeFileSync(MAP_FILE, map.toString());
}

module.exports = buildJs;
module.exports.OUTPUT_FILENAME = OUTPUT_FILENAME;

if (!module.parent) {
  console.log("Generating " + OUTPUT_FILENAME + "...");
  buildJs();
  console.log("Done.");
}
