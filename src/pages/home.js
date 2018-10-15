module.exports = {
    url: function() {
        return 'https://juno.vn/'
    },
    commands: [{
        clickMenu: function(index) {
            return this.api.waitAndClick('.menu-top li[data-position=\'' + index + '\']');
        }
    }],
    elements: {
        menuTop: '.menu-top'
    }
};