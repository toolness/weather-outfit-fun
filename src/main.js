var Router = Backbone.Router.extend({
  routes: {
    '': 'start',
    'outfit': 'outfit',
    'outfit/:city': 'outfit'
  },
  navigate: function(fragment, options) {
    Cache.set('weather_lastfragment', fragment);
    return Backbone.Router.prototype.navigate.call(this, fragment, options);
  },
  // If we're in a live-reload editor like JSBin or Thimble, keep track
  // of the fragment between page reloads and restore it so the user
  // doesn't have to constantly re-navigate to the fragment they're
  // working on whenever they change something.
  loadLastFragment: function() {
    if (window.parent !== window && !window.location.hash &&
      Cache.get('weather_lastfragment'))
    router.navigate(Cache.get('weather_lastfragment'), {trigger: true});
  },
  setMainView: function(view) {
    if (this.mainView)
      this.mainView.remove();
    this.mainView = view;
    view.$el.appendTo('#app');
    return view;
  },
  start: function() {
    this.setMainView(new StartView()).render();
  },
  outfit: function(city) {
    this.setMainView(new OutfitView()).start(city);
  }
});

var router = new Router();

var StartView = Backbone.View.extend({
  events: {
    'click button[role=action-geolocate]': 'geolocateOutfit',
    'keydown input[name=city]': 'cityOutfit',
    'click button[role=action-city]': 'cityOutfit'
  },
  geolocateOutfit: function(event) {
    router.navigate('/outfit', {trigger: true});
  },
  cityOutfit: function(event) {
    if (event.type == 'keydown' && event.which != 13) return;
    var city = this.$el.find('input[name=city]').val();
    if (!city) return;
    router.navigate('/outfit/' + encodeURI(city), {trigger: true});
  },
  render: function() {
    this.$el.html(START_HTML);
  }
});

var OutfitView = Backbone.View.extend({
  events: {
    'click button[role=action-restart]': 'restart'
  },
  restart: function(event) {
    router.navigate('', {trigger: true});
  },
  renderException: function(error) {
    var message = '"' + error.message + '"';
    if (error.stack) message += '\n\n' + error.stack;
    Template.render(this.$el, 'error-template', {message: message});
    console.log(error);
  },
  start: function(city) {
    this.$el.html(LOADING_HTML);
    var find = city ? getForecast.bind(null, city)
                    : getCurrentPositionForecast;
    if (window.DEBUG && window.USE_FAKE_FORECAST)
      find = function(cb) { cb(null, window.FAKE_FORECAST); };
    find(function(err, forecast) {
      if (err)
        return Template.render(this.$el, 'error-template', err);

      var forecastWords = '???';
      var forecastOutfit = null;

      if (typeof(window.getForecastWords) == 'function')
        try {
          forecastWords = getForecastWords(forecast);
        } catch (e) {
          return this.renderException(e);
        }

      if (typeof(window.getForecastOutfit) == 'function')
        try {
          forecastOutfit = getForecastOutfit(forecast);
        } catch (e) {
          return this.renderException(e);
        }

      Template.render(this.$el, 'outfit-template', {
        city: forecast.city,
        forecastWords: typeof(forecastWords) == 'string' && forecastWords,
        outfitURL: typeof(forecastOutfit) == 'string' && forecastOutfit
      });

      if (forecastWords instanceof Node || forecastWords instanceof $)
        this.$el.find('.forecastWords').empty().append(forecastWords);

      if (forecastOutfit instanceof Node || forecastOutfit instanceof $)
        this.$el.find('.forecastOutfit').empty().append(forecastOutfit);
    }.bind(this));
  }
});

window.addEventListener('error', function(err) {
  var extra = (/\.js$/i.test(event.filename))
              ? ' of <code>' + _.escape(event.filename) + '</code>'
              : '';

  $('<div></div>')
    .html('<strong>Alas, a JavaScript error occurred.</strong><br>' +
          '<code>' + _.escape(event.message) + '</code> at line ' +
          event.lineno + extra)
    .css({
      color: 'white',
      backgroundColor: 'salmon',
      padding: '4px'
    })
    .prependTo('body');
});

window.getForecastWords = function getForecastWords(forecast) {
  var tempWords = navigator.language == 'en-US'
                  ? Math.round(forecast.temp.f) + '\u00b0F'
                  : Math.round(forecast.temp.c) + '\u00b0C';
  return tempWords + ' and ' + forecast.weather;
};

window.enableDebugGUI = function() {
  var gui = new dat.GUI();
  var reload = function() {
    Backbone.history.stop();
    Backbone.history.start();
/*    router.navigate(window.location.hash.slice(1), {
      trigger: true,
      replace: true
    });*/
  };

  if (typeof(USE_FAKE_FORECAST) == 'undefined')
    window.USE_FAKE_FORECAST = false;
  if (typeof(FAKE_FORECAST) == 'undefined') {
    window.FAKE_FORECAST = {
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

  gui.add(window, 'USE_FAKE_FORECAST').onChange(function(value) {
    if (value) {
      forecast.open();
      temp.open();
    } else {
      forecast.close();
      temp.close();
    }
    reload();
  });
  gui.width = 300;

  var forecast = gui.addFolder('FAKE_FORECAST');
  var temp = forecast.addFolder('temp');

  forecast.add(FAKE_FORECAST, 'city').onChange(reload);
  forecast.add(FAKE_FORECAST, 'humidity', 0, 100).onChange(reload);
  forecast.add(FAKE_FORECAST, 'weather', [
    "clear",
    "partly cloudy",
    "mostly cloudy",
    "raining",
    "thunderstorming",
    "snowing",
    "misty"
  ]).onChange(reload);
  temp.add(FAKE_FORECAST.temp, 'f', -129, 134).listen()
    .onChange(function(value) {
      FAKE_FORECAST.temp.c = Math.round((value - 32) * 5/9);
      reload();
    });
  temp.add(FAKE_FORECAST.temp, 'c', -89, 57).listen()
    .onChange(function(value) {
      FAKE_FORECAST.temp.f = Math.round(value * 9/5 + 32);
      reload();
    });

  gui.open();
  window.debugGUI = gui;
};

$(function() {
  Template.setDefault('outfit-template', OUTFIT_HTML);
  Template.setDefault('error-template', ERROR_HTML);

  if (!$('#app').length)
    $('<div id="app"></div>').appendTo('body');

  if (window.DEBUG)
    enableDebugGUI();

  Backbone.history.start();
  router.loadLastFragment();
});
