exports.command = function (selector, value) {
  return this.waitForElementVisible(selector).setValue(selector, value);
};
