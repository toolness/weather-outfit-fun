var Debug = {};

Debug.init = function() {
  var match = window.location.search.match(/debug=(on|off)/);

  if (match)
    window.DEBUG = (match[1] == 'on');

  if (window.DEBUG)
    Debug.enableGUI();
};

Debug.enableGUI = function() {
  dat.GUI.TEXT_OPEN = 'Open Debug Panel';
  dat.GUI.TEXT_CLOSED = 'Close Debug Panel';

  var gui = new dat.GUI();
  var reload = function() {
    Backbone.history.stop();
    Backbone.history.start();
  };

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

  gui.width = 300;

  var forecast = gui;
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

  temp.open();
  if ($('html').width() < 640)
    gui.close();

  Debug.gui = gui;
  $('html').addClass('debug');
};

window.addEventListener('error', function(event) {
  var MAX_ERRORS = 5;
  var extra = (/\.js$/i.test(event.filename))
              ? ' of <code>' + _.escape(event.filename) + '</code>'
              : '';

  var div = $('<div></div>')
    .html('<strong>Alas, a JavaScript error occurred.</strong><br>' +
          '<code>' + _.escape(event.message) + '</code> at line ' +
          event.lineno + extra)
    .css({
      color: 'white',
      backgroundColor: 'salmon',
      padding: '4px'
    });

  var attach = function() {
    var log = $('#js-error-log');

    if (log.length == 0)
      log = $('<div id="js-error-log"></div>').prependTo('body');

    if (log.children().length < MAX_ERRORS)
      div.appendTo(log);
  };

  if (document.readyState == 'complete')
    attach();
  else
    $(window).one('load', attach);
});
