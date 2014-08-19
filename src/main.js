$(function() {
  var outfit = $('#outfit');

  if (!outfit.length)
    outfit = $('<div id="outfit"></div>').appendTo('body');

  setTemplateDefault('outfit-template', OUTFIT_HTML);
  setTemplateDefault('error-template', ERROR_HTML);

  getCurrentPositionForecast(function(err, forecast) {
    if (err)
      return outfit.render('error-template', err);
    outfit.render('outfit-template', {
      city: forecast.city,
      forecast: typeof(window.getForecastWords) == 'function'
                ? getForecastWords(forecast) : '???',
      outfit: typeof(window.getForecastOutfit) == 'function'
              ? getForecastOutfit(forecast) : null
    });
    console.log(forecast);
  });
});
