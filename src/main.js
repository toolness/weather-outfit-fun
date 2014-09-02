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
  setView: function(sel, view) {
    var oldView = this.currentView;
    this.currentView = view;
    $(sel).empty().append(view.el);
    $('#app-views')
      .css({left: -view.$el.position().left + 'px'})
      .one('transitionend', function() { if (oldView) oldView.remove(); });
    return view;
  },
  start: function() {
    this.setView('#app-start', new StartView()).render();
  },
  outfit: function(city) {
    this.setView('#app-outfit', new OutfitView()).start(city);
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
  FIND_TIMEOUT_MS: 10000,
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
    var timedOut = false;
    var timeout = setTimeout(function() {
      Template.render(this.$el, 'error-template', new Error('Timed out'));
      timedOut = true;
    }.bind(this), this.FIND_TIMEOUT_MS);
    if (window.DEBUG)
      find = function(cb) { cb(null, window.FAKE_FORECAST); };
    find(function(err, forecast) {
      if (timedOut) return;
      if (err)
        return Template.render(this.$el, 'error-template', err);

      var forecastWords = '???';
      var forecastOutfit = null;

      clearTimeout(timeout);
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

      if (forecastOutfit === undefined)
        return Template.render(this.$el, 'error-template',
                               new Error('getForecastOutfit() returned ' +
                                         'undefined'));

      if (typeof(forecastOutfit) == 'string')
        forecastOutfit = [forecastOutfit];

      Template.render(this.$el, 'outfit-template', {
        city: forecast.city,
        forecastWords: typeof(forecastWords) == 'string' && forecastWords,
        outfitURLs: $.isArray(forecastOutfit) ? forecastOutfit : []
      });

      if (forecastWords instanceof Node || forecastWords instanceof $)
        this.$el.find('.forecastWords').empty().append(forecastWords);

      if (forecastOutfit instanceof Node || forecastOutfit instanceof $)
        this.$el.find('.forecastOutfit').empty().append(forecastOutfit);
    }.bind(this));
  }
});

window.getForecastWords = function getForecastWords(forecast) {
  var tempWords = navigator.language.toLowerCase() == 'en-us'
                  ? Math.round(forecast.temp.f) + '\u00b0F'
                  : Math.round(forecast.temp.c) + '\u00b0C';
  return tempWords + ' and ' + forecast.weather;
};

$(function() {
  Template.setDefault('outfit-template', OUTFIT_HTML);
  Template.setDefault('error-template', ERROR_HTML);

  if (!$('#app').length)
    $('<div id="app"></div>').appendTo('body');

  $('<div id="app-views"><div id="app-start"></div>' +
    '<div id="app-outfit"></div></div>').appendTo('#app');

  Debug.init();
  Backbone.history.start();
  router.loadLastFragment();

  setTimeout(function() { $('#app-views').addClass('ready') }, 100);
});
