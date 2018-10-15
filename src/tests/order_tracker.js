module.exports = {
    'collect order data': function (browser) {
        // Google Sheets API set up
        const fs = require('fs');
        const readline = require('readline');
        const {google} = require('googleapis');
        const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
        const TOKEN_PATH = 'token.json';
        const STARTING_ROW = 2;
        let STARTING_DATE = null;
        let base = 0;
        if (STARTING_DATE) {
            base = Date.parse(STARTING_DATE)
        }
        // Page automation set up
        let admin = browser.page.admin();
        admin.navigate()
            .waitAndSetValue('@username', 'xxx')
            .waitAndSetValue('@password', 'xxx')
            .waitAndClick('@login');
        admin.waitAndClick('@orderMenu');
        for (let i = 0; i < 1000; i++) {
            let a = 'A' + (i + STARTING_ROW);
            let c = 'C' + (i + STARTING_ROW);
            let range = a + ':' + c;
            let date = new Date();
            if (i === 0 && base == 0) { base = date.getTime(); }
            admin.waitAndClick('@filter');
            admin.waitAndClick('.form-inline .ui-select-wrapper:nth-child(1) select option:nth-child(5)');
            admin.waitAndClick('.form-inline .ui-select-wrapper:nth-child(2) select option:nth-child(7)');
            admin.waitAndClick('@filterDropDownConfirm');
            browser.pause(5000); // wait for results to load
            if (i === 0 && base === 0) { base = date.getTime(); }
            admin.getText('.total_product', function (result) {
                let date = new Date();
                let h = date.getHours() + ':' + date.getMinutes(), r = Math.round((date.getTime() - base) / 1000 / 60),
                    v = result.value.split(' ')[0];
                console.log(h, r, v)
                fs.readFile('credentials.json', (err, content) => {
                    if (err) return console.log('Error loading client secret file:', err);
                    // Authorize a client with credentials, then call the Google Sheets API.
                    authorize(JSON.parse(content), function(auth) {
                        let values = [
                            [h,r,v],
                        ];
                        const resource = {
                            values,
                        };
                        const sheets = google.sheets({version: 'v4', auth});
                        sheets.spreadsheets.values.update({
                            spreadsheetId: '11Hz4uHmO2-bvesBQ5ZVYBKGFAs6z2Ybf4FfznL-5rq8',
                            range,
                            valueInputOption: 'USER_ENTERED',
                            resource,
                        }, (err, result) => {
                            if (err) {
                                // Handle error
                                console.log(err);
                            } else {
                                console.log('%d cells updated.', result.updatedCells);
                            }
                        });
                    });
                });
            });
            browser.pause(60000); // wait for 5 min = 300s = 300000ms
        }

        function authorize(credentials, callback) {
            const {client_secret, client_id, redirect_uris} = credentials.installed;
            const oAuth2Client = new google.auth.OAuth2(
                client_id, client_secret, redirect_uris[0]);

            // Check if we have previously stored a token.
            fs.readFile(TOKEN_PATH, (err, token) => {
                if (err) return getNewToken(oAuth2Client, callback);
                oAuth2Client.setCredentials(JSON.parse(token));
                callback(oAuth2Client);
            });
        }
        function getNewToken(oAuth2Client, callback) {
            const authUrl = oAuth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: SCOPES,
            });
            console.log('Authorize this app by visiting this url:', authUrl);
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
            });
            rl.question('Enter the code from that page here: ', (code) => {
                rl.close();
                oAuth2Client.getToken(code, (err, token) => {
                    if (err) return callback(err);
                    oAuth2Client.setCredentials(token);
                    // Store the token to disk for later program executions
                    fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                        if (err) console.error(err);
                        console.log('Token stored to', TOKEN_PATH);
                    });
                    callback(oAuth2Client);
                });
            });
        }
    },
};
