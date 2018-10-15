var helpers = require('../custom_helpers');

exports.command = function (selector, index, text) {
    this.waitForElementVisible(selector);
    selector = helpers.getSelector(selector);

    return this.execute(function (selector, index, text) {
        var elements = document.querySelectorAll(selector);
        if ((elements.length > index) || (elements.length > 0 && index == -1)) {
            if (index == -1) {
                index = elements.length - 1;
            }
            elements[index].scrollIntoView(false);
            elements[index].value = text;
            // angular listens to `input` event to trigger
            elements[index].dispatchEvent(new Event('input', {
                'bubbles': true,
                'cancelable': true
            }));
            // Additionally send a blur event in case the input action is triggered on blur.
            elements[index].dispatchEvent(new Event('blur', {
                'bubbles': true,
                'cancelable': true
            }));

            return true;
        } else {
            return false;
        }
    }, [selector, index, text]);
}
