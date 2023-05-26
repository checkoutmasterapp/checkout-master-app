'use strict'

//////////////////////////////////// Detect user aganet
module.exports = (req, res, next) => {
    let user_agent = req.headers["user-agent"];

    let user_agent_type = "";

    // Check window Device
    if (/windows/i.test(user_agent)) {
        user_agent_type = "windows";
    }
    if (/windows phone/i.test(user_agent)) {
        user_agent_type = "windows_phone";
    }

    // Check Android Device
    if (/android/i.test(user_agent)) {
        user_agent_type = "android";
    }

    // Check Mac or IOS Device
    if (/Mac/i.test(user_agent)) {
        user_agent_type = "mac";
    }
    if (/iPad|iPhone|iPod/.test(user_agent)) {
        user_agent_type = "ios_phone"
    }

    req.user_agent_type = user_agent_type;
    res.locals.user_agent_type = user_agent_type;

    next();
}


// Define the global function
global.shopify_money_format = async (cents, money_format) => {
    return new Promise(async (resolve, reject) => {
        try {
            let default_money_format = "${{amount}}";
            // if (typeof cents == 'string') { cents = cents.replace('.', ''); }
            var value = '';
            var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
            var formatString = (money_format || default_money_format);

            function defaultOption(opt, def) {
                return (typeof opt == 'undefined' ? def : opt);
            }

            function formatWithDelimiters(number, precision, thousands, decimal) {

                if (isNaN(number) || number == null) {
                    number = 0;
                }

                return parseFloat(number).toFixed(2);

                precision = defaultOption(precision, 2);
                thousands = defaultOption(thousands, ',');
                decimal = defaultOption(decimal, '.');

                if (isNaN(number) || number == null) { return 0; }

                number = (number / 100.0).toFixed(precision);

                var parts = number.split('.'),
                    dollars = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands),
                    cents = parts[1] ? (decimal + parts[1]) : '';

                return dollars + cents;
            }

            switch (formatString.match(placeholderRegex)[1]) {
                case 'amount':
                    value = formatWithDelimiters(cents, 2);
                    break;
                case 'amount_no_decimals':
                    value = formatWithDelimiters(cents, 0);
                    break;
                case 'amount_with_comma_separator':
                    value = formatWithDelimiters(cents, 2, '.', ',');
                    break;
                case 'amount_no_decimals_with_comma_separator':
                    value = formatWithDelimiters(cents, 0, '.', ',');
                    break;
            }

            resolve(formatString.replace(placeholderRegex, value));
        } catch (error) {
            console.error("global.shopify_money_format error -----------------", error);
            reject({
                status: false,
                message: error?.message || "Something went wrong. Please try again.",
            });
        }
    });
};

module.exports = function (req, res, next) {

    // Define a custom global function
    res.locals.myLocalsShopifyMoneyFormat = async (cents, money_format) => {
        console.log("myLocalsShopifyMoneyFormat cents-----", cents);
        console.log("myLocalsShopifyMoneyFormat money_format-----", money_format);

        let money_format_response = await shopify_money_format(cents, money_format);
        console.log("res.locals.myLocalsShopifyMoneyFormat money_format_response-----", money_format_response);

        return money_format_response
    };

    next();
};