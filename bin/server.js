var fs = require('fs');
var express = require('express');

var PORT = process.env.PORT || 3000;
var SRC_DIR = __dirname + '/../src';

var app = express();

function buildJs() {
  function include(filename) {
    return fs.readFileSync(SRC_DIR + '/' + filename, 'utf-8');
  }

  function define(variable, filename) {
    return 'var ' + variable + ' = ' +
           JSON.stringify(include(filename)) + ';';
  }

  return [
    '// This file was auto-generated, please do not edit it.',
    define('OUTFIT_HTML', 'outfit.html'),
    define('ERROR_HTML', 'error.html'),
    include('mustache.js'),
    include('weather-outfit-base.js')
  ].join('\n\n');
}

app.use(function(req, res, next) {
  if (req.url == '/weather-outfit.js')
    fs.writeFileSync(__dirname + '/../weather-outfit.js', buildJs());
  next();
});

app.use(express.static(__dirname + '/..'));

app.listen(PORT, function() {
  console.log('listening on port ' + PORT);
});
