#! /usr/bin/env node

var fs = require('fs');

var BASE_URL = process.argv[2] ||
               'https://toolness.github.io/weather-outfit-fun/';
var TUTE_URL = BASE_URL + 'tutorial/';

var content = fs.readFileSync(__dirname + '/../tutorial/tutorial.html', 'utf-8')
  .replace(/\<link href="/g, '<link href="' + TUTE_URL)
  .replace(/\<script src="/g, '<script src="' + TUTE_URL)
  .replace(/\<img src="img/g, '<img src="' + TUTE_URL + 'img')
  .replace('<meta charset="utf-8">',
           '<meta charset="utf-8">\n<script>\nDEBUG = true;\n' +
           'baseURL = ' + JSON.stringify(BASE_URL) + ';\n</script>');

process.stdout.write(content);
