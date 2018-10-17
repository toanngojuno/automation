const parse = require('csv-parse/lib/sync');
const fs = require('fs');

// INPUTS
const ITEMS_TO_DELETE = 5000;
// END INPUTS

const LAST_COMBO_FILE = `./src/tests/combo_${MODE}/last_added_combo.txt`;
const LAST_COMBO_NAME = fs.readFileSync(LAST_COMBO_FILE).toString().trim();
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
        plugins.waitAndClick('@newComboTab');

        for (let i = 0; i < )
    },
};
