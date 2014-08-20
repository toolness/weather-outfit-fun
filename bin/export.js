#! /usr/bin/env node

var fs = require('fs');

var BASE_URL = process.argv[2] ||
               'http://toolness.github.io/weather-outfit-fun/';

var content = fs.readFileSync(__dirname + '/../index.html', 'utf-8')
  .replace('src="weather-outfit.js"',
           'src="' + BASE_URL + 'weather-outfit.js"');

process.stdout.write(content);
