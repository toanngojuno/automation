module.exports = {
    url: function() {
        return 'https://sellercenter.lazada.vn/seller/login'
    },
    commands: [{

    }],
    elements: {
        username: 'input[name=\'TPL_username\']',
        password: 'input[name=\'TPL_password\']',
        login: 'button.next-btn',
        productMenu: '.next-navigation-item:nth-child(2)',
        productPage: '.next-navigation-item:nth-child(2) li:first-child'
    }
};