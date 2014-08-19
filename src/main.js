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

var StartView = Backbone.View.extend({
  events: {
    'submit form': 'cityOutfit'
  },
  cityOutfit: function(event) {
    event.preventDefault();
    var city = $('input[name=city]', event.target).val();
    window.location.hash = '#/outfit/' + encodeURI(city);
  },
  render: function() {
    this.$el.html(START_HTML);
  }
});

var OutfitView = Backbone.View.extend({
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
  var router = new Router();

  Template.setDefault('outfit-template', OUTFIT_HTML);
  Template.setDefault('error-template', ERROR_HTML);

  Backbone.history.start();
});
