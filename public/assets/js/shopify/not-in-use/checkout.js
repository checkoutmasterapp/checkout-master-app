
if (payment_methods_key["Apple pay"] && window.ApplePaySession) {
    var merchantIdentifier = payment_methods_key["Apple pay"]?.apple_merchantIdentifier;
    console.log("merchantIdentifier--------", merchantIdentifier);

    var promise = ApplePaySession.canMakePaymentsWithActiveCard(merchantIdentifier);
    console.log("promise--------", promise);

    promise.then(function (canMakePayments) {
        console.log("canMakePayments--------", canMakePayments)
        if (canMakePayments) {
            jQuery(".apple_pay_gateway").show();
        } else {
            jQuery(".payment_method_apple_pay_input").remove();
            jQuery(".apple_pay_gateway_content").html(`<div class="main-inr-payment">ApplePay is possible on this browser, but not currently activated.</div>`);
        }
    });
}

jQuery(document).ready(function () {
    /**************************************************
     *** 10 minute timer implement
     *** https://codepen.io/yaphi1/pen/KpbRZL
     **************************************************/
    jQuery("#card_number").on("input", function (e) {
        var value = $(this).inputmask("unmaskedvalue");
        $("#card_number").inputmask({
            mask: value.substr(0, 2) === "36" ? "9999 999999 9999" : value.substr(0, 2) === "37" ? "9999 999999 99999" : value.substr(0, 2) === "34" ? "9999 9999 9999 9999" : "9999 9999 9999 9999",
        });
    });

    jQuery("#card_number_heckout").on("input", function (e) {
        var value = $(this).inputmask("unmaskedvalue");
        $("#card_number_heckout").inputmask({
            mask: value.substr(0, 2) === "36" ? "9999 999999 9999" : value.substr(0, 2) === "37" ? "9999 999999 99999" : value.substr(0, 2) === "34" ? "9999 9999 9999 9999" : "9999 9999 9999 9999",
        });
    });

    jQuery("#card_number_revolut").on("input", function (e) {
        var value = $(this).inputmask("unmaskedvalue");
        $("#card_number_revolut").inputmask({
            mask: value.substr(0, 2) === "36" ? "9999 999999 9999" : value.substr(0, 2) === "37" ? "9999 999999 99999" : value.substr(0, 2) === "34" ? "9999 9999 9999 9999" : "9999 9999 9999 9999",
        });
    });

    if (customize_checkout?.display_timer) {
        var time_in_minutes = 10;
        var current_time = Date.parse(new Date());
        var deadline = new Date(current_time + time_in_minutes * 60 * 1000);

        function time_remaining(endTime) {
            var timer = Date.parse(endTime) - Date.parse(new Date());
            var seconds = Math.floor((timer / 1000) % 60);
            var minutes = Math.floor((timer / 1000 / 60) % 60);
            return { total: timer, minutes: minutes, seconds: seconds };
        }

        var scarcity_clock_section = jQuery(".scarcity_clock_section").html();
        function update_clock() {
            var timer = time_remaining(deadline);
            let clock_timer = `${timer.minutes}:${timer.seconds}`;

            let scarcity_clock_html = scarcity_clock_section.replace("clock_timer", clock_timer);
            jQuery(".scarcity_clock_section").html(scarcity_clock_html)

            if (timer.total <= 0) {
                history.back();
                clearInterval(timeInTerval);
            }
            jQuery(".scarcity_clock_section").show();
        }

        update_clock();
        var timeInTerval = setInterval(update_clock, 1000);
    }

    if (jQuery('input[name="payment_method"]').is(":checked")) {
        var val = jQuery(this).val(); // retrieve the value

        if (val == "Stripe") {
            // jQuery("#pay_button").prop("disabled", true);
            jQuery(".credit_card").show("slow");
        }
    }

    let timer;
    let fontSize = jQuery("#font_size").val();
    if (fontSize != "" || fontSize != null || fontSize != undefined) {
        jQuery(".main-data").css("font-size", parseInt(fontSize) + "px");
    }

    if (jQuery("#lang-btn").val() != undefined) {
        timer = setInterval(checkScriptExists, 1000);
        setTimeout(function () {
            translateLanguage(this.value);
        }, 1000);
    }

    function checkScriptExists() {
        var google_script_url = "https://translate.google.com/translate_a/element.js";
        if (jQuery("script[src*='" + google_script_url + "']")[0]) {
            // run google translate function
            new google.translate.TranslateElement(
                {
                    pageLanguage: "en",
                    layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
                    autoDisplay: true,
                },
                "google_translate_element"
            );
            clearInterval(timer);
            return;
        }
    }

    /*** Shipping Rate Implement ***/
    if (jQuery("#lang-btn").val() != undefined) {
        timer = setInterval(checkScriptExists, 1000);
        setTimeout(function () {
            translateLanguage(this.value);
        }, 1000);
    }

    /*** Change Translate language ***/
    function translateLanguage(lang) {
        checkScriptExists();
        var frame = jQuery(".goog-te-menu-frame:first");
        if (
            frame
                .contents()
                .find(".goog-te-menu2-item span.text:contains(" + lang + ")")
                .get(0) != undefined
        ) {
            frame
                .contents()
                .find(".goog-te-menu2-item span.text:contains(" + lang + ")")
                .get(0)
                .click();
        }
        return false;
    }

    jQuery("input").bind("focus", function (e) {
        let id = jQuery("input[name=" + this.name + "]").attr("id");
        if (jQuery("input[name=" + this.name + "]").val().length === 0) {
            jQuery("input[name=" + this.name + "]").css("border-color", id);
        }
    });

    jQuery("input").focusout(function (e) {
        let myClass = jQuery("input[name=" + this.name + "]").attr("class"),
            id = jQuery("input[name=" + this.name + "]").attr("id");

        if (jQuery("input[name=" + this.name + "]").val().length === 0) {
            jQuery("input[name=" + this.name + "]").css("border-color", myClass);
            jQuery("p" + id).css("display", "block");
        }
    });

    /*** Show error massages ***/
    jQuery("input").on("change", function (e) {
        let myclass = jQuery("input[name=" + this.name + "]").attr("class");
        let id = jQuery("input[name=" + this.name + "]").attr("id");

        if (jQuery("input[name=" + this.name + "]").val().length === 0) {
            jQuery("input[name=" + this.name + "]").css("border-color", myclass);
            jQuery("p" + id).css("display", "block");
        } else {
            jQuery("input[name=" + this.name + "]").css("border-color", "#c7c7c7");
            jQuery("p" + id).css("display", "none");
        }
    });

    /*** Show Billing Form ***/
    jQuery("#billing-checkbox").on("change", function (e) {
        let isChecked = jQuery("#billing-checkbox")[0].checked;
        if (!isChecked) {
            jQuery("#billing-details").show("slow");
        } else {
            jQuery("#billing-details").hide("slow");
        }
    });

    /*** Payment Button enable and disable when chose payment method ***/
    jQuery('input[name="payment_method"]').change(function () {
        if (jQuery(this).is(":checked")) {
            let payment_method = jQuery(this).val();

            jQuery(".credit_card_section").hide("slow");

            if (payment_method == "Stripe") {
                // jQuery("#pay_button").prop("disabled", true);
                jQuery(".credit_card_stripe").show("slow");
            } else if (payment_method == "Checkout.com") {
                // jQuery("#pay_button").prop("disabled", true);
                jQuery(".credit_card_checkout").show("slow");
            } else if (payment_method == "Revolut") {
                // jQuery("#pay_button").prop("disabled", true);
                // jQuery(".credit_card_revolut").show("slow");
            } else {
                // jQuery("#pay_button").prop("disabled", false);
            }
        }
    });

    /*** Credit Card Validation ***/
    jQuery(".credit_card_stripe input[type=text]").on("keyup", function () {
        cardFormValidate();
    });

    /*** Checkout Credit Card Validation ***/
    jQuery(".credit_card_checkout input[type=text]").on("keyup", function () {
        CheckoutCardFormValidate();
    });

    /*** Apple Pay button click ***/
    jQuery("#apple_pay_button").click(function () {
        jQuery(".credit_card_section").hide("slow");
        jQuery(".payment_method_apple_pay_input").prop("checked", true);
        jQuery(".pay-on-button").click();
    });

    /*** Click Payment Button ***/
    jQuery(".pay-on-button").bind("click", async function () {
        let shipping_status = true;
        let billingDetails = true;
        if (jQuery('input[name="shipping_rate"]').val() !== undefined) {
            if (jQuery('input[name="shipping_rate"]').is(":checked")) {
                shipping_status = true;
                jQuery("input[name='shipping_rate']").closest(".main-inner-free").removeClass("requiredBorder");
            } else {
                shipping_status = false;
                jQuery("input[name='shipping_rate']").closest(".main-inner-free").addClass("requiredBorder");
            }
        }

        if (!jQuery('input[name="billing_checkbox"]').is(":checked")) {
            billingDetails = await BillingDetailValidation();
        }

        let shippingDetails = await shippingDetailValidation();

        let free_payment = document.querySelector('input[name="free_payment"]:checked')?.value;
        console.log(".free_payment select_option----------", free_payment);
        if (free_payment) {
            paymentGateway(free_payment);
        }

        if (shippingDetails && shipping_status && billingDetails) {
            let select_option = document.querySelector('input[name="payment_method"]:checked')?.value;
            console.log(".pay-on-button select_option----------", select_option);
            if (select_option) {
                paymentGateway(select_option);
            } else {
                jQuery.notify({ message: "Select Payment Method" }, { type: "danger" });
            }
        }
    });

    /*** Fetch Shipping country and state ***/
    let initGeoLoc;
    jQuery.ajax({
        url: "https://pro.ip-api.com/json/?key=7FR6Sr0omUEmj2C",
        dataType: "jsonp",
        success: (response) => {
            if (response?.countryCode) {
                initGeoLoc = response;
                jQuery("select[name='shipping_country']").val(response?.country).change();
                jQuery("select[name='billing_country']").val(response?.country).change();
            }
        },
    });

    jQuery(document).on("change", 'select[name="shipping_country"]', function (event) {
        let selected_country_code = jQuery(this).find(":selected").attr("country_code");
        let shipping_detail_html = "";
        if (shipping_options?.length > 0) {
            shipping_options.forEach((shipping_option) => {
                
                // Check Countries Exist In Shipping Rate Start
                let shipping_include = false;
                shipping_option?.country_codes.some((country_code) => {
                    if (country_code === selected_country_code) {
                        shipping_include = true;
                    }
                });
                if (shipping_include === false) {
                    return;
                }
                // Check Countries Exist In Shipping Rate End

                // Check Shipping Rate Amount Min and Max Start
                let minPrice = parseFloat(shipping_option?.shipping_rate_min_amount);
                let maxPrice = parseFloat(shipping_option?.shipping_rate_max_amount);
                console.log(minPrice, maxPrice, "min and max price", totalPrice, shipping_include, minPrice <= totalPrice == false, maxPrice >= totalPrice == false);
                if (minPrice && maxPrice) {
                    if (minPrice <= totalPrice == false || maxPrice >= totalPrice == false) {
                        shipping_include = false;
                    }
                } else {
                    if (minPrice > 0) {
                        if (minPrice <= totalPrice == false) {
                            shipping_include = false;
                        }
                    }
                    if (maxPrice > 0) {
                        if (maxPrice >= totalPrice == false) {
                            shipping_include = false;
                        }
                    }
                }
                // Check Shipping Rate Amount Min and Max End

                // Check Shipping Rate Weight Min and Max Start
                let minWeight = parseFloat(shipping_option?.shipping_rate_min_weight) * 1000;
                let maxWeight = parseFloat(shipping_option?.shipping_rate_max_weight) * 1000;
                console.log(minWeight <= totalWeight == false, maxWeight >= totalWeight == false, totalWeight, minWeight, maxWeight);
                if (minWeight && maxWeight) {
                    if (minWeight <= totalWeight == false || maxWeight >= totalWeight == false) {
                        shipping_include = false;
                    }
                } else {
                    if (minWeight > 0) {
                        if (minWeight <= totalWeight == false) {
                            shipping_include = false;
                        }
                    }
                    if (maxWeight > 0) {
                        if (maxWeight >= totalWeight == false) {
                            shipping_include = false;
                        }
                    }
                }
                // Check Shipping Rate Weight Min and Max End

                var shippingRate = shipping_option.shipping_rate_price;
                if (shipping_include === true) {
                    shipping_detail_html += `
						<label class="main-full-width">
							<div class="main-inner-free">
								<input
									type="radio"
									class="shipping-free"
									name="shipping_rate"
									data-id=${shipping_option.id}
									shipping_rate_name='${shipping_option.shipping_rate_name}'
									value=${shipping_option ? shipping_option.shipping_rate_price : "n/a"}
									style=accent-color:${customize_checkout ? customize_checkout.accent_color : "#C23B19"}
								/>
								<p>${shipping_option ? shipping_option.shipping_rate_name : "n/a"}</p>
								<span>${shipping_option ? `${customize_checkout.money_format ? customize_checkout.money_format.substring(0, 1) : "$"}` + parseFloat(shippingRate).toFixed(2) : "n/a"}</span>
							</div>
						</label>
					`;
                }
            });
        }

        if (shipping_detail_html) {
            jQuery(".shipping_implement").html(shipping_detail_html);
            jQuery("input[name='shipping_rate']:first").click();
        } else {
            jQuery(".shipping_implement").html(`
				<div class="no-shipping-detail">
					<div class="chekshade">
						<div>
							<div class="shipping-message" data-function="no-shipping-options">
								<p class="no-shipping-options"><i class="fa fa-globe"></i>No shipping options are available for your location</p>
							</div>
						</div>
					</div>
				</div>
			`);
        }

        try {
            jQuery.ajax({
                type: "POST",
                dataType: "json",
                url: `${ajax_url}/select-state`,
                data: { country_code: selected_country_code },
                success: function (response) {
                    if (response.status) {
                        if (response.states?.length > 0) {

                            let option_html = `<option value="">Select State</option>`;
                            jQuery.each(response.states, function (index, value) {
                                option_html += `<option value="${value?.state_name}" code=${value?.state_code}>${value.state_name}</option>`;
                            });
                            jQuery("#shipping_state").html(option_html);
                            jQuery(".shipping_state_section").show();

                            // console.log("initGeoLoc----------", initGeoLoc);
                            if (initGeoLoc) {
                                jQuery('select[name="shipping_state"] [code="' + initGeoLoc?.region + '"]').prop("selected", true);
                            }
                        } else {
                            jQuery(".shipping_state_section").hide();
                        }
                    }
                },
                error: function (response) {
                    console.error(response.responseText, "response error");
                },
            });
        } catch (error) {
            console.error(error);
        }

        load_checkout_price_section();
    });


    /**** Check discount code exist in store e-commerce platform ***/
    let ecommerce_discount_code = window.sessionStorage.getItem("ecommerce_discount_code");
    if (ecommerce_discount_code) {
        jQuery('.discount_code_input').val(ecommerce_discount_code);
        ecommerce_discount = window.sessionStorage.getItem("ecommerce_discount");

        jQuery(".ecommerce_discount_apply").hide();
        jQuery(".ecommerce_discount_remove").show();
    }

    jQuery(document).on("click", '.ecommerce_discount_apply', function (event) {
        let discount_code = jQuery('.discount_code_input').val();

        jQuery("body").addClass("loader-animation");
        jQuery.ajax({
            type: "post",
            dataType: "json",
            url: `${ajax_url}/check-discount-code`,
            data: {
                store_id: store_id,
                checkout_id: checkout_id,
                discount_code: discount_code,
            },
            success: function (response) {
                jQuery("body").removeClass("loader-animation");
                if (response.status) {
                    ecommerce_discount = JSON.stringify(response?.ecommerce_discount);

                    window.sessionStorage.setItem("ecommerce_discount", ecommerce_discount);
                    window.sessionStorage.setItem("ecommerce_discount_code", discount_code);

                    jQuery(".ecommerce_discount_apply").hide();
                    jQuery(".ecommerce_discount_remove").show();

                    load_checkout_price_section();
                } else {
                    jQuery.notify({ message: response?.message }, { type: "danger" });
                }
            },
            error: function (error) {
                console.error("apply_button error --------", error);
                jQuery("body").removeClass("loader-animation");
                jQuery.notify({ message: error?.message }, { type: "danger" });
            },
        });
    });

    jQuery(document).on("click", '.ecommerce_discount_remove', function (event) {
        jQuery('.discount_code_input').val("");
        jQuery(".ecommerce_discount_apply").show();
        jQuery(".ecommerce_discount_remove").hide();

        sessionStorage.removeItem("ecommerce_discount");
        sessionStorage.removeItem("ecommerce_discount_code");

        ecommerce_discount = {};

        load_checkout_price_section();
    });

    /*** Change total amount if checked shipping rates ***/
    jQuery(document).on("change", 'input[name="shipping_rate"]', function (event) {
        let jquery_this = jQuery(this);

        shipping_rate_id = jquery_this.attr("data-id");
        shipping_rate_amount = parseFloat(jquery_this.val());
        shipping_rate_name = jquery_this.attr("shipping_rate_name");

        load_checkout_price_section();
    });


    /*** fetch billing country and state ***/
    jQuery('select[name="billing_country"]').change(function () {
        try {
            jQuery.ajax({
                type: "POST",
                dataType: "json",
                url: `${ajax_url}/select-state`,
                data: {
                    country_code: jQuery(this).find(":selected").attr("country_code"),
                },
                success: function (response) {
                    if (response.status) {
                        if (response.states?.length > 0) {
                            let option_html = `<option value="">Select State</option>`;
                            $.each(response.states, function (index, value) {
                                option_html += `<option value="${value?.state_name}" code=${value?.state_code}>${value.state_name}</option>`;
                                // option_html += `<option value="${value?.state_name}">${value.state_name}</option>`;
                            });
                            $("#billing_state_drop").html(option_html);
                            jQuery(".billing_state_section").show();

                            if (initGeoLoc) {
                                jQuery('select[name="billing_state"] [code="' + initGeoLoc?.region + '"]').prop("selected", true);
                                // jQuery("select[name='billing_state']").val(initGeoLoc?.regionName).change();
                            }
                        } else {
                            jQuery(".billing_state_section").hide();
                        }
                    }
                },
                error: function (response) {
                    console.error(response.responseText, "response error");
                },
            });
        } catch (error) {
            console.error(error);
        }
    });

    // Set Connection With Backend
    const socket = io(`${ajax_url}`);
    socket.on("connection");

    socket.on("socket_connected", (response) => {
        console.log("socket socket_connected----------", response);
    });

    socket.on("socket_typing", (response) => {
        console.log("socket socket_typing----------", response);
    });

    //////////////////////////////////// Socket Initialize for Payout Master payment webhook
    socket.on("payoutmaster_webhook_payment", (response) => {
        if (store_id === response?.store_id && checkout_id === response?.checkout_id) {
            jQuery("#payment_gateway_security").html('');
            if (response?.success) {
                window.location.href = `${ajax_url}/${store_id}/checkout-thankyou/${response?.data?.order_uuid}`;
            }
        }
    });

    //////////////////////////////////// Socket Initialize for checkout.com payment webhook
    socket.on("checkout_webhook_payment", (response) => {
        if (store_id === response?.store_id && checkout_id === response?.checkout_id) {
            jQuery("#payment_gateway_security").html('');
            if (response?.success) {
                if (upsell_detail) {
                    window.location.href = `${ajax_url}/${checkout_detail.shop_id}/c/${checkout_detail.checkout_uuid}/o/${response?.data?.order_uuid}/upsells/${upsell_detail?.upsell_uuid}`;
                } else {
                    window.location.href = `${ajax_url}/${checkout_detail.shop_id}/checkout-thankyou/${response?.data?.order_uuid}`;
                }
            }
        }
    });

    // Default first Payment Method checked
    jQuery("input:radio[name=payment_method]:first").click();

});


