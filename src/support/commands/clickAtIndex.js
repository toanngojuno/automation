var helpers = require('../custom_helpers');

exports.command = function (selector, index) {
    this.waitForElementVisible(selector);
    selector = helpers.getSelector(selector);

    return this.execute(function (selector, index) {
        var elements = document.querySelectorAll(selector);
        if (elements.length > index) {
            scrollTo(0,window.scrollY + (elements[index].getBoundingClientRect().top - window.innerHeight/2));
            elements[index].click();
            return true;
        } else {
            return false;
        }
    }, [selector, index]);
}
