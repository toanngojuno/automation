const parse = require('csv-parse/lib/sync');
const fs = require('fs');

const RETRIEVE_DONE_FILE = './src/lazada/oss_stock_done.txt';
const BARCODE_FILE = './src/lazada/oss_barcodes.csv';
const LAST_RETRIEVED_SKU_GROUP_FILE = './src/lazada/oss_last_retrieved_sku_group.txt';
const LAST_RETRIEVED_SKU_GROUP = fs.readFileSync(LAST_RETRIEVED_SKU_GROUP_FILE).toString().trim();
const PRODUCT_LIST_FILE = `./src/lazada/product_list.csv`;
const OSS_CREDENTIALS = fs.readFileSync('./oss_credentials.csv').toString().trim().split(',');
const CREDENTIALS = {
    OSS: {USERNAME: OSS_CREDENTIALS[0], PASSWORD: OSS_CREDENTIALS[1]},
};
const STORE = 'CH051';
const STOCK_OFFSET = 3;

module.exports = {
    'Retrieving Stock from OSS...': function (browser) {
        let oss_home = browser.page.oss_home();
        let oss_stock = browser.page.oss_stock();
        let skuList = fs.readFileSync(PRODUCT_LIST_FILE).toString().trim().split('\n');
        oss_home.navigate()
            .waitAndSetValue('@username', CREDENTIALS.OSS.USERNAME)
            .waitAndSetValue('@password', CREDENTIALS.OSS.PASSWORD)
            .waitAndClick('@login');
        oss_stock.navigate();
        oss_stock.waitForElementNotVisible('@loading')
            .waitAndClick('@pageLimitButton')
            .waitAndClick('@limit100');
        oss_stock.waitForElementNotVisible('@loading')
            .waitAndClick('@storeDropDown')
            .waitAndClick('@deselectAllStores')
            .waitAndSetValue('@storeSearchInput', [STORE, browser.Keys.ENTER]);
        let skuGroups = combineSkus(skuList, 5);
        
        let skipGroup = true;
        for (let i = 0; i < skuGroups.length; i++) {
            let group = skuGroups[i];
            if (!LAST_RETRIEVED_SKU_GROUP) skipGroup = false;
            if (group.toString() === LAST_RETRIEVED_SKU_GROUP) {
                skipGroup = false;
                continue;
            }
            if (skipGroup) {
                continue;
            }
            oss_stock.click('@clearSearchResult');
            group.forEach(sku => {
                oss_stock.clearValue('@productSearchInput')
                    .waitAndSetValue('@productSearchInput', sku)
                    .waitForElementNotPresent('@searchLoading')
                    .waitAndClick('@firstSearchResult');
            });
            oss_stock.click('@clearWrongSearch');
            oss_stock.assert.elementCount('@searchItem', group.length);
            oss_stock.waitAndClick('@submitSearch')
                .waitForElementNotVisible('@loading');
            browser.elements('css selector', '#reportcontain tbody tr', function (result) {
                let els = result.value;
                els.forEach(function (el) {
                    browser.elementIdText(el.ELEMENT, function (text) {
                        text = text.value;
                        let sku = '';
                        group.forEach(_sku => {
                            if (text.indexOf(_sku) >= 0) {
                                sku = _sku;
                            }
                        });
                        text = text.trim().split(' ');
                        let barcode = text[1];
                        let stock = parseInt(text[text.length - 1]) - STOCK_OFFSET;
                        if (stock < 0) stock = 0;
                        let barcodeWriter, lastAddedWriter;
                        try {
                            barcodeWriter = fs.openSync(BARCODE_FILE, 'a');
                            fs.appendFileSync(barcodeWriter, `${sku},${barcode},${stock}\n`, 'utf8');
                            fs.writeFileSync(LAST_RETRIEVED_SKU_GROUP_FILE, group);
                            if (i === skuGroups.length - 1) {
                                fs.writeFileSync(RETRIEVE_DONE_FILE, 'DONE');
                            }
                        } catch (err) {
                        } finally {
                            if (barcodeWriter !== undefined) fs.closeSync(barcodeWriter);
                            if (lastAddedWriter !== undefined) fs.closeSync(lastAddedWriter);
                        }
                    });
                });
            });
        }
    },
};

function combineSkus(skuList, n) {
    let skuGroups = []; // add 5 at a time
    let currentGroup = [];
    skuList.forEach((sku, index) => {
        if (index % n !== 0) {
            currentGroup.push(sku);
        } else {
            if (currentGroup.length > 0) {
                skuGroups.push(currentGroup);
            }
            currentGroup = [sku];
        }
    });
    if (currentGroup.length > 0) {
        skuGroups.push(currentGroup);
    }
    return skuGroups;
}
