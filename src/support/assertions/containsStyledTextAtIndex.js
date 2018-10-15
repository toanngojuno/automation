var helpers = require('../custom_helpers');

// Asserts the element identified by the 'selector' and 'index' contains 'styledText'.
// Usage: browser.containsStyledTextAtIndex('.item', 3, 'fourth [b]item[/b]');
// See custom_helpers/setupGetStyledText for details.
exports.assertion = function (selector, index, styledText) {
    selector = helpers.getSelector(selector);

    this.message = 'Testing if element <' + selector + '>[' + index + '] has styled text: ' + styledText;
    this.expected = styledText;
    this.pass = function (val) {
        return _.includes(val, this.expected);
    }
    this.value = function (res) {
        return res.value;
    }
    this.command = function (cb) {
        helpers.setupGetStyledText(this.api); // Setup window.getStyledText.

        var self = this;
        return this.api.execute(function (selector, index) {
            var elements = document.querySelectorAll(selector);
            if (elements.length > index) {
                return window.getStyledText(elements[index]);
            } else {
                return false;
            }
        }, [selector, index], function (res) {
            cb.call(self, res);
        })
    }
}