/***********************************************************
 *** Load Checkout Price Section Function
 ***********************************************************/
function load_checkout_price_section() {
    jQuery("body").addClass("loader-animation");

    let selected_Country_Code = jQuery('select[name="shipping_country"]').find(":selected").attr("country_code");
    let money_format = customize_checkout.money_format ? customize_checkout.money_format.substring(0, 1) : "$";

    jQuery.ajax({
        type: "post",
        dataType: "json",
        url: `${ajax_url}/check-automatic-discount`,
        data: {
            store_id: store_id,
            checkout_id: checkout_id,

            totalPrice: totalPrice,
            money_format: money_format,
            subtotal_price: subtotal_price,
            cart_item_count: cart_item_count,

            shipping_rate_id: shipping_rate_id,
            shipping_rate_name: shipping_rate_name,
            shipping_rate_amount: shipping_rate_amount,
            selected_Country_Code: selected_Country_Code,

            product_details: JSON.stringify(product_details),
            ecommerce_discount: ecommerce_discount,
        },
        success: function (response) {
            jQuery("body").removeClass("loader-animation");
            if (response.status) {
                apply_discount = response?.apply_discount;

                jQuery("#button_price").html(response?.button_price_html);
                jQuery(".checkout_price_section").html(response?.checkout_price_section_html);
                return true;
            } else {
                jQuery.notify({ message: response?.message }, { type: "danger" });
            }
        },
        error: function (error) {
            jQuery("body").removeClass("loader-animation");
            jQuery.notify({ message: error?.message }, { type: "danger" });
        },
    });

}

