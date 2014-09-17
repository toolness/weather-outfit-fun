var Template = {
  render: function renderTemplate(target, filename, ctx) {
    var template = $('[data-filename="' + filename + '"]').html() ||
                   RAW_FILES[filename];
    target.html(Mustache.render(template, ctx));
  }
};
