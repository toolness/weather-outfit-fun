$(function() {
  var outfit = $('#outfit');

  if (!outfit.length)
    outfit = $('<div id="outfit"></div>').appendTo('body');

  Template.setDefault('outfit-template', OUTFIT_HTML);
  Template.setDefault('error-template', ERROR_HTML);

  getCurrentPositionForecast(function(err, forecast) {
    if (err)
      return Template.render(outfit, 'error-template', err);
    Template.render(outfit, 'outfit-template', {
      city: forecast.city,
      forecast: typeof(window.getForecastWords) == 'function'
                ? getForecastWords(forecast) : '???',
      outfit: typeof(window.getForecastOutfit) == 'function'
              ? getForecastOutfit(forecast) : null
    });
    console.log(forecast);
  });
});
