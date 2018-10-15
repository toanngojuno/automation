// This is a bit of a hack. Instead of using the login prompt
// we instead manually set the localStorage sessionToken to what we
// got when we first created the testUser.
exports.command = function(done) {
    this.page.login().navigate();
    this.execute(
        function(sessionToken) {
            window.localStorage.setItem("sessionToken", sessionToken);
        },
        [this.globals.testUser.sessionToken],
        done
    );

    return this;

    // Alternatively:
    //     .setValue('@email', this.globals.testUser.email)
    //     .setValue('@password', this.globals.testUser.password)
    //     .click('@signIn')
    //     .waitForElementVisible('div.dashboard', 5000);
};