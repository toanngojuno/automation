(function setCombo() {
    let products = [
        ['CG07073', 410000],
        ['CG05054', 410000],
        // ['CG05056', 430000],
        // ['CG07072', 450000],
        // ['BB03012', 410000],
        // ['SD01073', 410000],
        // ['CG07074', 470000],
        // ['BB01122', 410000],
        // ['CG05059', 390000],
        // ['SD09059', 490000],
        // ['SD05003', 370000],
        // ['CG07057', 430000],
        // ['SD01067', 350000],
        // ['DX07014', 470000],
        // ['SD09061', 430000],
        // ['SD09060', 430000],
        // ['SD01066', 350000],
        // ['BB03013', 390000],
        // ['BB03011', 350000],
        // ['CG05060', 430000],
        // ['SD01060', 350000],
        // ['CG09100', 390000],
        // ['CG07065', 470000],
        // ['CG09095', 390000],
        // ['SD05023', 450000],
        // ['CG05055', 430000],
        // ['SD01068', 350000],
        // ['CG05058', 390000],
        // ['SD01057', 350000],
        // ['SD07024', 430000],
        // ['CG09070', 430000],
        // ['SD01072', 410000],
        // ['SD09045', 430000],
        // ['CG09094', 390000],
        // ['SD01077', 450000],
        // ['SD05024', 410000],
        // ['CG07069', 390000],
        // ['BB01126', 430000],
        // ['SD07021', 390000],
        // ['BB03010', 410000],
        // ['BB01121', 410000],
        // ['DX11002', 470000],
        // ['BB01124', 390000],
        // ['SD01062', 350000],
        // ['SD09054', 390000],
        // ['SD09056', 430000],
        // ['SD01069', 290000],
        // ['SD01076', 430000],
        // ['BB01120', 410000],
        // ['CG09097', 470000],
        // ['SD07027', 470000],
        // ['BB01125', 390000],
        // ['SD01065', 390000],
        // ['BB01115', 350000],
        // ['SD03018', 390000],
        // ['SD05021', 350000],
        // ['CG09085', 430000],
        // ['BB01118', 350000],
    ];
    let COMBO_PRICE = 600000;
    let START_DATE_STR = '10/10/2018';
    let END_DATE_STR = '20/10/2018';
    for (var i = 0; i < products.length - 1; i++) {
        for (var j = i + 1; j < products.length; j++) {
            let product1 = products[i];
            let product2 = products[j];
            let combo = {
                item1: {sku: product1[0], originalPrice: parseInt(product1[1]), reductionPrice: 0},
                item2: {
                    sku: product2[0],
                    originalPrice: parseInt(product2[1]),
                    reductionPrice: (parseInt(product1[1]) + parseInt(product2[1])) - COMBO_PRICE
                },
            };
            addCombo(combo, START_DATE_STR, END_DATE_STR);
        }
    }

    function addCombo(combo, startDateString, endDateString) {
        let searchBox = '.combo-page .col-md-5:first-child input';
        let addButton = '.fa-plus';
        $(searchBox).val(combo.item1.sku);
        sendEnterKey(searchBox);
        setTimeout(function() {
            $(addButton).trigger('click');
            console.log("??/")
        }, 5000)
    }

    function sendEnterKey(selector) {
        let e = jQuery.Event("keypress");
        e.which = 13; //choose the one you want
        e.keyCode = 13;
        $(selector).trigger(e);
    }
})();