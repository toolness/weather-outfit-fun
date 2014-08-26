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

      console.log(forecast);
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

$(function() {
  Template.setDefault('outfit-template', OUTFIT_HTML);
  Template.setDefault('error-template', ERROR_HTML);

  if (!$('#app').length)
    $('<div id="app"></div>').appendTo('body');

  Backbone.history.start();
  router.loadLastFragment();
});
