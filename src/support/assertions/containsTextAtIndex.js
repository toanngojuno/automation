var helpers = require('../custom_helpers');

// Asserts the element identified by the 'selector' and 'index' contains 'text'.
// Usage: browser.containsTextAtIndex('.item', 3, 'fourth item');
exports.assertion = function (selector, index, text) {
    selector = helpers.getSelector(selector);

    this.message = 'Testing if element <' + selector + '>[' + index + '] has text: ' + text;
    this.expected = text;
    this.pass = function (val) {
        return _.includes(val, this.expected);
    }
    this.value = function (res) {
        return res.value;
    }
    this.command = function (cb) {
        var self = this;
        return this.api.execute(function (selector, index) {
            var elements = document.querySelectorAll(selector);
            if (elements.length > index) {
                // Return the element's text content.
                // We reduce all whitespace (including newlines) to a single space.
                return elements[index].textContent.replace(/\s\s+/g, ' ').replace(/\n/g, ' ').trim();
            } else {
                return false;
            }
        }, [selector, index], function (res) {
            cb.call(self, res);
        })
    }
}