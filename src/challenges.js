(function() {
  var challenges = {
    'load': true,
    'style': function isCssLoaded() {
      var $el = $('<div class="i-should-be-tall"></div>').appendTo('body');
      var isTall = $el.height() > 0;
      $el.remove();
      return isTall;
    },
    'js': function isGetForecastOutfitDefined() {
      return typeof(window.getForecastOutfit) == 'function';
    },
    'title': function isPageTitleNotDefault() {
      var DEFAULT_TITLE = "outfit of the day";

      return $('title').text().toLowerCase() != DEFAULT_TITLE &&
             $('h1').text().toLowerCase() != DEFAULT_TITLE;
    }
  };

  var me = document.scripts[document.scripts.length-1].src;

  $(function() {
    var CHALLENGE_POLL_INTERVAL = 1000;
    var baseURL = me.match(/^(.+\/)weather-outfit\.js$/)[1];
    var iframe = document.createElement('iframe');

    iframe.setAttribute('src', baseURL + 'tutorial/challenges.html');

    $('body').append(iframe);
    $(iframe).hide();

    setInterval(function() {
      var state = {};
      Object.keys(challenges).forEach(function(name) {
        var val = challenges[name];
        state[name] = typeof(val) == 'function' ? val() : val;
      });
      iframe.contentWindow.postMessage(JSON.stringify(state), '*');
    }, CHALLENGE_POLL_INTERVAL);
  });
})();
