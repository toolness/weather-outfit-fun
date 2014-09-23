var PREFIX = 'weatherOutfit_';

var baseURL = window.location.protocol + '//' + window.location.host +
              window.location.pathname;
baseURL = baseURL.match(/^(.+\/)tutorial\/.*$/)[1];

function getStorage(key, defaultValue) {
  try {
    return JSON.parse(sessionStorage[PREFIX + key]);
  } catch (e) {
    return defaultValue;
  }
}

function setStorage(key, value) {
  try {
    sessionStorage[PREFIX + key] = JSON.stringify(value);
  } catch (e) {}
}

function isStorageKey(key) { return key.indexOf(PREFIX) == 0; }

// http://stackoverflow.com/a/2880929
function parseQueryStringParams(query) {
  if (typeof(query) == 'undefined')
    query = window.location.search.substring(1);

  var match;
  var pl = /\+/g;  // Regex for replacing addition symbol with a space
  var search = /([^&=]+)=?([^&]*)/g;
  var decode = function (s) {
    return decodeURIComponent(s.replace(pl, " "));
  };

  var urlParams = {};
  while (match = search.exec(query))
    urlParams[decode(match[1])] = decode(match[2]);
  return urlParams;
}

function stringifyQueryStringParams(urlParams) {
  return Object.keys(urlParams).map(function(key) {
    return encodeURIComponent(key) + '=' +
           encodeURIComponent(urlParams[key]);
  }).join('&');
}

function embedStorageInCurrentURL() {
  var urlParams = parseQueryStringParams();
  Object.keys(sessionStorage).filter(isStorageKey)
    .forEach(function(key) {
      urlParams[key] = btoa(sessionStorage[key]);
    });

  return window.location.origin + window.location.pathname + '?' +
         stringifyQueryStringParams(urlParams) + window.location.hash;
}

function restoreStorageFromCurrentURL() {
  var urlParams = parseQueryStringParams();
  var storageChanged = false;
  Object.keys(urlParams).filter(isStorageKey)
    .forEach(function(key) {
      if (key in sessionStorage) return;
      try {
        sessionStorage[key] = atob(urlParams[key]);
      } catch (e) { return; }
      delete urlParams[key];
      storageChanged = true;
    });
  if (storageChanged) {
    window.history.replaceState(
      {}, '',
      '?' + stringifyQueryStringParams(urlParams) + window.location.hash
    );
  }
}
