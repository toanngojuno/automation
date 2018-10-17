const parse = require('csv-parse/lib/sync');
const fs = require('fs');

// INPUTS
// END INPUTS

const PRODUCT_LIST_FILE = `./src/lazada/product_list.csv`;
const OSS_CREDENTIALS = fs.readFileSync('./oss_credentials.csv').toString().trim().split(',');
const LAZADA_CREDENTIALS = fs.readFileSync('./lazada_credentials.csv').toString().trim().split(',');
const CREDENTIALS = {
    OSS: {username: OSS_CREDENTIALS[0], password: OSS_CREDENTIALS[1]},
    LAZADA: {username: LAZADA_CREDENTIALS[0], password: LAZADA_CREDENTIALS[1]}
};
const STORE = 'CH051';

module.exports = {
    'updating Lazada Inventory...': function (browser) {
        let oss_home = browser.page.oss_home();
        admin.navigate()
            .waitAndSetValue('@username', USERNAME)
            .waitAndSetValue('@password', PASSWORD)
            .waitAndClick('@login');
    },
};
