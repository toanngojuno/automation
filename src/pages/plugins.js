module.exports = {
    url: function() {
        return 'https://juno-1.myharavan.com/admin/app#/embed/0f15e85d3648efa941c2ea0e9b3f299a'
    },
    commands: [{

    }],
    elements: {
        newComboTab: 'li.combo:nth-child(2) .fa-plus',
        searchBox: '.combo-page .col-md-5:first-child input',
        comboName: '.combo-page .col-md-7:nth-child(2) .col-md-12:first-child input',
        startDate: '.combo-page .col-md-7:nth-child(2) .col-md-12:nth-child(2) .ps-relative:first-child input',
        endDate: '.combo-page .col-md-7:nth-child(2) .col-md-12:nth-child(2) .ps-relative:nth-child(2) input',
        addProductButton: '.fa-plus',
        firstProductNoSale: '.combo-page .col-md-7:nth-child(2) table tr:nth-child(2) input',
        firstProductSelect: '.combo-page .col-md-7:nth-child(2) table tbody tr:nth-child(1) select option[value="1"]',
        firstProductSalePrice: '.combo-page .col-md-7:nth-child(2) table tbody tr:nth-child(1) td:nth-child(5) input',
        secondProductSelect: '.combo-page .col-md-7:nth-child(2) table tbody tr:nth-child(4) select option[value="1"]',
        secondProductSalePrice: '.combo-page .col-md-7:nth-child(2) table tbody tr:nth-child(4) td:nth-child(5) input',
        saveButton: '.fa-save',
        backButton: '.fa-arrow-circle-o-left',
        toast: '#toast-container',
        deleteButton: '.btn-delete',
        confirmDeleteButton: '.btnOk:contains(\'Đồng ý\')',
    }
};