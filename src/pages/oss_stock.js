module.exports = {
    url: function() {
        return 'https://sub.oss.juno.vn/oss_warehouse/generalinstock'
    },
    commands: [{

    }],
    elements: {
        storeDropDown: '.c-filter-bar .regiondiv  button.dropdown-toggle',
        deselectAllStores: '.bs-deselect-all',
        storeSearchInput: '.bs-searchbox input',
        firstStoreResult: '.regiondiv .dropdown-menu.inner li.active',
        productSearchInput: 'input.select2-search__field',
        firstSearchResult: '.select2-results__option--highlighted',
        clearSearchResult: '.select2-selection__clear',
        clearWrongSearch: '.select2-selection__choice[title="Tất cả"] .select2-selection__choice__remove',
        searchLoading: '.loading-results',
        submitSearch: 'button.btn-primary',
        pageLimitButton: '.dropup button',
        limit100: '.dropup ul li:nth-child(3)',
        loading: '#systemloading',
    }
};