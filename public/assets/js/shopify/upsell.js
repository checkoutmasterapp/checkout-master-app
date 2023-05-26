var upsell_product_purchase = [];
var upsell_trigger_offer_index = 0;

var money_format = customize_checkout?.money_format;

jQuery(document).ready(async function () {
    jQuery("#upsell_section_0").show();

    jQuery(document).on("click", ".purchase_quantity_plus", function (event) {
        let purchase_quantity_input = jQuery(`#purchase_quantity_${upsell_trigger_offer_index}`);
        let purchase_quantity_val = purchase_quantity_input.val();

        purchase_quantity_val = parseInt(purchase_quantity_val) + 1;

        purchase_quantity_input.val(purchase_quantity_val);

        // Update product price
        let upsell_trigger_offer = upsell_trigger_offers[upsell_trigger_offer_index];

        let product_price = jQuery(`#product_price_${upsell_trigger_offer_index}`).val();
        product_price = parseFloat(product_price) * parseFloat(purchase_quantity_val);

        let compare_at_price = jQuery(`#compare_at_price_${upsell_trigger_offer_index}`).val();
        compare_at_price = parseFloat(compare_at_price) * parseFloat(purchase_quantity_val);

        // jQuery(`#upsell_product_price_${upsell_trigger_offer_index}`).html(`$ ${product_price.toFixed(2)}`);
        // jQuery(`#upsell_compare_at_price_${upsell_trigger_offer_index}`).html(`$ ${compare_at_price.toFixed(2)}`)

        jQuery(`#upsell_product_price_${upsell_trigger_offer_index}`).html(ShopifyMoneyFormat(product_price, customize_checkout?.money_format));
        jQuery(`#upsell_compare_at_price_${upsell_trigger_offer_index}`).html(ShopifyMoneyFormat(compare_at_price, customize_checkout?.money_format));

        // Update Upsell Trigger offer Array
        upsell_trigger_offer.purchase_quantity = purchase_quantity_val;

        upsell_trigger_offers[upsell_trigger_offer_index] = upsell_trigger_offer;

    });

    jQuery(document).on("click", ".purchase_quantity_minius", function (event) {
        let purchase_quantity_input = jQuery(`#purchase_quantity_${upsell_trigger_offer_index}`);
        let purchase_quantity_val = purchase_quantity_input.val();

        if (purchase_quantity_val > 1) {
            purchase_quantity_val = parseInt(purchase_quantity_val) - 1;
        } else {
            purchase_quantity_val = 1;
            jQuery.notify({ message: "Quantity can not be less then 1" }, { type: "danger" });
        }

        purchase_quantity_input.val(purchase_quantity_val);

        // Update product price
        let upsell_trigger_offer = upsell_trigger_offers[upsell_trigger_offer_index];

        let product_price = jQuery(`#product_price_${upsell_trigger_offer_index}`).val();
        product_price = parseFloat(product_price) * parseFloat(purchase_quantity_val);

        let compare_at_price = jQuery(`#compare_at_price_${upsell_trigger_offer_index}`).val();
        compare_at_price = parseFloat(compare_at_price) * parseFloat(purchase_quantity_val);

        // jQuery(`#upsell_product_price_${upsell_trigger_offer_index}`).html(`$ ${product_price.toFixed(2)}`);
        // jQuery(`#upsell_compare_at_price_${upsell_trigger_offer_index}`).html(`$ ${compare_at_price.toFixed(2)}`)

        jQuery(`#upsell_product_price_${upsell_trigger_offer_index}`).html(ShopifyMoneyFormat(product_price, customize_checkout?.money_format));
        jQuery(`#upsell_compare_at_price_${upsell_trigger_offer_index}`).html(ShopifyMoneyFormat(compare_at_price, customize_checkout?.money_format));

        // Update Upsell Trigger offer Array
        upsell_trigger_offer.purchase_quantity = purchase_quantity_val;

        upsell_trigger_offers[upsell_trigger_offer_index] = upsell_trigger_offer;
    });

    jQuery(document).on("change", ".upsell_product_variant", function (event) {
        let jquery_this = jQuery(`#upsell_product_variant_${upsell_trigger_offer_index}`).find('option:selected');

        let product_variant_index = jquery_this.attr("product_variant_index");

        let upsell_trigger_offer = upsell_trigger_offers[upsell_trigger_offer_index];

        upsell_trigger_offers[upsell_trigger_offer_index].product_variant = upsell_trigger_offer?.product_variants[product_variant_index];
    });

    jQuery(document).on("click", ".purchase_upsell", function () {
        let upsell_product = upsell_trigger_offers[upsell_trigger_offer_index];

        let exist_upsell_product = upsell_product_purchase.filter((upsell_product_purchas) => {
            return upsell_product_purchas?.upsell_trigger_offer_uuid === upsell_product?.upsell_trigger_offer_uuid
        });

        if (exist_upsell_product.length === 0) {
            upsell_product_purchase.push(upsell_product);
        }

        load_process_upsell();
    });

    jQuery(document).on("click", ".no_thank_upsell", function () {
        load_process_upsell();
    });

    jQuery(document).on("click", "#checkout_payment_model_close", function () {
        jQuery("#checkout_payment_model").modal("hide");
    });

    // Set Connection With Backend
    const socket = io(`${store_domain_url}`);
    socket.on("connection");

    socket.on("socket_connected", (response) => {
        console.log("socket socket_connected----------", response);
    });

    socket.on("socket_typing", (response) => {
        console.log("socket socket_typing----------", response);
    });

    //////////////////////////////////// Socket Initialize for checkout.com payment webhook
    socket.on("checkout_webhook_payment", (response) => {
        if (store_id === response?.data?.shop_id && order_id === response?.data?.parent_order_uuid) {
            jQuery("#checkout_payment_model").modal("hide");
            if (response?.success) {
                window.location.href = `${store_domain_url}/${store_id}/checkout-thankyou/${order_id}`;
            }
        }
    });
});

