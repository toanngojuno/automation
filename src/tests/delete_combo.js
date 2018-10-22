const fs = require('fs');

// INPUTS
const ITEMS_TO_DELETE = 10000;
// END INPUTS
const CREDENTIALS_FILE = './juno_credentials.csv';
const CREDENTIALS = fs.readFileSync(CREDENTIALS_FILE).toString().trim().split(',');
const USERNAME = CREDENTIALS[0];
const PASSWORD = CREDENTIALS[1];

module.exports = {
    'deleting combo...': function (browser) {
        let admin = browser.page.admin();
        admin.navigate()
            .waitAndSetValue('@username', USERNAME)
            .waitAndSetValue('@password', PASSWORD)
            .waitAndClick('@login');
        let plugins = browser.page.plugins();
        plugins.navigate();
        browser.frame('app-embed');

        for (let i = 0; i < ITEMS_TO_DELETE; i++) {
            plugins.clickAtIndex('@deleteButton', 1);
            plugins.click('.btnOk');
            browser.pause(500);
        }
    },
};