/*****************************************
 *** Stripe Card Validate Function ***
 *****************************************/
function cardFormValidate() {
    jQuery("#card_number").on("keyup", function () {
        jQuery("#expiry_month").val("");
        jQuery("#expiry_year").val("");
        jQuery("#cvv").val("");
    });
    jQuery("#expiry_month").on("keyup", function () {
        jQuery("#expiry_year").val("");
        jQuery("#cvv").val("");
    });
    jQuery("#expiry_year").on("keyup", function () {
        jQuery("#cvv").val("");
    });

    var cardValid = 0;
    //card number validation
    let checkCardCompany = checkCreditCard(jQuery("#card_number").val());
    console.log("checkCardcheckout", checkCardCompany);
    if (checkCardCompany.success) {
        jQuery("#card_number").removeClass("requiredBorder");
        cardValid = 1;
    } else {
        jQuery("#card_number").addClass("requiredBorder");
        cardValid = 0;
    }
    //card details validation
    var expMonth = jQuery("#expiry_month").val();
    var expYear = jQuery("#expiry_year").val();
    var cvv = jQuery("#cvv").val();
    var regYear = /^2023|2024|2025|2026|2027|2028|2029|2030|2031|2032|2033|2034|2035|2036|2037|2038|2039|2040|2041|2042|2043|2044|2045|2046|2047|2048|2049|2050|2051|2052$/;
    var regCVV = /^[0-9]{3,3}$/;
    var card_value = jQuery("#card_number").inputmask("unmaskedvalue");
    if (card_value.substr(0, 2) === "37") {
        jQuery("#cvv").attr("maxlength", "4");
        regCVV = /^[0-9]{4,4}$/;
    } else {
        jQuery("#cvv").attr("maxlength", "3");
        regCVV = /^[0-9]{3,3}$/;
    }
    // /_createdDate|_createdTime|user_name|bid_name|APP_URL|APP_BUILD_URL|bidhq_view_link|bid_due_date|user_icon|client_name/gi,
    if (cardValid == 0) {
        jQuery("#card_number").addClass("requiredBorder");
    } else {
        jQuery("#card_number").removeClass("requiredBorder");
    }

    // Ensure month is a number between 1 and 12

    if (!/^\d{1,2}$/.test(expMonth) || parseInt(expMonth) < 1 || parseInt(expMonth) > 12) {
        jQuery("#expiry_month").addClass("requiredBorder");
    } else {
        jQuery("#expiry_month").removeClass("requiredBorder");
    }

    // Ensure year is a number and at least 4 digits long
    if (regYear.test(expYear)) {
        jQuery("#expiry_year").addClass("requiredBorder");
    } else {
        jQuery("#expiry_year").removeClass("requiredBorder");
    }
    var expiry = new Date(expYear, expMonth, 0);
    var today = new Date();
    if (expiry < today || parseInt(expMonth) > 12) {
        jQuery("#expiry_month").addClass("requiredBorder");
        jQuery("#expiry_year").addClass("requiredBorder");
    } else {
        jQuery("#expiry_month").removeClass("requiredBorder");
        jQuery("#expiry_year").removeClass("requiredBorder");
    }
    if (!regCVV.test(cvv)) {
        jQuery("#cvv").addClass("requiredBorder");
    } else {
        jQuery("#cvv").removeClass("requiredBorder");
    }

    if (
        (cardValid === 1 && /^\d{1,2}$/.test(expMonth))
        && parseInt(expMonth) > 0 && !parseInt(expMonth) <= 12
        && regYear.test(expYear) && regCVV.test(cvv)
    ) {
        console.log("validation complete");
        jQuery("#card_number").removeClass("requiredBorder");
        jQuery("#expiry_month").removeClass("requiredBorder");
        jQuery("#expiry_year").removeClass("requiredBorder");
        jQuery("#cvv").removeClass("requiredBorder");
        // jQuery("#pay_button").prop("disabled", false);
        return true;
    } else {
        // jQuery("#pay_button").prop("disabled", true);
        return false;
    }
}

/*****************************************
 *** Checkout Card Validate Function ***
 *****************************************/
function CheckoutCardFormValidate() {
    jQuery("#card_number_heckout").on("keyup", function () {
        jQuery("#expiry_month_heckout").val("");
        jQuery("#expiry_year_heckout").val("");
        jQuery("#cvv_heckout").val("");
    });

    jQuery("#expiry_month_heckout").on("keyup", function () {
        jQuery("#expiry_year_heckout").val("");
        jQuery("#cvv_heckout").val("");
    });

    jQuery("#expiry_year_heckout").on("keyup", function () {
        jQuery("#cvv_heckout").val("");
    });

    var cardValid = 0;
    jQuery("#card_number_heckout").validateCreditCard(function (result) {
        if (result.valid) {
            jQuery("#card_number_heckout").removeClass("requiredBorder");
            cardValid = 1;
        } else {
            jQuery("#card_number_heckout").addClass("requiredBorder");
            cardValid = 0;
        }
    });

    //card details validation
    var expMonthCheckout = jQuery("#expiry_month_heckout").val();
    var expYearCheckout = jQuery("#expiry_year_heckout").val();
    var cvvCheckout = jQuery("#cvv_heckout").val();
    var regMonth = /01|02|03|04|05|06|07|08|09|10|11|12/gi;
    var regYear = /^2023|2024|2025|2026|2027|2028|2029|2030|2031|2032|2033|2034|2035|2036|2037|2038|2039|2040|2041|2042|2043|2044|2045|2046|2047|2048|2049|2050|2051|2052$/;
    var regCVV = /^[0-9]{3,3}$/;
    var card_value = jQuery("#card_number_heckout").inputmask("unmaskedvalue");

    if (card_value.substr(0, 2) === "37") {
        jQuery("#cvv_heckout").attr("maxlength", "4");
        regCVV = /^[0-9]{4,4}$/;
    } else {
        jQuery("#cvv_heckout").attr("maxlength", "3");
        regCVV = /^[0-9]{3,3}$/;
    }
    // /_createdDate|_createdTime|user_name|bid_name|APP_URL|APP_BUILD_URL|bidhq_view_link|bid_due_date|user_icon|client_name/gi,
    if (cardValid == 0) {
        jQuery("#card_number_heckout").addClass("requiredBorder");
    } else {
        jQuery("#card_number_heckout").removeClass("requiredBorder");
    }

    // Ensure month is a number between 1 and 12
    if (!/^\d{1,2}$/.test(expMonthCheckout) || parseInt(expMonthCheckout) < 1 || parseInt(expMonthCheckout) > 12) {
        jQuery("#expiry_month_heckout").addClass("requiredBorder");
    } else {
        jQuery("#expiry_month_heckout").removeClass("requiredBorder");
    }

    // Ensure year is a number and at least 4 digits long
    if (regYear.test(expYearCheckout)) {
        jQuery("#expiry_year_heckout").addClass("requiredBorder");
    } else {
        jQuery("#expiry_year_heckout").removeClass("requiredBorder");
    }

    var expiry = new Date(expYearCheckout, expMonthCheckout, 0);
    var today = new Date();
    if (expiry < today || parseInt(expMonthCheckout) > 12) {
        jQuery("#expiry_month_heckout").addClass("requiredBorder");
        jQuery("#expiry_year_heckout").addClass("requiredBorder");
    } else {
        jQuery("#expiry_month_heckout").removeClass("requiredBorder");
        jQuery("#expiry_year_heckout").removeClass("requiredBorder");
    }

    if (!regCVV.test(cvvCheckout)) {
        jQuery("#cvv_heckout").addClass("requiredBorder");
    } else {
        jQuery("#cvv_heckout").removeClass("requiredBorder");
    }

    console.log("############################################");
    console.log("CheckoutCardFormValidate cardValid---------------", cardValid);
    console.log("CheckoutCardFormValidate expYearCheckout---------------", regYear.test(expYearCheckout));
    console.log("CheckoutCardFormValidate expYearCheckout---------------", regCVV.test(cvvCheckout));

    if (
        (cardValid === 1 && /^\d{1,2}$/.test(expMonthCheckout))
        && parseInt(expMonthCheckout) > 0 && !parseInt(expMonthCheckout) <= 12
        && regYear.test(expYearCheckout) && regCVV.test(cvvCheckout)
    ) {
        console.log("validation completee");
        jQuery("#card_number_heckout").removeClass("requiredBorder");
        jQuery("#expiry_month").removeClass("requiredBorder");
        jQuery("#expiry_year").removeClass("requiredBorder");
        jQuery("#cvv").removeClass("requiredBorder");
        // jQuery("#pay_button").prop("disabled", false);
        return true;
    } else {
        // jQuery("#pay_button").prop("disabled", true);
        return false;
    }
}

