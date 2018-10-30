// https://auth.lazada.com/oauth/authorize?response_type=code&force_auth=true&redirect_uri=https://myapp.com&client_id=106591
const fs = require('fs');

const AUTH_CODE_FILE = './src/lazada/lazada_auth_auth_code.txt';
const ACCESS_TOKEN_FILE = './src/lazada/lazada_auth_access_token.txt';
const ACCESS_TOKEN = fs.readFileSync(ACCESS_TOKEN_FILE).toString().trim();
const LAST_AUTH_CODE_DATE_FILE = './src/lazada/lazada_auth_last_auth_code_date.txt';
const LAST_AUTH_CODE_DATE = fs.readFileSync(LAST_AUTH_CODE_DATE_FILE).toString().trim();
const LAZADA_CREDENTIALS = fs.readFileSync('./lazada_credentials.csv').toString().trim().split(',');
const CREDENTIALS = {
    LAZADA: {
        USERNAME: LAZADA_CREDENTIALS[0],
        PASSWORD: LAZADA_CREDENTIALS[1],
        APP_KEY: LAZADA_CREDENTIALS[2],
        SECRET: LAZADA_CREDENTIALS[3]
    },
};

module.exports = {
    'Retrieving Auth Code from Lazada...': function (browser) {
        // The auth code is valid for 7 days, so we're only retrieving it every 6 days - just to be safe.
        if (ACCESS_TOKEN != '' && (new Date() - new Date(LAST_AUTH_CODE_DATE)) / 3600 / 1000 / 24 <= 6) {
            return;
        }
        fs.writeFileSync(AUTH_CODE_FILE, '');
        fs.writeFileSync(ACCESS_TOKEN_FILE, '');
        let url = `https://auth.lazada.com/oauth/authorize?response_type=code&force_auth=true&redirect_uri=https://myapp.com&client_id=${CREDENTIALS.LAZADA.APP_KEY}`;
        browser.url(url)
            .waitAndClick('.next-icon')
            .waitAndClick('li[value=\'vn\']')
            .frame('alibaba-login-box')
            .waitAndSetValue('input[name=\'loginId\']', CREDENTIALS.LAZADA.USERNAME)
            .waitAndSetValue('#fm-login-password', CREDENTIALS.LAZADA.PASSWORD)
            .waitAndClick('#fm-login-submit')
            .pause(10000);
        browser.url(result => {
            let url = result.value;
            fs.writeFileSync(AUTH_CODE_FILE, url.split('?')[1].split('=')[1]);
            fs.writeFileSync(LAST_AUTH_CODE_DATE_FILE, new Date());
        });
    },
};