#! /usr/bin/env node

var fs = require('fs');

var BASE_URL = process.argv[2] ||
               'https://toolness.github.io/weather-outfit-fun/';

var content = fs.readFileSync(__dirname + '/../index.html', 'utf-8')
  .replace('src="weather-outfit.js"',
           'src="' + BASE_URL + 'weather-outfit.js"')
  .replace('href="weather-outfit.css"',
           'href="' + BASE_URL + 'weather-outfit.css"');

process.stdout.write(content);
