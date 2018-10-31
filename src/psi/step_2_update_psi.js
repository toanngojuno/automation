const fs = require('fs');
const _ = require('lodash');

const PSI_FILE = './src/psi/file/psi.json';
const PSI = JSON.parse(fs.readFileSync(PSI_FILE).toString().trim());
const CREDENTIALS_FILE = './juno_credentials.csv';
const CREDENTIALS = fs.readFileSync(CREDENTIALS_FILE).toString().trim().split(',');
const USERNAME = CREDENTIALS[0];
const PASSWORD = CREDENTIALS[1];

module.exports = {
    'setting psi...': function (browser) {
        let admin = browser.page.admin();
        admin.navigate()
            .waitAndSetValue('@username', USERNAME)
            .waitAndSetValue('@password', PASSWORD)
            .waitAndClick('@login');
        _.forEach(PSI, (items, url) => {
            // browser.url(url);
            browser.url('https://juno-1.myharavan.com/admin/collection#/edit/1001468331');
            browser.pause(5000);
            let delete_button = ".flexbox-grid-default a[data-original-title='Xóa']";
            browser.elements('css selector', delete_button, function (result) {
                if (result.value.length === 0) {

                } else {
                    for (let i = 0; i < result.value.length; i++) {
                        browser.waitAndClick(delete_button);
                        browser.pause(5000);
                    }
                    browser.assert.elementCount(delete_button, 0);
                    browser.waitAndClick(".drop-select-search .btn[data-toggle='dropdown']");
                    _.forEachRight(items, item => {
                        browser.clearValue('.boxsearch .next-input');
                        browser.waitAndSetValue('.boxsearch .next-input', item);
                        browser.pause(5000)
                        browser.waitAndClick(`.list-search-data ul li`);
                        browser.pause(5000)
                    });
                    browser.assert.elementCount('.wrap-img', items.length);
                    _.forEach(items, (item, index) => {
                        browser.assert.containsText(`.wrap-group-collection:nth-child(${index + 1})`, item)
                    })
                }
            });
        })
    },
};
