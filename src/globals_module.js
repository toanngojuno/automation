/*
 * We generate a testUser before each test suite and then delete the generated organization after each test suite.
 * This way our test suites can run isolation and everything gets cleaned up at the end.
 *
 * We add the following to "browser.globals" for convenience:
 *      testUser - Generated test user credentials, org and account.
 *          {nameFirst, nameLast, password, email, sessionToken, account, organization}
 *      superAdmin - SuperAdmin credentials.
 *          {email, password, sessionToken}
 *      launchUrl - The target URL we are testing against (e.g. https://local.apptimize.co).
 *
 * Additionally we setup a handful of globals that can be used in tests or supporting code (e.g. lodash).
 */

let chromedriver = require('chromedriver');
let path = require('path');
let rp = require('request-promise');
let yaml = require('yamljs');
let argv = require('yargs').argv;

// Setup a handful of globals that will make writing tests and supporting code easier.
Promise = require("bluebird");
_ = require('../node_modules/lodash/lodash');
xpath = require('./support/xpath_helpers');
DEBUG = argv.debug; // Pass "--debug" to enable.
TEST_CONFIGS = {};

module.exports = {
    waitForConditionTimeout: 30000, // Default time for waitFor* methods.
    asyncHookTimeout: 30000, // If done()'s aren't called within this time, then test will timeout (fail).
    retryAssertionTimeout: 30000, // Automatically retry failed assertions for 30 seconds.

    before : function(done) {
        //var location = '/ave/bin/chromedriver'
        //require('child_process').execFile(location, []);
        // Chromedriver npm library checks for open chromedriver file to use,
        // therefore we can change chromedriver version to use by changing
        // location above.
        require('dotenv').config();
        chromedriver.start();
        done();
    },

    beforeEach: function(browser, done) {
        // Fixes issue where during a --suiteRetries, the currentTest.name would still be valid.
        // This caused our apicaller to wrap the following setup calls in a perform() which would
        // incorrectly add them to the nightwatch queue which broke --suiteRetries from waiting for
        // us to call done().
        browser.currentTest.name = "";

        // Give apicaller a reference to browser.
        // apicaller.setBrowser(browser);

        // Log timestamp.
        let today = new Date();
        console.log("Suite started at: "
            + (today.getMonth() + 1)
            + '/' + today.getDate()
            + '/' + today.getFullYear()
            + ' ' + today.getHours()
            + ':' + today.getMinutes()
            + ':' + today.getSeconds());

        let globals = browser.globals;

        // Set up our global.launchUrl
        globals.launchUrl = process.env.FT_TEST_ENVIRONMENT;

        // Set up our log directory if it hasn't been set
        if (globals.test_settings.screenshots.path.includes('DEFINE')) {
            globals.test_settings.screenshots.path = process.env.FT_LOG_DIRECTORY;
        }

       done();
    },

    afterEach: function(browser, done) {
        // Make sure this happens in a perform(). This ensures we delete org AND THEN call browser.end().
        browser.perform(function(finished) {
            finished();
        }).end(done);
    },

    after : function(done) {
        chromedriver.stop();
        done();
    }
};
