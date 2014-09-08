(function() {
  function isCssLoaded() {
    var $el = $('<div class="i-should-be-tall"></div>').appendTo('body');
    var isTall = $el.height() > 0;
    $el.remove();
    return isTall;
  }

  var me = document.scripts[document.scripts.length-1].src;

  $(function() {
    var CHALLENGE_POLL_INTERVAL = 1000;
    var baseURL = me.match(/^(.+\/)weather-outfit\.js$/)[1];
    var iframe = document.createElement('iframe');

    iframe.setAttribute('src', baseURL + 'tutorial/challenges.html');

    $('body').append(iframe);
    $(iframe).hide();

    setInterval(function() {
      iframe.contentWindow.postMessage(JSON.stringify({
        load: true,
        style: isCssLoaded()
      }), '*');
    }, CHALLENGE_POLL_INTERVAL);
  });
})();
