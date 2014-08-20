var Template = {
  setDefault: function setTemplateDefault(id, defaultValue) {
    if ($('#' + id).length) return;

    $('<div style="display: none"></div>')
      .attr('id', id)
      .text(defaultValue)
      .appendTo('body');
  },
  render: function renderTemplate(target, templateId, ctx) {
    target.html(Mustache.render($('#' + templateId).text(), ctx));
  }
};