/*****************************************
 *** Revolut Card Validate Function ***
 *****************************************/
function RevolutCardFormValidate() {
    jQuery("#card_number_revolut").on("keyup", function () {
        jQuery("#expiry_month_revolut").val("");
        jQuery("#expiry_year_revolut").val("");
        jQuery("#cvv_revolut").val("");
    });
    jQuery("#expiry_month_revolut").on("keyup", function () {
        jQuery("#expiry_year_revolut").val("");
        jQuery("#cvv_revolut").val("");
    });
    jQuery("#expiry_year_revolut").on("keyup", function () {
        jQuery("#cvv_revolut").val("");
    });
    let cardValid = 0;
    //card number validation
    let checkCardcheckout = checkCreditCard(jQuery("#card_number_revolut").val());
    if (checkCardcheckout.success) {
        jQuery("#card_number_revolut").removeClass("requiredBorder");
        cardValid = 1;
    } else {
        jQuery("#card_number_revolut").addClass("requiredBorder");
        cardValid = 0;
    }

    //card details validation
    var expiry_month_revolut = jQuery("#expiry_month_revolut").val();
    var expiry_year_revolut = jQuery("#expiry_year_revolut").val();
    var cvv_revolut = jQuery("#cvv_revolut").val();
    var regMonth = /01|02|03|04|05|06|07|08|09|10|11|12/gi;
    var regYear = /^2023|2024|2025|2026|2027|2028|2029|2030|2031$/;
    var regCVV = /^[0-9]{3,3}$/;

    if (cardValid == 0) {
        jQuery("#card_number_revolut").addClass("requiredBorder");
    } else {
        jQuery("#card_number_revolut").removeClass("requiredBorder");
    }

    if (!regMonth.test(expiry_month_revolut)) {
        jQuery("#expiry_month_revolut").addClass("requiredBorder");
    } else {
        jQuery("#expiry_month_revolut").removeClass("requiredBorder");
    }

    if (!regYear.test(expiry_year_revolut)) {
        jQuery("#expiry_year_revolut").addClass("requiredBorder");
    } else {
        jQuery("#expiry_year_revolut").removeClass("requiredBorder");
    }

    if (!regCVV.test(cvv_revolut)) {
        jQuery("#cvv_revolut").addClass("requiredBorder");
    } else {
        jQuery("#cvv_revolut").removeClass("requiredBorder");
    }

    console.log("############################################");
    console.log("RevolutCardFormValidate cardValid---------------", cardValid);
    console.log("RevolutCardFormValidate cvv_revolut---------------", regCVV.test(cvv_revolut));
    console.log("RevolutCardFormValidate expiry_year_revolut---------------", regYear.test(expiry_year_revolut));
    console.log("RevolutCardFormValidate expiry_month_revolut---------------", regMonth.test(expiry_month_revolut));

    if (cardValid === 1 && regMonth.test(expiry_month_revolut) && regYear.test(expiry_year_revolut) && regCVV.test(cvv_revolut)) {
        jQuery("#card_number_revolut").removeClass("requiredBorder");
        jQuery("#expiry_month_revolut").removeClass("requiredBorder");
        jQuery("#expiry_year_revolut").removeClass("requiredBorder");
        jQuery("#cvv_revolut").removeClass("requiredBorder");
        // jQuery("#pay_button").prop("disabled", false);
        return true;
    } else {
        // jQuery("#pay_button").prop("disabled", true);
        return false;
    }
}

/*** Billing Details Validate Function ***/
async function BillingDetailValidation() {
    var first_name = jQuery("input[name='billing_first_name']").val(),
        address = jQuery("input[name='billing_address']").val(),
        city = jQuery("input[name='billing_city']").val(),
        zip = jQuery("input[name='billing_zip_code']").val(),
        country = jQuery("select[name='billing_country']").val(),
        state = jQuery("select[name='billing_state']").val(),
        company_name = jQuery("input[name='billing_company_name']").val(),
        zipCode = /^\d{5}(?:-?\d{4})?$/;
    if (!first_name) {
        jQuery("input[name='billing_first_name']").focus()
        jQuery("#billing_first_name").show();
        jQuery("input[name='billing_first_name']").css("border-color", jQuery("input[name='billing_first_name']").attr("class"));
        jQuery.notify({ message: "First name field is required" }, { type: "danger" });
    } else {
        jQuery("#billing_first_name").hide();
    }
    if (!address) {
        jQuery("input[name='billing_address']").focus()
        jQuery("#billing_address").show();
        jQuery("input[name='billing_address']").css("border-color", jQuery("input[name='billing_address']").attr("class"));
        jQuery.notify({ message: "Address field is required" }, { type: "danger" });
    } else {
        jQuery("#billing_address").hide();
    }
    if (!city) {
        jQuery("input[name='billing_city']").focus()
        jQuery("#billing_city").show();
        jQuery("input[name='billing_city']").css("border-color", jQuery("input[name='billing_city']").attr("class"));
        jQuery.notify({ message: "City field is required" }, { type: "danger" });
    } else {
        jQuery("#billing_city").hide();
    }
    if (!zip) {
        jQuery("input[name='billing_zip_code']").focus()
        jQuery("#billing_zip_code").show();
        jQuery("input[name='billing_zip_code']").css("border-color", jQuery("input[name='billing_zip_code']").attr("class"));
        jQuery.notify({ message: "Zip code field is required" }, { type: "danger" });
    } else {
        if (!zipCode.test(zip)) {
            jQuery("#billing_zip_code").html("Enter valid Zip code");
            jQuery("input[name='billing_zip_code']").css("border-color", jQuery("input[name='billing_zip_code']").attr("class"));
            jQuery.notify({ message: "Enter valid Zip code" }, { type: "danger" });
        } else {
            jQuery("#billing_zip_code").hide();
        }
    }
    if (!country) {
        jQuery("input[name='billing_country']").focus()
        jQuery("#billing_country").show();
        jQuery("select[name='billing_country']").css("border-color", jQuery("select[name='billing_country']").attr("class"));
        jQuery.notify({ message: "Country field is required" }, { type: "danger" });
    } else {
        jQuery("select[name='billing_country']").css("border-color", "");
        jQuery("#billing_country").hide();
    }
    if (!state) {
        jQuery("input[name='billing_state']").focus()
        jQuery("#billing_state").show();
        jQuery("select[name='billing_state']").css("border-color", jQuery("select[name='billing_state']").attr("class"));
        jQuery.notify({ message: "State field is required" }, { type: "danger" });
    } else {
        jQuery("select[name='billing_state']").css("border-color", "");
        jQuery("#billing_state").hide();
    }

    if (first_name && address && city && zipCode.test(zip) && country && state) {
        return true;
    } else {
        return false;
    }
}

