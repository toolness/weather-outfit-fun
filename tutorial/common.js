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