function ShopifyMoneyFormat(cents, money_format) {

    let default_money_format = "${{amount}}";

    var value = '';
    var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
    var formatString = (money_format || default_money_format);

    function defaultOption(opt, def) {
        return (typeof opt == 'undefined' ? def : opt);
    }

    function formatWithDelimiters(number, precision, thousands, decimal) {
        return parseFloat(number).toFixed(2);
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

    return formatString.replace(placeholderRegex, value);
}

function load_process_upsell() {

    if (upsell_trigger_offer_index == 0) {
        if (upsell_trigger_offers.length !== 1) {
            jQuery("#upsell_section_0").hide();
            jQuery(`#upsell_section_1`).show();

            upsell_trigger_offer_index = 1;
            return true;
        }
    }

    if (upsell_trigger_offer_index == 1) {
        if (upsell_trigger_offers.length !== 2) {
            jQuery("#upsell_section_1").hide();
            jQuery(`#upsell_section_2`).show();

            upsell_trigger_offer_index = 2;
            return true;
        }
    }

    if (upsell_product_purchase.length > 0) {
        jQuery("body").addClass("loader-animation");
        jQuery.ajax({
            type: "POST",
            dataType: "json",
            url: `${store_domain_url}/purchase-upsells`,
            data: {
                store_id: store_id,
                order_id: order_id,
                currency: store_detail?.store_currency,
                checkout_id: checkout_id,
                upsell_id: upsell_detail?.id,
                upsell_product_purchase: JSON.stringify(upsell_product_purchase),
            },
            success: function (response) {
                jQuery("body").removeClass("loader-animation");
                if (response?.status) {
                    if (response?.revolut_order) {
                        RevolutPaymentConfirmation(response);
                    } else if (response?.action === "checkout_payment_confirmation") {
                        CheckoutPaymentConfirmation(response);
                    } else {
                        jQuery.notify({ message: response?.message }, { type: "success" });
                        window.location.replace(`${store_domain_url}/${store_id}/checkout-thankyou/${order_id}`)
                    }
                } else {
                    jQuery("body").removeClass("loader-animation");
                    jQuery.notify({ message: response?.message }, { type: "danger" });
                }
            },
            error: function (error) {
                console.error("load_process_upsell pay error-------------", error);
                jQuery.notify({ message: error?.message }, { type: "danger" });
            },
        })
    } else {
        window.location.href = `${store_domain_url}/${store_id}/checkout-thankyou/${order_id}`;
    }
}

//// Revolut Payment Popup
!(function (e, o, t) {
    e[t] = function (n, r) {
        var c = {
            sandbox: "https://sandbox-merchant.revolut.com/embed.js",
            prod: "https://merchant.revolut.com/embed.js",
            dev: "https://merchant.revolut.codes/embed.js",
        },
            d = o.createElement("script");
        (d.id = "revolut-checkout"), (d.src = c[r] || c.prod), (d.async = !0), o.head.appendChild(d);
        var s = {
            then: function (r, c) {
                (d.onload = function () {
                    r(e[t](n));
                }),
                    (d.onerror = function () {
                        o.head.removeChild(d), c && c(new Error(t + " is failed to load"));
                    });
            },
        };
        return "function" == typeof Promise ? Promise.resolve(s) : s;
    };
})(window, document, "RevolutCheckout");

async function RevolutPaymentConfirmation(response) {
    let parent_order_detail = response?.parent_order_detail;
    let payment_type = (PAYMENT_MODE === "live") ? "prod" : "sandbox";

    RevolutCheckout(response.public_id, payment_type).then(function (RC) {
        RC.payWithPopup({
            email: `${parent_order_detail?.email}`,
            name: `${parent_order_detail?.first_name} ${parent_order_detail?.last_name}`,
            onSuccess() {
                RevolutPaymentSuccess(response.revolut_order);
            },
            onError(error) {
                console.error("RevolutPaymentConfirmation error ----------", error);
                jQuery.notify({ message: "Payment failed!" }, { type: "danger" });
            },
            onCancel() {
                jQuery.notify({ message: "Payment cancelled!" }, { type: "danger" });
            },
        });
    });
}

async function RevolutPaymentSuccess(revolut_order) {
    jQuery("body").addClass("loader-animation");
    jQuery.ajax({
        type: "POST",
        dataType: "json",
        url: `${store_domain_url}/purchase-upsells`,
        data: {
            action: "revolut_success",
            payment_id: revolut_order?.public_id,
        },
        success: function (response) {
            jQuery("body").removeClass("loader-animation");
            if (response?.status) {
                jQuery.notify({ message: response?.message }, { type: "success" });
                window.location.replace(`${store_domain_url}/${store_id}/checkout-thankyou/${order_id}`)
                return true;
            } else {
                jQuery.notify({ message: response?.message }, { type: "danger" });
            }
        },
        error: function (error) {
            console.error("RevolutPaymentSuccess pay error-------------", error);
            jQuery("body").removeClass("loader-animation");
            jQuery.notify({ message: response.error?.message }, { type: "danger" });
        },
    });
}

// Checkout Payment
async function CheckoutPaymentConfirmation(response) {

    let net_price = 0;
    for (let upsell_product of upsell_product_purchase) {
        let price = parseFloat(upsell_product?.product_price) * parseFloat(upsell_product?.purchase_quantity);
        net_price = parseFloat(net_price) + parseFloat(price);
    }

    jQuery("#checkout_payment_model").modal("show");

    jQuery(".checkout_payment_frame_body").show();
    jQuery(".checkout_payment_gateway_security").hide();
    jQuery(".checkout_payment_gateway_security").html("");


    /* global Frames */
    var payButton = document.getElementById("checkout_pay_button");
    var form = document.getElementById("checkout_payment_form");
    var errorStack = [];

    // Frames.init(response?.publishable_key);
    Frames.init({
        publicKey: response?.publishable_key,
        modes: [
            Frames.modes.DISABLE_COPY_PASTE
        ],
        // acceptedPaymentMethods: [
        //     "Visa",
        //     "Maestro",
        //     "Mastercard",
        //     "American Express",
        //     "Diners Club",
        //     "Discover",
        //     "JCB",
        //     "Mada",
        // ],
    });

    Frames.addEventHandler(
        Frames.Events.CARD_VALIDATION_CHANGED,
        onCardValidationChanged
    );
    function onCardValidationChanged(event) {
        console.log("CARD_VALIDATION_CHANGED: %o", event);
        payButton.disabled = !Frames.isCardValid();
    }

    Frames.addEventHandler(
        Frames.Events.FRAME_VALIDATION_CHANGED,
        onValidationChanged
    );
    function onValidationChanged(event) {
        console.log("FRAME_VALIDATION_CHANGED: %o", event);

        var errorMessageElement = document.querySelector(".error-message");
        var hasError = !event.isValid && !event.isEmpty;

        if (hasError) {
            errorStack.push(event.element);
        } else {
            errorStack = errorStack.filter(function (element) {
                return element !== event.element;
            });
        }

        var errorMessage = errorStack.length
            ? getErrorMessage(errorStack[errorStack.length - 1])
            : "";
        errorMessageElement.textContent = errorMessage;
    }

    function getErrorMessage(element) {
        var errors = {
            "card-number": "Please enter a valid card number",
            "expiry-date": "Please enter a valid expiry date",
            cvv: "Please enter a valid cvv code",
        };

        return errors[element];
    }

    Frames.addEventHandler(
        Frames.Events.CARD_TOKENIZATION_FAILED,
        onCardTokenizationFailed
    );
    function onCardTokenizationFailed(error) {
        console.log("CARD_TOKENIZATION_FAILED: %o", error);

        jQuery("body").removeClass("loader-animation");
        Frames.enableSubmitForm();
    }

    Frames.addEventHandler(Frames.Events.CARD_TOKENIZED, onCardTokenized);
    function onCardTokenized(event) {
        console.log("CheckoutPaymentConfirmation onCardTokenized")
        CheckoutPaymentSuccess(event.token);
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        jQuery("body").addClass("loader-animation");
        Frames.submitCard();
    });
}

