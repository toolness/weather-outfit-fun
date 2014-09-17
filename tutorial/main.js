function getCurrHash() {
  return window.location.hash.slice(1) || 'start';
}

function setupHistory() {
  var HISTORY_START = getStorage('hashHistory', []);

  var hashHistory = Bacon.update(
    HISTORY_START,

    [$('[role=back]').asEventStream('click')],
    function(history) { return history.slice(0, -1); },

    [$('body').asEventStream('click', 'a[href^="#"]', getCurrHash)],
    function(history, hash) { return history.concat(hash); },

    [$('body').asEventStream('click', '[data-navigate-to]')],
    function(history, event) {
      history = history.concat(getCurrHash());
      window.location.hash = '#' + $(event.target).attr('data-navigate-to');
      return history;
    }
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

  isHistoryEmpty.assign($('[role=back]'), 'attr', 'disabled');
}

function setupNavigation() {
  var LAST_HASH = getStorage('lastHash', 'start');
  var IN_IFRAME = (window.parent !== window);

  if (IN_IFRAME) window.location.replace('#' + LAST_HASH);

  var currHash = $(window)
    .asEventStream('hashchange', getCurrHash)
    .toProperty(getCurrHash());

  setupHistory();

  $('[data-navigate-to]').each(function() {
    var id = $(this).attr('data-navigate-to');
    currHash.map(function(hash) { return hash == id; })
      .assign($(this), 'attr', 'disabled');
  });

  if (IN_IFRAME)
    currHash.onValue(setStorage.bind(null, 'lastHash'));

  currHash.onValue(function(hash) {
    var el = document.getElementById(hash) || 
             document.getElementById('404');
    $('section').hide();
    $(el).show();
  });
}

function setupChallenges() {
  var START_DATE = Date.now();

  var challenges = Bacon.fromPoll(1000, function() {
    var challenges = getStorage('challenges', {});
    if (!(challenges.date > START_DATE &&
          challenges.date > Date.now() - 5000))
      return new Bacon.Next({});
    return new Bacon.Next(challenges.data || {});
  });

  $('section[role=challenge]').each(function() {
    var section = $(this);
    var id = section.attr('data-challenge-id') || section.attr('id');
    var li = $('<li><a></a></li>').appendTo('[role=challenges]');
    var isComplete = challenges.map(function(info) { return !!info[id]; });

    $('a', li)
      .attr('href', '#' + section.attr('id'))
      .text($('h1', section).text());

    isComplete.assign(section.add(li), 'toggleClass', 'challenge-completed');
  });
}

function applyColorizedCodeChanges(oldPre, newPre) {
  var changes = [];
  if (oldPre.childNodes.length != newPre.childNodes.length) return;
  for (var i = 0; i < oldPre.childNodes.length; i++) {
    var oldChild = oldPre.childNodes[i];
    var newChild = newPre.childNodes[i];
    if ($(oldChild).text() != $(newChild).text())
      changes.push([newChild, oldChild]);
  }
  changes.forEach(function(change) {
    var wrapper = $('<span class="changed-code"></span>').append(change[0]);
    oldPre.replaceChild(wrapper[0], change[1]);
  });
}

function setupSnippetWizards() {
  $('form[role=snippet-wizard]').on('change keyup', function() {
    var context = {};
    var template = $('pre[role=template]', this).text();
    var $new = $('<pre data-lang="javascript"></pre>');
    var $old = $('pre[data-lang=javascript]', this);
    [].slice.call(this.elements).forEach(function(control) {
      var stringify = control.hasAttribute('data-stringify');
      if (stringify)
        context[control.name] = JSON.stringify(control.value);
      else
        context[control.name] = control.value;
    });
    $new.text(Mustache.render(template, context));
    CodeMirror.colorize($new.get());
    if ($old.length == 0)
      $new.appendTo(this);
    else
      applyColorizedCodeChanges($old[0], $new[0]);
  }).trigger('change');
}

function setupTableOfContents() {
  var toc = $('<ul></ul>');

  $('section').each(function() {
    var section = $(this);
    var li = $('<li><a></a></li>').appendTo(toc);

    $('a', li)
      .attr('href', '#' + section.attr('id'))
      .text($('h1', section).text());
  });

  $('<section id="toc"></section>')
    .text('This table of contents is for debugging purposes only. ' +
          'Normal users won\'t see it.')
    .prepend($('<h1>Table of Contents</h1>'))
    .append(toc).appendTo('body');
}

$(function() {
  $('pre[data-baseurlify]').each(function() {
    $(this).text(Mustache.render($(this).text(), {baseURL: baseURL}));
  });

  CodeMirror.colorize();

  $('body').tutorial({
    paginate: false
  });

  setupTableOfContents();
  setupNavigation();
  setupChallenges();
  setupSnippetWizards();
});
