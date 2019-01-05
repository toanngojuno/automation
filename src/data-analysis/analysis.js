const parse = require('csv-parse/lib/sync');
const fs = require('fs');

const CREDENTIALS_FILE = './juno_credentials.csv';
const CREDENTIALS = fs.readFileSync(CREDENTIALS_FILE).toString().trim().split(',');
const USERNAME = CREDENTIALS[0];
const PASSWORD = CREDENTIALS[1];

let FILE_OUT = "./src/data-analysis/out.csv"
let data = fs.readFileSync(`./src/data-analysis/items.csv`).toString();
let items = parse(data, {
  delimiter: '\t'
})

let dateCaret = '#ID-reportHeader-dateControl > div.ID-container._GAPd > table > tbody > tr > td._GAPj';
let startDate = 'input.ID-datecontrol-primary-start';
let endDate = 'input.ID-datecontrol-primary-end';
let startDateInput = 'Nov 18, 2018';
let endDateInput = 'Nov 22, 2018';
let apply = '#ID-reportHeader-dateControl > div.ID-menu_list._GAPh > table > tbody > tr > td.ID-datecontrol-controls._GADT > div > input'

let filter = 'input.ID-filterBox'
let loading = '.ID-loadingProgressBarContainer'
let cr = '#ID-rowTable > thead > tr._GAgNb > td.ACTION-change.TARGET-6.ID-6-0._GAU2b > div.C_DATATABLE_SCORECARD_CARD > div > div'
let session = '#ID-rowTable > thead > tr._GAgNb > td._GAYTb.ACTION-change.TARGET-0.ID-0-0._GAU2b > div.C_DATATABLE_SCORECARD_CARD > div > div'

module.exports = {
  'adding combo...': function (browser) {
    browser.url('https://analytics.google.com/analytics/web/#/report/content-landing-pages/a57206615w90839951p94486988/_.goalOption=1')
      .waitAndSetValue('#identifierId', USERNAME)
      .waitAndClick('#identifierNext')
      .waitAndSetValue('#password input', PASSWORD)
      .waitAndClick('#passwordNext')
      .pause(15000)
      .frame('galaxyIframe')
      .waitAndClick(dateCaret)

      .waitAndClick(startDate)
      .clearValue(startDate)
      .waitAndSetValue(startDate, startDateInput)

      .waitAndClick(endDate)
      .clearValue(endDate)
      .waitAndSetValue(endDate, endDateInput)

      .waitAndClick(apply)
      .pause(10000);
    for (let i = 0; i < items.length; i++) {
      let sku = items[i][0];
      let price = parseInt(items[i][1]);
      browser.clearValue(filter).waitAndSetValue(filter, [sku, browser.Keys.ENTER]);
      browser.waitForElementNotVisible(loading);
      browser.pause(5000)
      browser.getText(session, (res) => {
        let session = parseInt(res.value.replace(/,/g, ""));
        browser.getText(cr, (res) => {
          let writer = fs.openSync(FILE_OUT, 'a');
          let reliable = session >= 10 ? 'reliable' : 'unreliable';
          let conversionRate = parseFloat(res.value.replace('%', '').replace(/,/g, ""));
          let value = conversionRate / 100 * parseInt(price);
          fs.appendFileSync(writer, `${sku},${price},${session},${conversionRate},${value},${reliable}\n`, 'utf8');
        })
      })
    }
  },
};