/*** Shipping Details Validate Function ***/
async function shippingDetailValidation() {
    var email = jQuery("input[name='email']").val(),
        first_name = jQuery("input[name='first_name']").val(),
        // last_name = jQuery("input[name='last_name']").val(),
        city = jQuery("input[name='city']").val(),
        zip = jQuery("input[name='zip_code']").val(),
        country = jQuery("select[name='shipping_country']").val(),
        state = jQuery("select[name='shipping_state']").val(),
        emailRegex = /^([_\-\.0-9a-zA-Z]+)@([_\-\.0-9a-zA-Z]+)\.([a-zA-Z]){2,7}$/,
        zipCode = /^\d{5}(?:-?\d{4})?$/,
        mobile_no = /^((\+[1-9]{1,4}[ \-]*)|(\([0-9]{2,3}\)[ \-]*)|([0-9]{2,4})[ \-]*)*?[0-9]{3,4}?[ \-]*[0-9]{3,4}?$/;

    if (customize_checkout.require_address_number) address = jQuery("input[name='address']").val();
    else address = true;

    if (customize_checkout.require_phone_number) phone = jQuery("input[name='phone']").val();
    else phone = true;

    if (!email) {
        jQuery("#email").show();
        jQuery("input[name='email']").css("border-color", jQuery("input[name='email']").attr("class"));
        jQuery.notify({ message: "Email field is required" }, { type: "danger" });
    } else {
        if (!emailRegex.test(email)) {
            jQuery("#email").html("Enter valid email");
            jQuery("input[name='email']").css("border-color", jQuery("input[name='email']").attr("class"));
            jQuery.notify({ message: "Enter valid email" }, { type: "danger" });
        } else {
            jQuery("#email").hide();
        }
    }

    if (!first_name) {
        jQuery("#first_name").show();
        jQuery("input[name='first_name']").css("border-color", jQuery("input[name='first_name']").attr("class"));
        jQuery.notify({ message: "First name field is required" }, { type: "danger" });
    } else {
        jQuery("#first_name").hide();
    }
    // if (!last_name) {
    //     jQuery("#last_name").show();
    //     jQuery("input[name='last_name']").css("border-color", jQuery("input[name='last_name']").attr("class"));
    // } else {
    //     jQuery("#last_name").hide();
    // }
    if (!address) {
        jQuery("#address").show();
        jQuery("input[name='address']").css("border-color", jQuery("input[name='address']").attr("class"));
        jQuery.notify({ message: "Address field is required" }, { type: "danger" });
    } else {
        jQuery("#address").hide();
    }
    if (!phone) {
        jQuery("#phone").show();
        jQuery("input[name='phone']").css("border-color", jQuery("input[name='phone']").attr("class"));
        jQuery.notify({ message: "Phone no. field is required" }, { type: "danger" });
    } else {
        console.log(phone, "phone");
        if (phone != true) {
            if (!mobile_no.test(phone)) {
                jQuery("#phone").html("Enter valid mobile no");
                jQuery("input[name='phone']").css("border-color", jQuery("input[name='phone']").attr("class"));
                jQuery.notify({ message: "Enter valid mobile no" }, { type: "danger" });
            } else {
                jQuery("#phone").hide();
            }
        }
    }
    if (!city) {
        jQuery("#city").show();
        jQuery("input[name='city']").css("border-color", jQuery("input[name='city']").attr("class"));
        jQuery.notify({ message: "City field is required" }, { type: "danger" });
    } else {
        jQuery("#city").hide();
    }
    if (!zip) {
        jQuery("#zip_code").show();
        jQuery("input[name='zip_code']").css("border-color", jQuery("input[name='zip_code']").attr("class"));
        jQuery.notify({ message: "Zip code field is required" }, { type: "danger" });
    } else {
        if (!zipCode.test(zip)) {
            jQuery("#zip_code").html("Enter valid Zip code");
            jQuery("input[name='zip_code']").css("border-color", jQuery("input[name='zip_code']").attr("class"));
            jQuery.notify({ message: "Enter valid Zip code" }, { type: "danger" });
        } else {
            jQuery("#zip_code").hide();
        }
    }
    if (!country) {
        jQuery("#shipping_country_error").show();
        jQuery("select[name='shipping_country']").css("border-color", jQuery("select[name='shipping_country']").attr("class"));
        jQuery.notify({ message: "Country field is required" }, { type: "danger" });
    } else {
        jQuery("select[name='shipping_country']").css("border-color", "");
        jQuery("#shipping_country_error").hide();
    }
    if (!state) {
        jQuery("#shipping_state_error").show();
        jQuery("select[name='shipping_state']").css("border-color", jQuery("select[name='shipping_state']").attr("class"));
        jQuery.notify({ message: "State field is required" }, { type: "danger" });
    } else {
        jQuery("select[name='shipping_state']").css("border-color", "");
        jQuery("#shipping_state_error").hide();
    }
    console.log(emailRegex.test(email), first_name, address, city, zipCode.test(zip), phone, country, state);
    if (emailRegex.test(email) && first_name && address && city && zipCode.test(zip) && phone != "" && country && state) {
        return true;
    } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return false;
    }
}

async function paymentGateway(select_option) {
    console.log("paymentGateway select_option----------", select_option);

    switch (select_option) {
        case "Stripe":
            StripePayment();
            break;
        case "PayPal":
            PayPalPayment();
            break;
        case "Payout Master":
            PayoutMasterPayment();
            break;
        case "Checkout.com":
            CheckoutPayment();
            break;
        case "Revolut":
            RevolutPayment();
            break;
        case "cash_on_delivery":
            CashOnDelivery();
            break;
        case "free_payment":
            FreePayment();
            break;
        default:
            break;
    }
}

async function FreePayment() {

    let customer_detail = CustomerDetail(checkout_detail, "Stripe");

    let billing_detail;
    let billing = false;
    if (!jQuery('input[name="billing_checkbox"]').is(":checked")) {
        billing = true;
        billing_detail = BillingDetail();
    }

    jQuery("#pay_button").addClass("loading");
    jQuery("#pay_button").addClass("button-loading");
    jQuery.ajax({
        type: "POST",
        dataType: "json",
        url: `${ajax_url}/pay`,
        data: {
            method: "free",

            store_id: store_id,
            checkout_id: checkout_id,

            currency_name: "USD",

            subtotal: jQuery('input[name="subtotal"]').val(),
            price: jQuery('input[name="total_price"]').val(),

            email: customer_detail?.email,
            first_name: customer_detail?.first_name,
            last_name: customer_detail?.last_name,
            address: customer_detail?.address,
            phone: customer_detail?.phone,
            city: customer_detail?.city,
            zipcode: customer_detail?.zipCode,
            country: customer_detail?.country,
            state: customer_detail?.state,

            billing_status: billing,
            billing_detail: JSON.stringify(billing_detail),
            product_details: JSON.stringify(checkout_detail),
            shipping_rate_amount: shipping_rate_amount,
            shipping_rate_id: jQuery('input[name="shipping_rate"]:checked').attr("data-id"),
            shipping_name: jQuery('input[name="shipping_rate"]:checked').attr("shipping_rate_name"),
        },
        success: function (response) {
            if (response.status) {
                sessionStorage.removeItem("ecommerce_discount");
                sessionStorage.removeItem("ecommerce_discount_code");

                jQuery.notify({ message: response?.message }, { type: "success" });
                window.location.href = `${ajax_url}/${checkout_detail.shop_id}/checkout-thankyou/${response?.data?.order_uuid}`;
                return true;
            } else {
                jQuery("#pay_button").removeClass("loading");
                jQuery("#pay_button").removeClass("button-loading");
                jQuery.notify({ message: response?.message }, { type: "danger" });
            }
        },
        error: function (error) {
            console.error("StripePayment pay error-------------", error);

            jQuery("#pay_button").removeClass("loading");
            jQuery("#pay_button").removeClass("button-loading");
            jQuery.notify({ message: error?.message }, { type: "danger" });
        },
    });
}

async function StripePayment() {
    // Stripe payment
    var expiry_month = jQuery("#expiry_month").val(),
        expiry_year = jQuery("#expiry_year").val(),
        cvv = jQuery("#cvv").val(),
        card_number = jQuery("#card_number").val();

    var isValidCard = cardFormValidate();
    if (isValidCard) {
        let customer_detail = CustomerDetail(checkout_detail, "Stripe");

        let billing_detail;
        let billing = false;
        if (!jQuery('input[name="billing_checkbox"]').is(":checked")) {
            billing = true;
            billing_detail = BillingDetail();
        }

        jQuery("body").addClass("loader-animation");
        jQuery.ajax({
            type: "POST",
            dataType: "json",
            url: `${ajax_url}/pay`,
            data: {
                method: "stripe",

                store_id: store_id,
                checkout_id: checkout_id,

                currency_name: "USD",
                card_number: card_number,
                expiry_month: expiry_month,
                expiry_year: expiry_year,
                cvv: cvv,

                subtotal: jQuery('input[name="subtotal"]').val(),
                price: jQuery('input[name="total_price"]').val(),

                email: customer_detail?.email,
                first_name: customer_detail?.first_name,
                last_name: customer_detail?.last_name,
                address: customer_detail?.address,
                phone: customer_detail?.phone,
                city: customer_detail?.city,
                zipcode: customer_detail?.zipCode,
                country: customer_detail?.country,
                state: customer_detail?.state,

                billing_status: billing,
                billing_detail: JSON.stringify(billing_detail),
                product_details: JSON.stringify(checkout_detail),
                shipping_rate_amount: shipping_rate_amount,
                shipping_rate_id: jQuery('input[name="shipping_rate"]:checked').attr("data-id"),
                shipping_name: jQuery('input[name="shipping_rate"]:checked').attr("shipping_rate_name"),

                tax_rate_id: jQuery('input[name="tax_rate_id"]').val(),
                tax_rate_amount: jQuery('input[name="tax_rate_amount"]').val(),
                tax_rate_name: jQuery('input[name="tax_rate_name"]').val(),
                tax_rate_percentage: jQuery('input[name="tax_rate_percentage"]').val(),

                apply_discount: JSON.stringify(apply_discount),
            },
            success: function (response) {
                if (response.status) {
                    sessionStorage.removeItem("ecommerce_discount");
                    sessionStorage.removeItem("ecommerce_discount_code");

                    jQuery("body").removeClass("loader-animation");
                    jQuery.notify({ message: response?.message }, { type: "success" });

                    if (upsell_detail) {
                        window.location.href = `${ajax_url}/${checkout_detail.shop_id}/c/${checkout_detail.checkout_uuid}/o/${response?.data?.order_uuid}/upsells/${upsell_detail?.upsell_uuid}`;
                    } else {
                        window.location.href = `${ajax_url}/${checkout_detail.shop_id}/checkout-thankyou/${response?.data?.order_uuid}`;
                    }
                    return true;
                } else {
                    console.error("StripePayment pay error-------------", response);
                    jQuery("body").removeClass("loader-animation");
                    jQuery.notify({ message: response?.message }, { type: "danger" });
                }
            },
            error: function (error) {
                console.error("StripePayment pay error-------------", error);
                jQuery("body").removeClass("loader-animation");
                jQuery.notify({ message: error?.message }, { type: "danger" });
            },
        });
    } else {
        jQuery.notify({ message: "Enter valid card details" }, { type: "danger" });
    }
}

