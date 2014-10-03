(function() {
  var makeForecast = function() {
    return {
      city: 'Fakeville',
      date: new Date(),
      humidity: 50,
      weather: 'clear',
      temp: {
        f: 32,
        c: 0
      }
    };
  }

  var challenges = {
    'load': true,
    'style': function isCssLoaded() {
      var $el = $('<div class="i-should-be-tall"></div>').appendTo('body');
      var isTall = $el.height() > 0;
      $el.remove();
      return isTall;
    },
    'js': function isGetForecastOutfitDefined() {
      return typeof(window.getForecastOutfit) == 'function';
    },
    'temperature': function doesGetForecastOutfitUseTemperature() {
      try {
        var forecast = makeForecast();
        var cold = window.getForecastOutfit(forecast);
        var hot = window.getForecastOutfit($.extend(forecast, {
          temp: {f: 212, c: 100}
        }));

        if (!(cold && hot && cold != hot))
          return false;
        return true;
      } catch (e) {
        return false;
      }
    },
    'weather': function doesGetForecastOutfitUseWeather() {
      try {
        var forecast = makeForecast();
        var clear = window.getForecastOutfit(forecast);
        var thunderstorming = window.getForecastOutfit($.extend(forecast, {
          weather: 'thunderstorming'
        }));

        if (!(clear && thunderstorming && clear != thunderstorming))
          return false;
        return true;
      } catch (e) {
        return false;
      }
    },
    'logic': function doesGetForecastOutfitWorkAmazinglyWell() {
      return challenges.temperature() && challenges.weather();
    },
    'title': function isPageTitleNotDefault() {
      var DEFAULT_TITLE = "outfit of the day";

      return $('title').text().toLowerCase() != DEFAULT_TITLE &&
             $('h1').text().toLowerCase() != DEFAULT_TITLE;
    }
  };

  var ME_REGEXP = /^(.+\/)weather-outfit\.js$/;
  var baseURL;

  // On IE9, the latest entry in document.scripts isn't necessarily
  // our script, as inline scripts after our scripts can actually already
  // be part of document.scripts, so we'll just find the latest script
  // that matches what we think our script is called.
  [].slice.call(document.scripts).forEach(function(script) {
    var match = script.src.match(ME_REGEXP);
    if (match) baseURL = match[1];
  });

  $(function() {
    var CHALLENGE_POLL_INTERVAL = 1000;
    var iframe = document.createElement('iframe');

    if (!baseURL) throw new Error('baseURL not found');

    iframe.setAttribute('src', baseURL + 'tutorial/challenges.html');

    $('body').append(iframe);
    $(iframe).hide();

    setInterval(function() {
      var state = {};
      Object.keys(challenges).forEach(function(name) {
        var val = challenges[name];
        state[name] = typeof(val) == 'function' ? val() : val;
      });
      iframe.contentWindow.postMessage(JSON.stringify(state), '*');
    }, CHALLENGE_POLL_INTERVAL);
  });
})();
