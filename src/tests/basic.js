module.exports = {
    'login' : function(browser) {
        let home = browser.page.home();
        let details = browser.page.details();
        home.navigate().assert.visible('@menuTop');
        home.clickMenu(2);
        browser.waitAndClick('.product-information');
        details.waitAndClick('@buyButton');
    },
};
