function setTemplateDefault(id, defaultValue) {
  if ($('#' + id).length) return;

  $('<div style="display: none"></div>')
    .attr('id', id)
    .text(defaultValue)
    .appendTo('body');
}

$.fn.extend({
  render: function(templateId, ctx) {
    this.html(_.template($('#' + templateId).text(), ctx));
  }
});
