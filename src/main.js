var Router = Backbone.Router.extend({
  routes: {
    '': 'start',
    'outfit': 'outfit',
    'outfit/:city': 'outfit'
  },
  setMainView: function(view) {
    if (this.mainView)
      this.mainView.remove();
    this.mainView = view;
    view.$el.appendTo('body');
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
  start: function(city) {
    this.$el.html(LOADING_HTML);
    var find = city ? getForecast.bind(null, city)
                    : getCurrentPositionForecast;
    find(function(err, forecast) {
      if (err)
        return Template.render(this.$el, 'error-template', err);
      Template.render(this.$el, 'outfit-template', {
        city: forecast.city,
        forecast: typeof(window.getForecastWords) == 'function'
                  ? getForecastWords(forecast) : '???',
        outfit: typeof(window.getForecastOutfit) == 'function'
                ? getForecastOutfit(forecast) : null
      });
      console.log(forecast);
    }.bind(this));
  }
});

$(function() {
  Template.setDefault('outfit-template', OUTFIT_HTML);
  Template.setDefault('error-template', ERROR_HTML);

  Backbone.history.start();
});
