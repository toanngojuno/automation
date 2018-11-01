const fs = require("fs");
const _ = require("lodash");

const PSI_FILE = "./src/psi/file/psi.json";
const PSI = JSON.parse(
  fs
    .readFileSync(PSI_FILE)
    .toString()
    .trim()
);
const CREDENTIALS_FILE = "./juno_credentials.csv";
const CREDENTIALS = fs
  .readFileSync(CREDENTIALS_FILE)
  .toString()
  .trim()
  .split(",");
const USERNAME = CREDENTIALS[0];
const PASSWORD = CREDENTIALS[1];

const LAST_UPDATED_URL_FILE = "./src/psi/file/last_updated_url.txt";
const LAST_UPDATED_URL = fs
  .readFileSync(LAST_UPDATED_URL_FILE)
  .toString()
  .trim();

const LAST_PRODUCT_FILE = "./src/psi/file/last_product.txt";
const LAST_PRODUCT = fs
  .readFileSync(LAST_PRODUCT_FILE)
  .toString()
  .trim();

module.exports = {
  "setting psi...": function(browser) {
    let admin = browser.page.admin();
    admin
      .navigate()
      .waitAndSetValue("@username", USERNAME)
      .waitAndSetValue("@password", PASSWORD)
      .waitAndClick("@login");
    let skip = true;
    _.forEach(PSI, (items, url) => {
      if (!LAST_UPDATED_URL) skip = false;
      if (LAST_UPDATED_URL == url) {
        skip = false;
        return;
      }
      if (skip) return;
      browser.perform(() => {
        fs.writeFileSync(LAST_PRODUCT_FILE, "");
      });
      // browser.url(url);
      // browser.url("https://juno-1.myharavan.com/admin/collection#/edit/1001468331"); // TEST 1
      browser.url("https://juno-1.myharavan.com/admin/collection#/edit/1001473845"); // TEST 2
      browser.pause(5000);
      let delete_button = ".flexbox-grid-default a[data-original-title='Xóa']";
      browser.elements("css selector", delete_button, function(result) {
        if (result.value.length === 0) {
          let skip = true;
          _.forEachRight(items, item => {
            if (!LAST_PRODUCT) skip = false;
            if (LAST_PRODUCT == item) {
              skip = false;
              return;
            }
            if (skip) return;
            let selector =
              "//div[contains(@class, 'wrap-group-collection') and contains(.,'" + item + "')]";
            browser
              .useXpath()
              .waitAndClick(selector + "//img")
              .moveTo(selector + "//img")
              .pause(1000)
              .click(selector + "//a[contains(@class, 'uptoTop')]")
              .pause(5000)
              .useCss();
            browser.assert.containsText(`.wrap-group-collection:first-child`, item);
            browser.perform(() => {
              fs.writeFileSync(LAST_PRODUCT_FILE, item);
            });
          });
          browser.useCss();
          _.forEach(items, (item, index) => {
            browser.assert.containsText(`.wrap-group-collection:nth-child(${index + 1})`, item);
          });

          browser.perform(() => {
            fs.writeFileSync(LAST_UPDATED_URL_FILE, url);
          });
        } else {
          for (let i = 0; i < result.value.length; i++) {
            browser.waitAndClick(delete_button);
            browser.pause(5000);
          }
          browser.assert.elementCount(delete_button, 0);
          browser.waitAndClick(".drop-select-search .btn[data-toggle='dropdown']");
          _.forEachRight(items, item => {
            browser.clearValue(".boxsearch .next-input");
            browser.waitAndSetValue(".boxsearch .next-input", item);
            browser.pause(5000);
            browser.waitAndClick(`.list-search-data ul li`);
            browser.pause(5000);
            browser.assert.containsText(`.wrap-group-collection:last-child`, item);
            browser.perform(() => {
              fs.writeFileSync(LAST_PRODUCT_FILE, item);
            });
          });
          browser.assert.elementCount(".wrap-img", items.length);
          _.forEach(items, (item, index) => {
            browser.assert.containsText(`.wrap-group-collection:nth-child(${index + 1})`, item);
          });
          browser.perform(() => {
            fs.writeFileSync(LAST_UPDATED_URL_FILE, url);
          });
        }
      });
    });
  }
};
