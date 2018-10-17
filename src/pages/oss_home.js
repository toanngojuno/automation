module.exports = {
    url: function() {
        return 'https://oss.seedcom.vn/sso/login.jsp'
    },
    commands: [{

    }],
    elements: {
        username: 'input[name=\'TPL_username\']',
        password: 'input[name=\'TPL_password\']',
        login: '.b-login',
    }
};