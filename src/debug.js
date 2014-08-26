var Debug = {};

Debug.enableGUI = function() {
  var gui = new dat.GUI();
  var reload = function() {
    Backbone.history.stop();
    Backbone.history.start();
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
  Debug.gui = gui;
};

window.addEventListener('error', function(event) {
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
