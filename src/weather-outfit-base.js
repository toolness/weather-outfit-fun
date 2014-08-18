var GEO_CACHE_MS = 1000 * 60 * 10;
var FORECAST_CACHE_MS = 1000 * 60 * 60;

function getCacheEntry(key, maxAge) {
  var val = sessionStorage[key];
  var now = Date.now();

  try {
    val = JSON.parse(val);
    if (now - val.timestamp < maxAge)
      return val.value;
  } catch (e) {
    return;
  }
}

function setCacheEntry(key, value) {
  try {
    sessionStorage[key] = JSON.stringify({
      timestamp: Date.now(),
      value: value
    });
    console.log('setCacheEntry', key);
  } catch (e) {}
}

function getForecast(coords, cb) {
  var url = 'http://api.openweathermap.org/data/2.5/forecast?lat=' +
            coords.latitude + '&lon=' + coords.longitude;
  var forecast = getCacheEntry('weather_forecast', FORECAST_CACHE_MS);

  if (forecast && forecast.url == url)
    return cb(null, forecast.res);

  var req = new XMLHttpRequest();
  req.open('GET', url);
  req.onerror = function() {
    cb(new Error('connection error'));
  };
  req.onload = function() {
    var res = JSON.parse(req.responseText);
    if (res.cod != 200)
      return cb(new Error(res.message));
    setCacheEntry('weather_forecast', {
      url: url,
      res: res
    });
    cb(null, res);
  };
  req.send(null);
}

function getCurrentPositionForecast(cb) {
  var coords = getCacheEntry('weather_coords', GEO_CACHE_MS);
  if (coords) return getForecast(coords, cb);
  navigator.geolocation.getCurrentPosition(function(pos) {
    coords = {
      latitude: pos.coords.latitude.toFixed(3),
      longitude: pos.coords.longitude.toFixed(3)
    };
    setCacheEntry('weather_coords', coords);
    getForecast(coords, cb);
  }, function(err) {
    cb(new Error('geolocation error'));
  });
}

window.addEventListener("DOMContentLoaded", function() {
  var getTemplate = function(id, defaultValue) {
    var template = document.getElementById(id);

    if (template) return template;
    template = document.createElement('div');
    template.setAttribute('style', 'display: none');
    template.setAttribute('id', id);
    template.textContent = defaultValue;
    document.body.appendChild(template);
    return template;
  };
  var outfitTemplate = getTemplate('outfit-template', OUTFIT_HTML);
  var errorTemplate = getTemplate('error-template', ERROR_HTML);
  var outfit = document.getElementById('outfit');

  if (!outfit) {
    outfit = document.createElement('div');
    outfit.setAttribute('id', 'outfit');
    document.body.appendChild(outfit);
  }

  getCurrentPositionForecast(function(err, forecast) {
    if (err) {
      outfit.innerHTML = Mustache.render(errorTemplate.textContent, err);
      return;
    }
    outfit.innerHTML = Mustache.render(outfitTemplate.textContent, {
      city: forecast.city.name,
      forecast: typeof(window.getForecastWords) == 'function'
                ? getForecastWords(forecast.list) : '???',
      outfit: typeof(window.getForecastOutfit) == 'function'
              ? getForecastOutfit(forecast.list) : null
    });
    console.log(forecast);
  });
});
