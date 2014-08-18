var fs = require('fs');
var express = require('express');

var PORT = process.env.PORT || 3000;
var SRC_DIR = __dirname + '/../src';

var app = express();

function buildJs() {
  return '// This file was auto-generated, please do not edit it.\n\n' +
    fs.readFileSync(SRC_DIR + '/weather-outfit-base.js', 'utf-8');
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
