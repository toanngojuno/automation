var helpers = require('../custom_helpers');
var containsStyledTextAtIndex = require('./containsStyledTextAtIndex');

// Asserts the element identified by the 'selector' contains 'styledText'.
// Usage: browser.containsStyledTextAtIndex('.item', 'fourth [b]item[/b]');
// See custom_helpers/setupGetStyledText for details.
exports.assertion = function (selector, styledText) {
    return containsStyledTextAtIndex(selector, 0, styledText);
}
