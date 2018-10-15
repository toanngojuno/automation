const parse = require('csv-parse/lib/sync');
const fs = require('fs');

// INPUTS
const MODE = 2; // MODE: 1=SINGLE, 2=DOUBLE
const COMBO_PRICE = 600000; // NEEDED IF MODE == 1
const START_DATE_STR = '10/10/2018';
const END_DATE_STR = '20/10/2018';
const NUMBER_OF_SHEETS = 5;
// END INPUTS

const LAST_COMBO_FILE = `./src/tests/combo_${MODE}/last_added_combo.txt`;
const LAST_COMBO_NAME = fs.readFileSync(LAST_COMBO_FILE).toString().trim();
const CREDENTIALS_FILE = './juno_credentials.csv';
const CREDENTIALS = fs.readFileSync(CREDENTIALS_FILE).toString().trim().split(',');
const USERNAME = CREDENTIALS[0];
const PASSWORD = CREDENTIALS[1];

module.exports = {
    'adding combo...': function (browser) {
        var SKIP = true;
        let admin = browser.page.admin();
        admin.navigate()
            .waitAndSetValue('@username', USERNAME)
            .waitAndSetValue('@password', PASSWORD)
            .waitAndClick('@login');
        let plugins = browser.page.plugins();
        plugins.navigate();
        browser.frame('app-embed');
        plugins.waitAndClick('@newComboTab');

        for (let sheetNumber = 1; sheetNumber <= NUMBER_OF_SHEETS; sheetNumber++) {
            let data1 = fs.readFileSync(`./src/tests/combo_${MODE}/sheet_${sheetNumber}_column_1.csv`).toString();
            let data2 = MODE === 1 ? null : fs.readFileSync(`./src/tests/combo_${MODE}/sheet_${sheetNumber}_column_2.csv`).toString();
            let output1 = parse(data1, {delimiter: '\t'});
            let output2 = MODE === 1 ? output1 : parse(data2, {delimiter: '\t'});

            let count = 0;
            for (let i = 0; i < output1.length - (MODE === 1 ? 1 : 0); i++) {
                for (let j = (MODE === 1 ? i + 1 : 0); j < output2.length; j++) {
                    let product1 = output1[i], product2 = output2[j];
                    let combo = {
                        item1: {
                            sku: product1[0].trim(),
                            originalPrice: parseInt(product1[1]),
                            reductionPrice: MODE === 1 ? 0 : parseInt(product1[2]),
                        },
                        item2: {
                            sku: product2[0].trim(),
                            originalPrice: parseInt(product2[1]),
                            reductionPrice: MODE === 1
                                ? (parseInt(product1[1]) + parseInt(product2[1])) - COMBO_PRICE
                                : parseInt(product2[2]),
                        },
                        total: MODE === 1
                            ? COMBO_PRICE
                            : parseInt(product1[1]) + parseInt(product2[1]) - parseInt(product1[2]) - parseInt(product2[2]),
                    };
                    let comboName = getComboName(combo);
                    if (combo.item1.sku === combo.item2.sku) continue;
                    if (!LAST_COMBO_NAME) {
                        SKIP = false;
                    }
                    if (comboName === LAST_COMBO_NAME) {
                        SKIP = false;
                        continue;
                    }
                    if (SKIP) {
                        continue;
                    }
                    addCombo(combo, START_DATE_STR, END_DATE_STR);
                    count++;
                }
            }
            console.log(`Sheet ${sheetNumber} has ${count} combos left.`)
        }

        function addCombo(combo, startDateStr, endDateStr) {
            let comboName = getComboName(combo);
            let plugins = browser.page.plugins();
            // select products
            plugins.clearValue('@searchBox');
            plugins.waitAndSetValue('@searchBox', [combo.item1.sku, browser.Keys.ENTER]);
            browser.pause(10000);
            plugins.waitAndSetValue('@searchBox', ' ');
            plugins.clickAtIndex('@addProductButton', 0);

            plugins.clearValue('@searchBox');
            plugins.waitAndSetValue('@searchBox', [combo.item2.sku, browser.Keys.ENTER]);
            browser.pause(10000);
            plugins.waitAndSetValue('@searchBox', ' ');
            plugins.clickAtIndex('@addProductButton', 0);
            // set combo name
            plugins.waitAndSetValue('@comboName', comboName);
            // set start / end dates
            plugins.clearValue('@startDate');
            plugins.waitAndSetValue('@startDate', startDateStr);
            plugins.clearValue('@endDate');
            plugins.waitAndSetValue('@endDate', endDateStr);
            // product 1
            if (combo.item1.reductionPrice === 0) {
                plugins.waitAndClick('@firstProductNoSale');
            } else {
                plugins.waitAndClick('@firstProductSelect');
                plugins.clearValue('@firstProductSalePrice');
                plugins.waitAndSetValue('@firstProductSalePrice', combo.item1.reductionPrice);
            }
            // product 2
            if (combo.item2.reductionPrice === 0) {
                plugins.waitAndClick('@secondProductNoSale');
            } else {
                plugins.waitAndClick('@secondProductSelect');
                plugins.clearValue('@secondProductSalePrice');
                plugins.waitAndSetValue('@secondProductSalePrice', combo.item2.reductionPrice);
            }
            // save combo and continue
            plugins.click('@saveButton', function () {
                fs.writeFile(LAST_COMBO_FILE, comboName, (err) => {
                    if (err) throw err;
                });
            });
            browser.pause(2000);
            plugins.waitAndClick('@backButton');
            plugins.navigate();
            browser.frame('app-embed');
            plugins.waitAndClick('@newComboTab');
        }

        function getComboName(combo) {
            return `Combo ${combo.item1.sku} ${combo.item2.sku} ${combo.total} - AUTOMATION`;
        }
    },
};
