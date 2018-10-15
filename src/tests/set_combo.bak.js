module.exports = {
    'collect order data': function (browser) {
        let parse = require('csv-parse');
        let fs = require('fs');
        let START_COMBO = 'Combo BB01121 SD01062 600K';
        var SKIP = true;
        let COMBO_PRICE = 600000;
        let START_DATE_STR = '10/10/2018';
        let END_DATE_STR = '21/10/2018';
        let data = fs.readFileSync('./src/tests/giay.csv').toString();
        let admin = browser.page.admin();
        admin.navigate()
            .waitAndSetValue('@username', 'xxx')
            .waitAndSetValue('@password', 'xxx')
            .waitAndClick('@login');
        let plugins = browser.page.plugins();
        plugins.navigate();
        browser.frame('app-embed');
        plugins.waitAndClick('@newComboTab');
        // plugins.waitAndClick('@newComboTab');
        parse(data, function (err, output) {
            var count = 0;
            for (var i = 0; i < output.length - 1; i++) {
                for (var j = i + 1; j < output.length; j++) {
                    let product1 = output[i];
                    let product2 = output[j];
                    let combo = {
                        item1: {sku: product1[0], originalPrice: parseInt(product1[1]), reductionPrice: 0},
                        item2: {
                            sku: product2[0],
                            originalPrice: parseInt(product2[1]),
                            reductionPrice: (parseInt(product1[1]) + parseInt(product2[1])) - COMBO_PRICE
                        },
                    };
                    let comboName = getComboName(combo);
                    if (comboName === START_COMBO) {
                        SKIP = false;
                        continue;
                    }
                    if (SKIP) { continue; }
                    addCombo(combo, START_DATE_STR, END_DATE_STR);
                    count++;
                }
            }
            console.log(count);
        });

        function addCombo(combo, startDateStr, endDateStr) {
            let comboName = getComboName(combo);
            let plugins = browser.page.plugins();
            // select products
            plugins.clearValue('@searchBox');
            plugins.waitAndSetValue('@searchBox', [combo.item1.sku, browser.Keys.ENTER]);
            browser.pause(10000);
            plugins.clickAtIndex('@addProductButton', 0);
            plugins.clearValue('@searchBox');
            plugins.waitAndSetValue('@searchBox', [combo.item2.sku, browser.Keys.ENTER]);
            browser.pause(10000);
            plugins.clickAtIndex('@addProductButton', 0);
            // set combo name
            plugins.waitAndSetValue('@comboName', comboName);
            // set start / end dates
            plugins.clearValue('@startDate');
            plugins.waitAndSetValue('@startDate', startDateStr);
            plugins.clearValue('@endDate');
            plugins.waitAndSetValue('@endDate', endDateStr);
            // product 1: no price reduction
            plugins.waitAndClick('@firstProductNoSale');
            // product 2: has price reduction
            plugins.waitAndClick('@secondProductSelect');
            plugins.clearValue('@secondProductSalePrice');
            plugins.waitAndSetValue('@secondProductSalePrice', combo.item2.reductionPrice);
            // save combo and continue
            plugins.click('@saveButton', function() {
                console.log("added: " + comboName);
            });
            plugins.waitAndClick('@backButton');
            plugins.waitAndClick('@newComboTab');
        }

        function getComboName(combo) {
            return 'Combo ' + combo.item1.sku + ' ' + combo.item2.sku + ' 600K';
        }
    },
};
