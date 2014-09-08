function getCurrHash() {
  return window.location.hash.slice(1) || 'start';
}

function setupHistory() {
  var HISTORY_START = getStorage('hashHistory', []);

  var hashHistory = Bacon.update(
    HISTORY_START,

    [$('#back').asEventStream('click')],
    function(history) { return history.slice(0, -1); },

    [$('body').asEventStream('click', 'a[href^="#"]', getCurrHash)],
    function(history, hash) { return history.concat(hash); }
  );

  var poppedHashes = hashHistory
    .diff(HISTORY_START, function(prev, curr) {
      return prev.length > curr.length ? prev[prev.length-1] : null;
    })
    .filter(function(hash) { return hash !== null; });

  var isHistoryEmpty = hashHistory.map(function(history) {
    return history.length == 0;
  });

  hashHistory.onValue(setStorage.bind(null, 'hashHistory'));

  poppedHashes.onValue(function(hash) {
    window.location.hash = '#' + hash;
  });

  isHistoryEmpty.assign($('#back'), 'attr', 'disabled');
}

function setupNavigation() {
  var LAST_HASH = getStorage('lastHash', 'start');
  var IN_IFRAME = (window.parent !== window);

  if (IN_IFRAME) window.location.replace('#' + LAST_HASH);

  var currHash = $(window)
    .asEventStream('hashchange', getCurrHash)
    .toProperty(getCurrHash());

  var isAtBeginning = currHash.map(function(hash) {
    return hash == 'start';
  });

  setupHistory();
  isAtBeginning.assign($('#restart'), 'attr', 'disabled');

  if (IN_IFRAME)
    currHash.onValue(setStorage.bind(null, 'lastHash'));

  currHash.onValue(function(hash) {
    var el = document.getElementById(hash) || 
             document.getElementById('404');
    $('section').hide();
    $(el).show();
  });

  $('#restart').asEventStream('click').onValue(function() {
    window.location.hash = '';
  });
}

function setupChallenges() {
  var START_DATE = Date.now();

  function propAsBool(prop) {
    return function(obj) { return !!obj[prop]; };
  }

  var challenges = Bacon.fromPoll(1000, function() {
    var challenges = getStorage('challenges', {});
    if (!(challenges.date > START_DATE &&
          challenges.date > Date.now() - 5000))
      return new Bacon.Next({});
    return new Bacon.Next(challenges.data || {});
  });

  challenges.map(propAsBool('loaded'))
    .assign($('[data-show-when-challenge-done="loaded"]'),
            'toggleClass', 'done');
}

$(function() {
  $('pre').each(function() {
    $(this).text(Mustache.render($(this).text(), {baseURL: baseURL}));
  });

  CodeMirror.colorize();

  $('body').tutorial({
    paginate: false
  });

  setupNavigation();
  setupChallenges();
});