async function CheckoutPaymentSuccess(checkout_card_token) {
    jQuery.ajax({
        type: "POST",
        dataType: "json",
        url: `${store_domain_url}/purchase-upsells`,
        data: {
            action: "checkout_success",
            checkout_card_token: checkout_card_token,

            store_id: store_id,
            order_id: order_id,
            currency: store_detail?.store_currency,
            checkout_id: checkout_id,
            upsell_id: upsell_detail?.id,
            upsell_product_purchase: JSON.stringify(upsell_product_purchase),
        },
        success: function (response) {
            jQuery("body").removeClass("loader-animation");
            if (response?.status) {
                if (response?.payment_status === "Pending") {
                    jQuery(".checkout_payment_frame_body").hide();
                    jQuery(".checkout_payment_gateway_security").show();
                    jQuery(".checkout_payment_gateway_security").html(`
                        <iframe src="${response?.redirect_url}" width="100%" height="500"></iframe>
                    `);
                } else {
                    jQuery.notify({ message: response?.message }, { type: "success" });
                    window.location.replace(`${store_domain_url}/${store_id}/checkout-thankyou/${order_id}`)
                    return true;
                }
            } else {
                jQuery.notify({ message: response?.message }, { type: "danger" });
            }
        },
        error: function (error) {
            console.error("CheckoutPaymentSuccess pay error-------------", error);
            jQuery.notify({ message: response.error?.message }, { type: "danger" });
        },
    });
}