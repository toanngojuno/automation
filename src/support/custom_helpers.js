module.exports = {
    // The param "selector" that is passed to a custom command or assertion
    // can be an array of selector, or a string.
    // It's an array when a custom command is called from a section, and
    // this array cannot be used straight away in a command, because nightwatch
    // or selenium encode it in JSON, but the array itself has circular references
    // that json doesn't like. So we extract the selectors for each item
    // of the array and return it.
    getSelector: function(selector) {
        if (Array.isArray(selector)) {
            var ret = '';
            for (var i = 0; i < selector.length; i++) {
                ret += selector[i].selector + ' ';
            }
            return ret;
        } else {
            return selector;
        }
    },

    // Sets up window.getStyledText() to be used by our containsStyledText* assertions.
    // getStyledText will recursively walk node's children and return a string with
    // style markings.
    // Markings:
    //      [b]bold[/b]
    //      [s]strike-through[/s]
    //      [i]italic[/i]
    //      [b][i][s]all three, note order[/s][/i][/b]
    setupGetStyledText: function(api) {
        api.execute(function () {
            window.getStyledText = function(node) {
                // Ignore comment nodes.
                if (node.nodeType === Node.COMMENT_NODE) { return ""; }

                // Return trimmed text content if this is a leaf node.
                if (node.childNodes.length === 0) { return node.textContent.trim(); }

                // Recursively collect styled text of children.
                var ret = "";
                node.childNodes.forEach(function(node) {
                    ret += window.getStyledText(node) + " ";
                });
                ret = ret.trim();

                // Wrap children content if our current node has styles.
                var $node = $(node);

                // Check for strike-through.
                if ($node.css('text-decoration').includes('line-through')) {
                    ret = "[s]" + ret + "[/s]";
                }

                // Check for italics.
                if ($node.css('font-style') === "italic") {
                    ret = "[i]" + ret + "[/i]";
                }

                // Check for bold.
                if (($node.css('font-weight') === "700") ||
                    ($node.css('font-weight') === "bold")) {
                    ret = "[b]" + ret + "[/b]";
                }

                // Reduce all whitespace (including newlines) to a single space.
                // Additionally, fixup any commas with a preceding space (e.g. "foo , bar" -> "foo, bar").
                return ret.replace(/\s\s+/g, ' ').replace(/\n/g, ' ').replace(/ ,/g, ',').trim();
            };
        });
    },

    //Scrolls to selector
    scrollTo: function(api, selector) {
        var scrollInBrowser = function(selector) {
            scrollTo(0, window.scrollY + (document.querySelector(selector).getBoundingClientRect().top - window.innerHeight/2));
            return true;
        };
        api.execute(scrollInBrowser, [selector], function(results) {
            if (results.status > 0) {
                console.log(results);
            }
        }.bind(this));
    },
};
