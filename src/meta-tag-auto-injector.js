(function() {
  if (!$('meta[name="viewport"]').length) {
    $('<meta name="viewport" content="width=device-width, user-scalable=no">')
      .appendTo('head');
  }

  if (!$('meta[name="apple-mobile-web-app-capable"]').length) {
    $('<meta name="apple-mobile-web-app-capable" content="yes">')
      .appendTo('head');
  }
})();