async function PayPalPayment() {
    var payment_url = "";
    var productData = [];


    product_details.forEach((element) => {
        productData.push({
            name: element.title,
            price: parseFloat(element.price),
            currency: "USD",
            quantity: element.quantity,
        });
    });
    var sipping_rate = "";
    if (jQuery('input[name="shipping_rate"]').is(":checked")) {
        sipping_rate = jQuery('input[name="shipping_rate"]').val();
    }
    let Customer = CustomerDetail(checkout_detail, "PayPal");
    let billingDetails;
    let billing = false;
    if (!jQuery('input[name="billing_checkbox"]').is(":checked")) {
        billing = true;
        billingDetails = BillingDetail();
    }

    jQuery("#pay_button").addClass("button-loading");
    jQuery("#pay_button").addClass("loading");

    jQuery.ajax({
        type: "POST",
        url: `${ajax_url}/order-create`,
        data: {
            status: "true",
            billing_status: billing,
            customer: JSON.stringify(Customer),
            billing_details: JSON.stringify(billingDetails),
        },
        success: function (response) {
            if (response.status) {
                jQuery.ajax({
                    type: "POST",
                    url: `${ajax_url}/pay`,
                    data: {
                        product_details: JSON.stringify(checkout_detail),
                        subtotal: jQuery('input[name="subtotal"]').val(),
                        price: jQuery('input[name="total_price"]').val(),
                        shipping_rate_id: jQuery('input[name="shipping_rate"]:checked').attr("data-id"),
                        shipping_rate_amount: jQuery('input[name="shipping_rate_amount"]').val(),
                        shipping_name: jQuery('input[name="shipping_rate"]:checked').attr("shipping_rate_name"),
                        tax_rate_id: jQuery('input[name="tax_rate_id"]').val(),
                        tax_rate_amount: jQuery('input[name="tax_rate_amount"]').val(),
                        tax_rate_name: jQuery('input[name="tax_rate_name"]').val(),
                        tax_rate_percentage: jQuery('input[name="tax_rate_percentage"]').val(),
                        currency_name: "USD",
                        data: JSON.stringify(productData),
                        email: Customer.email,
                        first_name: Customer.first_name,
                        last_name: Customer.last_name,
                        address: Customer.address,
                        phone: Customer.phone,
                        city: Customer.city,
                        zipcode: Customer.zipCode,
                        country: Customer.country,
                        state: Customer.state,
                        billing_status: billing,
                        billingDetails: JSON.stringify(billingDetails),
                        store_id: checkout_detail.shop_id,
                        checkout_id: response?.data?.id,
                        method: "paypal",
                        sipping_rate: sipping_rate,
                    },
                    success: function (response) {
                        if (response.payment_url) {
                            payment_url = response.payment_url;
                            window.location.href = payment_url;
                        } else {
                            jQuery("#pay_button").removeClass("button-loading");
                            jQuery("#pay_button").removeClass("loading");
                            console.error(response, "response");
                            jQuery.notify({ message: response.message }, { type: "danger" });
                        }
                    },
                    error: function (response) {
                        jQuery("#pay_button").removeClass("button-loading");
                        jQuery("#pay_button").removeClass("loading");
                        jQuery.notify({ message: response.message }, { type: "danger" });
                    },
                });
            } else {
                jQuery.notify({ message: response.message }, { type: "danger" });
                jQuery("#pay_button").removeClass("button-loading");
                jQuery("#pay_button").removeClass("loading");
            }
        },
        error: function (response) {
            jQuery("#pay_button").removeClass("button-loading");
            jQuery("#pay_button").removeClass("loading");
            console.error("order-create error------------------", response.message);
        },
    });
}

async function PayoutMasterPayment() {
    let customer_detail = CustomerDetail(checkout_detail, "Revolut");

    let billing_detail;
    let billing = false;
    if (!jQuery('input[name="billing_checkbox"]').is(":checked")) {
        billing = true;
        billing_detail = BillingDetail();
    }

    jQuery("body").addClass("loader-animation");
    jQuery("#pay_button").addClass("loading");
    jQuery("#pay_button").addClass("button-loading");

    jQuery.ajax({
        type: "POST",
        dataType: "json",
        url: `${ajax_url}/pay`,
        data: {
            method: "payout_master",

            store_id: store_id,
            checkout_id: checkout_id,

            currency_name: "USD",

            subtotal: jQuery('input[name="subtotal"]').val(),
            price: jQuery('input[name="total_price"]').val(),

            email: customer_detail?.email,
            first_name: customer_detail?.first_name,
            last_name: customer_detail?.last_name,
            address: customer_detail?.address,
            phone: customer_detail?.phone,
            city: customer_detail?.city,
            zipcode: customer_detail?.zipCode,
            country: customer_detail?.country,
            state: customer_detail?.state,

            billing_status: billing,
            billing_detail: JSON.stringify(billing_detail),
            product_details: JSON.stringify(checkout_detail),
            shipping_rate_amount: jQuery('input[name="shipping_rate_amount"]').val(),
            shipping_rate_id: jQuery('input[name="shipping_rate"]:checked').attr("data-id"),
            shipping_name: jQuery('input[name="shipping_rate"]:checked').attr("shipping_rate_name"),

            tax_rate_id: jQuery('input[name="tax_rate_id"]').val(),
            tax_rate_amount: jQuery('input[name="tax_rate_amount"]').val(),
            tax_rate_name: jQuery('input[name="tax_rate_name"]').val(),
            tax_rate_percentage: jQuery('input[name="tax_rate_percentage"]').val(),

            apply_discount: JSON.stringify(apply_discount),
        },
        success: function (response) {
            jQuery("body").removeClass("loader-animation");
            sessionStorage.removeItem("ecommerce_discount");
            sessionStorage.removeItem("ecommerce_discount_code");

            if (response.status) {
                jQuery("#payment_gateway_security").html(`<iframe src="${response?.redirect_url}" width="100%" height="500"></iframe>`);
                jQuery("html, body").animate({ scrollTop: jQuery(".checkout_option").offset().top }, "slow");
                return false;
            } else {
                jQuery("#pay_button").removeClass("loading");
                jQuery("#pay_button").removeClass("button-loading");
                jQuery.notify({ message: response?.message }, { type: "danger" });
            }
        },
        error: function (response) {
            jQuery("body").removeClass("loader-animation");
            jQuery("#pay_button").removeClass("button-loading");
            jQuery("#pay_button").removeClass("loading");
            console.error(response.responseText, "response error");
        },
    });
}

