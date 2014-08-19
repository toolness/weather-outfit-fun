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

function kelvinToFarenheit(k) {
  return k * (9/5) - 459.67;
}

// http://openweathermap.org/weather-conditions
function iconToWeather(icon) {
  icon = icon.slice(0, -1);
  if (icon == '01') return 'clear';
  if (icon == '02' || icon == '03') return 'partly cloudy';
  if (icon == '04') return 'mostly cloudy';
  if (icon == '09' || icon == '10') return 'raining';
  if (icon == '11') return 'thunderstorming';
  if (icon == '13') return 'snowing';
  if (icon == '50') return 'misty';
  return 'unknown';
}

function simplifyForecast(res) {
  function simplifyItem(item) {
    return {
      city: res.city.name,
      date: new Date(item.dt * 1000),
      humidity: item.main.humidity,
      temp: kelvinToFarenheit(item.main.temp),
      weather: iconToWeather(item.weather[0].icon)
    };
  }

  var first, latest;

  for (var i = 0; i < res.list.length; i++) {
    var item = simplifyItem(res.list[i]);
    if (!first)
      first = item;
    if (latest)
      latest.next = item;
    latest = item;
  }

  return first;
}

function getForecast(coords, cb) {
  var qs = '?lat=' + coords.latitude + '&lon=' + coords.longitude;
  var cacheKey = 'weather_forecast' + qs;
  var url = 'http://api.openweathermap.org/data/2.5/forecast' + qs;
  var forecast = getCacheEntry(cacheKey, FORECAST_CACHE_MS);

  if (forecast)
    return cb(null, simplifyForecast(forecast));

  var req = new XMLHttpRequest();
  req.open('GET', url);
  req.onerror = function() {
    cb(new Error('connection error'));
  };
  req.onload = function() {
    var res = JSON.parse(req.responseText);
    if (res.cod != 200)
      return cb(new Error(res.message));
    setCacheEntry(cacheKey, res);
    cb(null, simplifyForecast(res));
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
      city: forecast.city,
      forecast: typeof(window.getForecastWords) == 'function'
                ? getForecastWords(forecast) : '???',
      outfit: typeof(window.getForecastOutfit) == 'function'
              ? getForecastOutfit(forecast) : null
    });
    console.log(forecast);
  });
});
