var GEO_CACHE_MS = 1000 * 60 * 10;
var FORECAST_CACHE_MS = 1000 * 60 * 60;

function kelvinToCelsius(k) {
  return k - 273.15;
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
      temp: {
        k: item.main.temp,
        c: kelvinToCelsius(item.main.temp),
        f: kelvinToFarenheit(item.main.temp)
      },
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

function getForecast(where, cb) {
  var qs = (typeof(where) == 'string'
            ? '?q=' + encodeURIComponent(where)
            : '?lat=' + where.latitude + '&lon=' + where.longitude) +
           '&APPID=1b9137c2a18a6a06df9a2c07ab7e019b';
  var cacheKey = 'weather_forecast' + qs;
  var url = 'http://api.openweathermap.org/data/2.5/forecast' + qs;
  var forecast = Cache.get(cacheKey, FORECAST_CACHE_MS);

  if (forecast)
    return cb(null, simplifyForecast(forecast));

  if (window.location.protocol == 'https:')
    url = url.replace('http://', 'https://httpsify.herokuapp.com/');

  var req = new (window.XDomainRequest || window.XMLHttpRequest)();
  req.open('GET', url);
  req.onerror = function() {
    cb(new Error('connection error'));
  };
  req.onload = function() {
    var res = JSON.parse(req.responseText);
    if (res.cod == 404 && typeof(where) == 'string')
      return cb(new Error('city "' + where + '" not found'));
    if (res.cod != 200)
      return cb(new Error(res.message));
    Cache.set(cacheKey, res);
    cb(null, simplifyForecast(res));
  };
  req.send(null);
}

function getCurrentPositionForecast(cb) {
  var coords = Cache.get('weather_coords', GEO_CACHE_MS);
  if (coords) return getForecast(coords, cb);
  navigator.geolocation.getCurrentPosition(function(pos) {
    coords = {
      latitude: pos.coords.latitude.toFixed(3),
      longitude: pos.coords.longitude.toFixed(3)
    };
    Cache.set('weather_coords', coords);
    getForecast(coords, cb);
  }, function(err) {
    cb(new Error('geolocation error'));
  });
}
