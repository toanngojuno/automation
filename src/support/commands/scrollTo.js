var helpers = require('../custom_helpers');

exports.command = function (selector) {
  var sel = typeof selector !== 'string' ? selector[1].selector : selector;
  helpers.scrollTo(this, sel);
};
