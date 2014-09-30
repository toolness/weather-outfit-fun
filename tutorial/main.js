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
    if (!window.DEBUG) $('section').hide();
    $(el).show().trigger('show');
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

function setupBlockly() {
  var section = $('#blockly');
  var pre = $('pre', section);
  var Blockly;
  var getJs = function(statementPrefix) {
    Blockly.JavaScript.STATEMENT_PREFIX = statementPrefix || null;

    var code = Blockly.JavaScript.workspaceToCode();
    var indentedCode = code.split('\n').map(function(line) {
      return line.trim() ? '  ' + line : line;
    }).join('\n');

    return 'function getForecastOutfit(forecast) {\n' +
           indentedCode + '}';
  };

  section.one('show', function() {
    var iframe = document.createElement('iframe');

    iframe.setAttribute('src', 'blockly.html');
    iframe.addEventListener('load', function() {
      Blockly = this.contentWindow.Blockly;

      function renderCode() {
        pre.empty().text(getJs());
        CodeMirror.colorize(pre.get());
      }

      Blockly.addChangeListener(renderCode);
      renderCode();
    }, false);
    $('.iframe-holder').append(iframe);
  });

  $('form[role=debugger]', section).on('submit', function(e) {
    e.preventDefault();

    if (!Blockly) return;

    var HIGHLIGHT_DELAY = 500;
    var highlights = [];
    var buttons = $('button', this);
    var code = getJs('queueHighlight(%1);\n');
    var queueHighlight = function(id) {
      if (id) highlights.push(id.toString());
    };
    var showNextHighlight = function() {
      Blockly.mainWorkspace.traceOn(true);
      Blockly.mainWorkspace.highlightBlock(highlights.shift());
      if (highlights.length == 0)
        return buttons.attr('disabled', null);;
      setTimeout(showNextHighlight, HIGHLIGHT_DELAY);
      // TODO: Should we set trace back on in the meantime?
    };
    var amount = parseInt($('[name=amount]', this).val());
    var unit = $('[name=unit]', this).val();
    var forecast = {weather: $('[name=weather]', this).val()};

    if (unit == 'f')
      forecast.temp = {f: amount, c: Math.round((amount - 32) * 5/9)};
    else
      forecast.temp = {c: amount, f: Math.round(amount * 9/5 + 32)};

    eval('(' + code + ')(' + JSON.stringify(forecast) + ');');

    if (highlights.length == 0) return;
    buttons.attr('disabled', '');
    showNextHighlight();
  });
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
    .append(toc).prependTo('body');
}

function setupTemplateSource() {
  $.getJSON('../src/config.json', function(config) {
    var filenames = Bacon.fromArray(config.RAW_FILES);
    var html = filenames.flatMap(function(filename) {
      return Bacon.fromCallback(function(cb) {
        $.get('../src/' + filename, function(contents) {
          return cb([
            '<div style="display: none" data-filename="' + filename + '">',
            contents,
            '</div>'
          ]);
        });
      });
    }).fold([], '.concat').map('.join', '\n').onValue(function(text) {
      var pre = $('<pre data-lang="htmlmixed"></pre>').text(text);
      CodeMirror.colorize(pre.get());
      $('[role="template-source"]').empty().append(pre);
    });
  });
}

function setupDebugMode() {
  if (typeof(window.DEBUG) != 'boolean')
    window.DEBUG = /debug=on/.test(window.location.search);

  if (window.DEBUG) {
    $('html').addClass('debug');
    $('section[id]').each(function() {
      var id = $(this).attr('id');
      $('<h1 class="debug"></h1>')
        .append($('<a></a>').attr('href', '#' + id).text('section#' + id))
        .prependTo(this);
    });
  }
}

$(function() {
  $('a[target]').each(function() {
    $(this).append($('<i class="fa fa-external-link"></i>'));
  });

  $('pre[data-baseurlify]').each(function() {
    $(this).text(Mustache.render($(this).text(), {baseURL: baseURL}));
  });

  CodeMirror.colorize();

  $('body').tutorial({
    paginate: false
  });

  setupTableOfContents();
  setupDebugMode();
  setupBlockly();
  setupNavigation();
  setupChallenges();
  setupSnippetWizards();
  setupTemplateSource();
});
