var express = require('express');
var generate = require('./generate');

var PORT = process.env.PORT || 3000;

var app = express();

app.use(function(req, res, next) {
  if (req.url == '/' + generate.OUTPUT_FILENAME)
    generate();
  next();
});

app.use(express.static(__dirname + '/..'));

app.listen(PORT, function() {
  console.log('listening on port ' + PORT);
});
