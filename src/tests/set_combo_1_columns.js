let parse = require('csv-parse');
let fs = require('fs');

// INPUTS
let USERNAME = 'xxx';
let PASSWORD = 'xxx';
let START_DATE_STR = '10/10/2018';
let END_DATE_STR = '20/10/2018';
let NUMBER_OF_SHEETS = 1;
let LAST_COMBO_FILE = './src/tests/combo_1/last_added_combo.txt';
let LAST_COMBO_NAME = fs.readFileSync(LAST_COMBO_FILE).toString().trim();
let COMBO_PRICE = 600000;

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
            let data = fs.readFileSync(`./src/tests/combo_1/sheet_${sheetNumber}_column_1.csv`).toString();
            parse(data, {delimiter: '\t'}, function (err, output) {
                let count = 0;
                for (let i = 0; i < output.length - 1; i++) {
                    for (let j = i + 1; j < output.length; j++) {
                        let product1 = output[i], product2 = output[j];
                        let combo = {
                            item1: {
                                sku: product1[0].trim(),
                                originalPrice: parseInt(product1[1]),
                                reductionPrice: 0
                            },
                            item2: {
                                sku: product2[0].trim(),
                                originalPrice: parseInt(product2[1]),
                                reductionPrice: (parseInt(product1[1]) + parseInt(product2[1])) - COMBO_PRICE
                            },
                            total: COMBO_PRICE,
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
                console.log(count);
            })
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
