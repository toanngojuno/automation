module.exports = {
    findByText: function(string) {
        return "//*[contains(translate(text(),'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '" + string + "')]";
    },

    findByClass: function(classString) {
        return "//*[contains(@class, '" + classString + "')]";
    },

    findByIndex: function(selector, index) {
        return '(' + selector + ')[' + index + ']';
    },

    // Xpath positioning starts at 1, so increment any numbers.
    at: function(xpathString, indexOrPosition) {
        var position  = _.isNumber(indexOrPosition) ? indexOrPosition + 1 : indexOrPosition;
        return "(" + xpathString + ")[" + position + "]";
    },

    last: function(xpathString) {
        return xpath.at(xpathString, "last()");
    },
};
