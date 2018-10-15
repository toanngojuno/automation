var helpers = require('../custom_helpers');

// Asserts the "selector" has "count" elements.
// Usage: browser.elementCount('.item', 4);
exports.assertion = function (selector, count) {
    selector = helpers.getSelector(selector);

    this.message = 'Testing if element <' + selector + '> has count: ' + count;
    this.expected = count;
    this.pass = function (val) {
        return val === this.expected;
    }
    this.value = function (res) {
        return res.value;
    }
    this.command = function (cb) {
        var self = this;
        return this.api.execute(function (selector) {
            return document.querySelectorAll(selector).length;
        }, [selector], function (res) {
            cb.call(self, res);
        })
    }
}
