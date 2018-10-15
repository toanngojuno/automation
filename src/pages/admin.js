module.exports = {
    url: function() {
        return 'https://juno.vn/admin'
    },
    commands: [{

    }],
    elements: {
        username: '#UserName',
        password: '#Password',
        login: '.btn-login',
        orderMenu: 'a[href*="/admin/order"]',
        filter: '#dropdownfilter',
        filterDropDown: '.dropdown-menu select.ui-select',
        filterDropDownConfirm: '.dropdown-menu button'
    }
};