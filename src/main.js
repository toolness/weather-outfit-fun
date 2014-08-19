var Router = Backbone.Router.extend({
  routes: {
    '': 'start',
    'outfit': 'outfit'
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
  outfit: function() {
    this.setMainView(new OutfitView()).start();
  }
});

var StartView = Backbone.View.extend({
  render: function() {
    this.$el.html(START_HTML);
  }
});

var OutfitView = Backbone.View.extend({
  start: function() {
    this.$el.html(LOADING_HTML);
    getCurrentPositionForecast(function(err, forecast) {
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