async function CheckoutPayment() {
    let isValidCard = CheckoutCardFormValidate();
    if (isValidCard) {
        let expiry_month = jQuery("#expiry_month_heckout").val(),
            expiry_year = jQuery("#expiry_year_heckout").val(),
            cvv = jQuery("#cvvCheckout").val(),
            card_number = jQuery("#card_number_heckout").val();

        let customer_detail = CustomerDetail(checkout_detail, "Revolut");

        let billing_detail;
        let billing = false;
        if (!jQuery('input[name="billing_checkbox"]').is(":checked")) {
            billing = true;
            billing_detail = BillingDetail();
        }

        jQuery("body").addClass("loader-animation");
        jQuery("#pay_button").addClass("loading");
        jQuery("#pay_button").addClass("button-loading");

        jQuery.ajax({
            type: "POST",
            dataType: "json",
            url: `${ajax_url}/pay`,
            data: {
                method: "Checkout.com",

                store_id: store_id,
                checkout_id: checkout_id,

                currency_name: "USD",
                card_number: card_number,
                expiry_month: expiry_month,
                expiry_year: expiry_year,
                cvv: cvv,

                subtotal: jQuery('input[name="subtotal"]').val(),
                price: jQuery('input[name="total_price"]').val(),

                email: customer_detail?.email,
                first_name: customer_detail?.first_name,
                last_name: customer_detail?.last_name,
                address: customer_detail?.address,
                phone: customer_detail?.phone,
                city: customer_detail?.city,
                zipcode: customer_detail?.zipCode,
                country: customer_detail?.country,
                state: customer_detail?.state,

                billing_status: billing,
                billing_detail: JSON.stringify(billing_detail),
                product_details: JSON.stringify(checkout_detail),
                shipping_rate_amount: jQuery('input[name="shipping_rate_amount"]').val(),
                shipping_rate_id: jQuery('input[name="shipping_rate"]:checked').attr("data-id"),
                shipping_name: jQuery('input[name="shipping_rate"]:checked').attr("shipping_rate_name"),

                tax_rate_id: jQuery('input[name="tax_rate_id"]').val(),
                tax_rate_amount: jQuery('input[name="tax_rate_amount"]').val(),
                tax_rate_name: jQuery('input[name="tax_rate_name"]').val(),
                tax_rate_percentage: jQuery('input[name="tax_rate_percentage"]').val(),

                apply_discount: JSON.stringify(apply_discount),
            },
            success: function (response) {
                if (response.status) {
                    jQuery("body").removeClass("loader-animation");
                    sessionStorage.removeItem("ecommerce_discount");
                    sessionStorage.removeItem("ecommerce_discount_code");

                    if (response?.payment_status === "Pending") {
                        jQuery("#payment_gateway_security").html(`<iframe src="${response?.redirect_url}" width="100%" height="500"></iframe>`)
                        jQuery("html, body").animate({ scrollTop: jQuery(".checkout_option").offset().top }, "slow");
                        return false;
                    } else {
                        jQuery.notify({ message: response?.message }, { type: "success" });

                        if (upsell_detail) {
                            window.location.href = `${ajax_url}/${checkout_detail.shop_id}/c/${checkout_detail.checkout_uuid}/o/${response?.data?.order_uuid}/upsells/${upsell_detail?.upsell_uuid}`;
                        } else {
                            window.location.href = `${ajax_url}/${checkout_detail.shop_id}/checkout-thankyou/${response?.data?.order_uuid}`;
                        }

                        return true;

                    }
                } else {
                    jQuery("#pay_button").removeClass("loading");
                    jQuery("#pay_button").removeClass("button-loading");
                    jQuery.notify({ message: response?.message }, { type: "danger" });
                }
            },
            error: function (error) {
                console.log("CheckoutPayment pay error-------------", error);

                jQuery("body").removeClass("loader-animation");
                jQuery("#pay_button").removeClass("loading");
                jQuery("#pay_button").removeClass("button-loading");
                jQuery.notify({ message: error?.message }, { type: "danger" });
            },
        });
    } else {
        jQuery.notify({ message: "Enter valid card details" }, { type: "danger" });
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

async function RevolutPayment() {
    let customer_detail = CustomerDetail(checkout_detail, "Revolut");

    let billing_detail;
    let billing = false;
    if (!jQuery('input[name="billing_checkbox"]').is(":checked")) {
        billing = true;
        billing_detail = BillingDetail();
    }


    jQuery("body").addClass("loader-animation");
    jQuery("#pay_button").addClass("loading");
    jQuery("#pay_button").addClass("button-loading");

    jQuery.ajax({
        type: "POST",
        dataType: "json",
        url: `${ajax_url}/pay`,
        data: {
            method: "Revolut",

            store_id: store_id,
            checkout_id: checkout_id,

            currency_name: "USD",

            subtotal: jQuery('input[name="subtotal"]').val(),
            price: jQuery('input[name="total_price"]').val(),

            email: customer_detail?.email,
            first_name: customer_detail?.first_name,
            last_name: customer_detail?.last_name,
            address: customer_detail?.address,
            phone: customer_detail?.phone,
            city: customer_detail?.city,
            zipcode: customer_detail?.zipCode,
            country: customer_detail?.country,
            state: customer_detail?.state,

            billing_status: billing,
            billing_detail: JSON.stringify(billing_detail),
            product_details: JSON.stringify(checkout_detail),
            shipping_rate_amount: jQuery('input[name="shipping_rate_amount"]').val(),
            shipping_rate_id: jQuery('input[name="shipping_rate"]:checked').attr("data-id"),
            shipping_name: jQuery('input[name="shipping_rate"]:checked').attr("shipping_rate_name"),

            tax_rate_id: jQuery('input[name="tax_rate_id"]').val(),
            tax_rate_amount: jQuery('input[name="tax_rate_amount"]').val(),
            tax_rate_name: jQuery('input[name="tax_rate_name"]').val(),
            tax_rate_percentage: jQuery('input[name="tax_rate_percentage"]').val(),

            apply_discount: JSON.stringify(apply_discount),
        },
        success: function (response) {
            if (response.status) {
                jQuery("body").removeClass("loader-animation");
                sessionStorage.removeItem("ecommerce_discount");
                sessionStorage.removeItem("ecommerce_discount_code");

                let payment_type = (PAYMENT_MODE === "live") ? "prod" : "sandbox";

                RevolutCheckout(response.public_id, payment_type).then(function (RC) {
                    RC.payWithPopup({
                        email: `${customer_detail?.email}`,
                        name: `${customer_detail?.first_name} ${customer_detail?.last_name}`,
                        // Callback called when payment finished successfully
                        onSuccess() {
                            RevolutPaymentSuccess(response.revolut_order);
                        },
                        // Callback in case some error happened
                        onError(error) {
                            console.error("RevolutPayment error ----------", error);

                            jQuery("#pay_button").removeClass("loading");
                            jQuery("#pay_button").removeClass("button-loading");
                            jQuery.notify({ message: "Payment failed!" }, { type: "danger" });
                        },
                        // (optional) Callback in case user cancelled a transaction
                        onCancel() {
                            jQuery("#pay_button").removeClass("loading");
                            jQuery("#pay_button").removeClass("button-loading");
                            jQuery.notify({ message: "Payment cancelled!" }, { type: "danger" });
                        },
                    });
                });
            } else {
                jQuery("body").removeClass("loader-animation");
                jQuery("#pay_button").removeClass("loading");
                jQuery("#pay_button").removeClass("button-loading");
                jQuery.notify({ message: response?.message }, { type: "danger" });
            }
        },
        error: function (error) {
            console.log("RevolutPayment pay error-------------", error);

            jQuery("#pay_button").removeClass("loading");
            jQuery("#pay_button").removeClass("button-loading");
            jQuery.notify({ message: error?.message }, { type: "danger" });
        },
    });
}

async function RevolutPaymentSuccess(revolut_order) {
    jQuery("body").addClass("loader-animation");
    jQuery.ajax({
        type: "POST",
        dataType: "json",
        url: `${ajax_url}/pay`,
        data: {
            action: "revolut_success",
            payment_id: revolut_order?.public_id,
        },
        success: function (response) {
            if (response?.status) {
                jQuery.notify({ message: response?.message }, { type: "success" });

                if (upsell_detail) {
                    window.location.href = `${ajax_url}/${checkout_detail.shop_id}/c/${checkout_detail.checkout_uuid}/o/${response?.data?.order_uuid}/upsells/${upsell_detail?.upsell_uuid}`;
                } else {
                    window.location.href = `${ajax_url}/${checkout_detail.shop_id}/checkout-thankyou/${response?.data?.order_uuid}`;
                }

                return true;
            } else {

                jQuery.notify({ message: response?.message }, { type: "danger" });
            }
        },
        error: function (error) {
            console.error("RevolutPaymentSuccess error-------------", error);
            jQuery.notify({ message: response.error?.message }, { type: "danger" });
        },
    });
}

async function ApplePayPayment() {

    jQuery("#pay_button").addClass("loading");
    jQuery("#pay_button").addClass("button-loading");

    const applepay_request = {
        countryCode: 'US',
        currencyCode: 'USD',
        merchantCapabilities: ['supports3DS'],
        supportedNetworks: ['visa', 'masterCard', 'amex', 'discover'],
        lineItems: [
            {
                label: 'Amount',
                // amount: 0.1,
                amount: jQuery('input[name="total_price"]').val(),
            },
        ],
        total: {
            label: 'Total',
            // amount: 0.1,
            amount: jQuery('input[name="total_price"]').val(),
        }
    };
    console.log("ApplePayPayment applepay_request --------", applepay_request);

    var session = new ApplePaySession(10, applepay_request);
    console.log("ApplePayPayment session --------", session);

    session.begin();

    try {
        session.onvalidatemerchant = event => {
            console.log("onvalidatemerchant event.validationURL----------", event.validationURL);

            // Call your own server to request a new merchant session.
            jQuery.ajax({
                type: "POST",
                dataType: "json",
                url: `${ajax_url}/applepay-validateSession`,
                data: {
                    store_id: store_id,
                    checkout_id: checkout_id,
                    appleUrl: event.validationURL
                },
                success: function (response) {
                    console.log("onvalidatemerchant response---------", response)
                    session.completeMerchantValidation(response);
                },
            });
        };

        session.onpaymentauthorized = function (event) {
            console.log("onpaymentauthorized event--------", event);

            var applePaymentToken = event.payment.token;

            console.log("onpaymentauthorized Token---------", applePaymentToken);
            console.log("onpaymentauthorized session.STATUS_SUCCESS---------", session.STATUS_SUCCESS);

            // Define ApplePayPaymentAuthorizationResult
            session.completePayment(session.STATUS_SUCCESS);

            ApplePayPaymentSuccess(applePaymentToken);
        };

        session.oncancel = function (event) {
            jQuery("#pay_button").removeClass("loading");
            jQuery("#pay_button").removeClass("button-loading");
            console.log("starting session.oncancel-----------", JSON.stringify(event));
        };
    }
    catch (error) {
        console.error("ApplePayPayment error ------------", error);
    }
};

async function ApplePayPaymentSuccess(applePaymentToken) {
    let customer_detail = CustomerDetail(checkout_detail, "Revolut");

    let billing_detail;
    let billing = false;
    if (!jQuery('input[name="billing_checkbox"]').is(":checked")) {
        billing = true;
        billing_detail = BillingDetail();
    }

    jQuery.ajax({
        type: "POST",
        dataType: "json",
        url: `${ajax_url}/pay`,
        data: {
            method: "apple_pay",
            store_id: store_id,
            checkout_id: checkout_id,
            applePaymentToken: JSON.stringify(applePaymentToken),

            currency_name: "USD",
            subtotal: jQuery('input[name="subtotal"]').val(),
            price: jQuery('input[name="total_price"]').val(),

            email: customer_detail?.email,
            first_name: customer_detail?.first_name,
            last_name: customer_detail?.last_name,
            address: customer_detail?.address,
            phone: customer_detail?.phone,
            city: customer_detail?.city,
            zipcode: customer_detail?.zipCode,
            country: customer_detail?.country,
            state: customer_detail?.state,

            billing_status: billing,
            billing_detail: JSON.stringify(billing_detail),
            product_details: JSON.stringify(checkout_detail),
            shipping_rate_amount: jQuery('input[name="shipping_rate_amount"]').val(),
            shipping_rate_id: jQuery('input[name="shipping_rate"]:checked').attr("data-id"),
            shipping_name: jQuery('input[name="shipping_rate"]:checked').attr("shipping_rate_name"),

            tax_rate_id: jQuery('input[name="tax_rate_id"]').val(),
            tax_rate_amount: jQuery('input[name="tax_rate_amount"]').val(),
            tax_rate_name: jQuery('input[name="tax_rate_name"]').val(),
            tax_rate_percentage: jQuery('input[name="tax_rate_percentage"]').val(),

            apply_discount: JSON.stringify(apply_discount),
        },
        success: function (response) {
            if (response?.status) {
                sessionStorage.removeItem("ecommerce_discount");
                sessionStorage.removeItem("ecommerce_discount_code");

                window.location.href = `${ajax_url}/${store_id}/checkout-thankyou/${response?.data?.order_uuid}`;
                // if (upsellTriggerData.length > 0 && upsellData.status) {
                //     window.location.href = `${ajax_url}/${store_id}/c/${checkout_detail.checkout_uuid}/o/${response?.data?.order_uuid}/upsells`;
                // } else {
                //     window.location.href = `${ajax_url}/${store_id}/checkout-thankyou/${response?.data?.order_uuid}`;
                // }
                return true;
            } else {
                jQuery("#pay_button").removeClass("loading");
                jQuery("#pay_button").removeClass("button-loading");
                jQuery.notify({ message: response?.message }, { type: "danger" });
            }
        },
        error: function (error) {
            console.error("ApplePayPaymentSuccess pay error-------------", error);

            jQuery("#pay_button").removeClass("loading");
            jQuery("#pay_button").removeClass("button-loading");
            jQuery.notify({ message: error?.message }, { type: "danger" });
        },
    });
}

function CustomerDetail(checkout_detail, shipping_method) {
    var email = jQuery("input[name='email']").val(),
        first_name = jQuery("input[name='first_name']").val(),
        last_name = jQuery("input[name='last_name']").val(),
        address = jQuery("input[name='address']").val(),
        phone = jQuery("input[name='phone']").val(),
        city = jQuery("input[name='city']").val(),
        zip = jQuery("input[name='zip_code']").val(),
        country = jQuery("select[name='shipping_country']").val(),
        state = jQuery("select[name='shipping_state']").val();

    var order_detail = {
        shipping_method: shipping_method,
        checkout_id: checkout_detail?.id,
        store_id: checkout_detail?.shop_id,
        email: email,
        first_name: first_name,
        last_name: last_name,
        address: address,
        phone: phone,
        city: city,
        zipCode: zip,
        country: country,
        state: state,
    };
    return order_detail;
}

function BillingDetail() {
    var first_name = jQuery("input[name='billing_first_name']").val(),
        last_name = jQuery("input[name='billing_last_name']").val(),
        address = jQuery("input[name='billing_address']").val(),
        city = jQuery("input[name='billing_city']").val(),
        zip = jQuery("input[name='billing_zip_code']").val(),
        country = jQuery("select[name='billing_country']").val(),
        state = jQuery("select[name='billing_state']").val(),
        company_name = jQuery("input[name='billing_company_name']").val();

    var billing_detail = {
        billing_first_name: first_name,
        billing_last_name: last_name,
        billing_address: address,
        billing_city: city,
        billing_zip_code: zip,
        billing_country: country,
        billing_state: state,
        billing_company_name: company_name,
    };
    return billing_detail;
}

const luhnCheck = (val) => {
    let checksum = 0; // running checksum total
    let j = 1; // takes value of 1 or 2

    // Process each digit one by one starting from the last
    for (let i = val.length - 1; i >= 0; i--) {
        let calc = 0;
        // Extract the next digit and multiply by 1 or 2 on alternative digits.
        calc = Number(val.charAt(i)) * j;

        // If the result is in two digits add 1 to the checksum total
        if (calc > 9) {
            checksum = checksum + 1;
            calc = calc - 10;
        }

        // Add the units element to the checksum total
        checksum = checksum + calc;

        // Switch the value of j
        if (j == 1) {
            j = 2;
        } else {
            j = 1;
        }
    }

    //Check if it is divisible by 10 or not.
    return checksum % 10 == 0;
};

const validateCardNumber = (number) => {
    //Check if the number contains only numeric value
    //and is of between 13 to 19 digits

    var creditCardNumber = number.replace(/[\s-]/g, "");

    // Check if the credit card number contains only digits
    if (!/^\d+$/.test(creditCardNumber)) {
        return false;
    }

    // Check if the credit card number is between 13 and 16 digits long
    if (creditCardNumber.length < 13 || creditCardNumber.length > 16) {
        return false;
    }

    // Use the Luhn algorithm to validate the credit card number
    let sum = 0;
    for (let i = 0; i < creditCardNumber.length; i++) {
        let digit = parseInt(creditCardNumber[i], 10);
        if ((creditCardNumber.length - i) % 2 === 0) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }
        sum += digit;
    }
    return sum % 10 === 0;
};

const checkCreditCard = (cardNumber) => {
    //Error messages
    const ccErrors = [];
    ccErrors[0] = "Unknown card type";
    ccErrors[1] = "No card number provided";
    ccErrors[2] = "Credit card number is in invalid format";
    ccErrors[3] = "Credit card number is invalid";
    ccErrors[4] = "Credit card number has an inappropriate number of digits";
    ccErrors[5] = "Warning! This credit card number is associated with a scam attempt";

    //Response format
    const response = (success, message = null, type = null) => ({
        message,
        success,
        type,
    });

    // Define the cards we support. You may add additional card types as follows.

    //  Name:         As in the selection box of the form - must be same as user's
    //  Length:       List of possible valid lengths of the card number for the card
    //  prefixes:     List of possible prefixes for the card
    //  checkDigit:   Boolean to say whether there is a check digit
    const cards = [];

    if (card_accepted.includes("accepts_visa")) {
        cards[0] = {
            name: "Visa",
            length: "13,16",
            prefixes: "4",
            checkDigit: true,
        };
    }
    if (card_accepted.includes("accepts_mastercard")) {
        cards[1] = {
            name: "MasterCard",
            length: "16",
            prefixes: "51,52,53,54,55",
            checkDigit: true,
        };
    }
    if (card_accepted.includes("accepts_amex")) {
        cards[2] = {
            name: "AmEx",
            length: "15",
            prefixes: "34,37",
            checkDigit: true,
        };
    }
    if (card_accepted.includes("accepts_maestro")) {
        cards[3] = {
            name: "Maestro",
            length: "12,13,14,15,16,18,19",
            prefixes: "5018,5020,5038,6304,6759,6761,6762,6763",
            checkDigit: true,
        };
    }
    if (card_accepted.includes("accepts_jcb")) {
        cards[4] = {
            name: "JCB",
            length: "16",
            prefixes: "35",
            checkDigit: true,
        };
    }
    if (card_accepted.includes("accepts_discover")) {
        cards[5] = {
            name: "Discover",
            length: "16",
            prefixes: "6011,622,64,65",
            checkDigit: true,
        };
    }
    if (card_accepted.includes("accepts_diners_club")) {
        cards[6] = {
            name: "DinersClub",
            length: "14,16",
            prefixes: "36,38,54,55",
            checkDigit: true,
        };
    }
    // console.log(cards);

    // Ensure that the user has provided a credit card number
    if (cardNumber.length == 0) {
        return response(false, ccErrors[1]);
    }

    // Now remove any spaces from the credit card number
    // Update this if there are any other special characters like -
    cardNumber = cardNumber.replace(/\s/g, "");

    // Validate the format of the credit card
    // luhn's algorithm
    if (!/^\d+$/.test(cardNumber)) {
        console.log("digit error", cardNumber);
        return false;
    }

    // Check if the credit card number is between 13 and 19 digits long
    if (cardNumber.length < 13 || cardNumber.length > 19) {
        console.log("Check if the credit card number is between 13 and 19 digits long");
        return false;
    }

    // Check it's not a spam number
    if (cardNumber == "5490997771092064") {
        return response(false, ccErrors[5]);
    }

    // The following are the card-specific checks we undertake.
    let lengthValid = false;
    let prefixValid = false;
    let cardCompany = "";

    // Check if card belongs to any organization

    for (let i = 0; i < cards.length; i++) {
        if (cards[i]?.prefixes !== undefined) {
            const prefix = cards[i].prefixes.split(",");

            for (let j = 0; j < prefix.length; j++) {
                const exp = new RegExp("^" + prefix[j]);
                if (exp.test(cardNumber)) {
                    prefixValid = true;
                }
            }

            if (prefixValid) {
                const lengths = cards[i].length.split(",");
                // Now see if its of valid length;
                for (let j = 0; j < lengths.length; j++) {
                    if (cardNumber.length == lengths[j]) {
                        lengthValid = true;
                    }
                }
            }

            if (lengthValid && prefixValid) {
                cardCompany = cards[i].name;
                return response(true, null, cardCompany);
            }
        }
    }

    // If it isn't a valid prefix there's no point at looking at the length
    console.log("prefixValid", prefixValid);
    if (!prefixValid) {
        return response(false, ccErrors[3]);
    }

    // See if all is OK by seeing if the length was valid

    if (!lengthValid) {
        return response(false, ccErrors[4]);
    }

    // The credit card is in the required format.
    return response(true, null, cardCompany);
};

function formatCreditCardNumber(creditCardNumber) {
    // Remove any existing spaces or dashes from the credit card number
    creditCardNumber = creditCardNumber.replace(/[\s-]/g, "");

    // Insert a space every four characters
    creditCardNumber = creditCardNumber.replace(/(.{4})/g, "$1 ");

    // Trim any extra whitespace
    creditCardNumber = creditCardNumber.trim();

    return creditCardNumber;
}