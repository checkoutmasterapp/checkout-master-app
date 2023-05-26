// const REQ_URL = "http://localhost:8001";

// const e = require("express");

jQuery(document).ready(function () {
    // https://codepen.io/yaphi1/pen/KpbRZL
    // 10 minutes from now
    /*
     * 10 minute timer implement
     */
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
        function run_clock(id, endTime) {
            var clock = document.getElementById(id);
            function update_clock() {
                var timer = time_remaining(endTime);
                clock.innerHTML = "Your cart is reserved for " + timer.minutes + ":" + timer.seconds + " minutes.";
                if (timer.total <= 0) {
                    history.back();
                    clearInterval(timeInTerval);
                }
            }
            update_clock(); // run function once at first to avoid delay
            var timeInTerval = setInterval(update_clock, 1000);
        }
        run_clock("clockDiv", deadline);
    }

    if (jQuery('input[name="payment_method"]').is(":checked")) {
        var val = jQuery(this).val(); // retrieve the value

        if (val == "Stripe") {
            jQuery("#pay_button").prop("disabled", true);
            jQuery(".credit_card").show("slow");
        }
    }

    if (jQuery('input[name="shipping_rate"]')) {
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

    /**
     * Shipping Rate Implement
     */
    if (jQuery("#lang-btn").val() != undefined) {
        timer = setInterval(checkScriptExists, 1000);
        setTimeout(function () {
            translateLanguage(this.value);
        }, 1000);
    }

    /*
     * Change Translate language
     */
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

    /*
     * Show error massages
     */
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

    /*
     * Show Billing Form
     */
    jQuery("#billing-checkbox").on("change", function (e) {
        let isChecked = jQuery("#billing-checkbox")[0].checked;
        if (!isChecked) {
            jQuery("#billing-details").show("slow");
        } else {
            jQuery("#billing-details").hide("slow");
        }
    });

    /*
     * Payment Button enable and disable when chose payment method
     */
    jQuery('input[name="payment_method"]').change(function () {
        // bind a function to the change event
        if (jQuery(this).is(":checked")) {
            // check if the radio is checked
            var val = jQuery(this).val(); // retrieve the value
            if (val == "Stripe") {
                jQuery("#pay_button").prop("disabled", true);
                jQuery(".credit_card").show("slow");
            } else {
                jQuery("#pay_button").prop("disabled", false);
                jQuery(".credit_card").hide("slow");
            }
        }
    });

    /*
     * Credit Card Validation
     */
    jQuery(".credit_card input[type=text]").on("keyup", function () {
        cardFormValidate();
    });

    /*
     * Click Payment Button
     */
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

        if (shippingDetails && shipping_status && billingDetails) {
            var select_option = document.querySelector('input[name="payment_method"]:checked').value;
            if (select_option) {
                if (select_option == "Stripe") {
                    paymentGateway(select_option);
                }
                if (select_option == "PayPal") {
                    paymentGateway(select_option);
                }
            }
        }
    });

    /*
     * Fetch Shipping country and state
     */
    jQuery('select[name="shipping_country"]').change(function () {
        let productWeight = 0;
        for (let i = 0; i < checkout_detail.carts.length; i++) {
            productWeight += parseInt(checkout_detail.carts[i].product_weight);
        }
        let shippingDetails = [];
        let uniqueShippingDetails;
        if (shipping_options?.length > 0) {
            shipping_options.forEach((element) => {
                let minPrice = element?.shipping_rate_min_amount
                let maxPrice = element?.shipping_rate_max_amount
                let minWeight = element?.shipping_rate_min_weight * 1000
                let maxWeight = element?.shipping_rate_max_weight * 1000
                console.log("min price:", minPrice,"max price:", maxPrice,"minWeight :", minWeight,"maxWeight :", maxWeight, "productWeight:", productWeight, "totalPrice:", totalPrice)
                if (element?.country_codes?.length > 0) {
                    element?.country_codes.forEach((item) => {
                        if (item.includes(jQuery(this).find(":selected").attr("country_code"))) {
                            // console.log("weights condition",productWeight > 0  && productWeight >= minWeight && productWeight <= maxWeight || productWeight > 0  &&  minWeight == 0 && productWeight <= maxWeight || productWeight > 0  && maxWeight == 0 &&  productWeight >= minWeight)
                            console.log("overall condition", totalPrice >= minPrice && totalPrice <= maxPrice || minPrice === 0 && totalPrice <= maxPrice || maxPrice === 0 && totalPrice >= minPrice || productWeight > 0  && productWeight >= minWeight && productWeight <= maxWeight || productWeight > 0  &&  minWeight === 0 && productWeight <= maxWeight || productWeight > 0  && maxWeight === 0 &&  productWeight >= minWeight)
                            if (totalPrice >= minPrice && totalPrice <= maxPrice || minPrice === 0 && totalPrice <= maxPrice || maxPrice === 0 && totalPrice >= minPrice || productWeight > 0  && productWeight >= minWeight && productWeight <= maxWeight || productWeight > 0  &&  minWeight === 0 && productWeight <= maxWeight || productWeight > 0  && maxWeight === 0 &&  productWeight >= minWeight) {
                                // if (productWeight > 0  && productWeight >= minWeight && productWeight <= maxWeight || productWeight > 0  &&  minWeight === 0 && productWeight <= maxWeight || productWeight > 0  && maxWeight === 0 &&  productWeight >= minWeight) {
                                    shippingDetails.push(`
                                        <label class="main-full-width">
                                            <div class="main-inner-free">
                                                <input
                                                    type="radio"
                                                    class="shipping-free"
                                                    name="shipping_rate"
                                                    data-id=${element.id}
                                                    shipping_rate_name='${element.shipping_rate_name}'
                                                    value=${element ? element.shipping_rate_price : "n/a"}
                                                    style=accent-color:${customize_checkout ? customize_checkout.accent_color : "#C23B19"}
                                                />
                                                <p>${element ? element.shipping_rate_name : "n/a"}</p>
                                                <span>${element ? "$" + element.shipping_rate_price + ".00" : "n/a"}</span>
                                            </div>
                                        </label>
                                    `);
                                    uniqueShippingDetails = [...new Set(shippingDetails)];
                                // } else {
                                    // shippingDetails.push(`
                                    //     <label class="main-full-width">
                                    //         <div class="main-inner-free">
                                    //             <input
                                    //                 type="radio"
                                    //                 class="shipping-free"
                                    //                 name="shipping_rate"
                                    //                 data-id=${element.id}
                                    //                 shipping_rate_name='${element.shipping_rate_name}'
                                    //                 value=${element ? element.shipping_rate_price : "n/a"}
                                    //                 style=accent-color:${customize_checkout ? customize_checkout.accent_color : "#C23B19"}
                                    //             />
                                    //             <p>${element ? element.shipping_rate_name : "n/a"}</p>
                                    //             <span>${element ? "$" + element.shipping_rate_price + ".00" : "n/a"}</span>
                                    //         </div>
                                    //     </label>
                                    // `);
                                    // uniqueShippingDetails = [...new Set(shippingDetails)];
                                // }
                            }
                        }
                        
                    });
                }
            });
        }

        if (uniqueShippingDetails?.length > 0) {
            shippingRateHtml = "";
            uniqueShippingDetails.forEach((element, index) => {
                shippingRateHtml += element;
            });
            jQuery(".shipping_implement").html(shippingRateHtml);
            jQuery("input[name='shipping_rate']:first").click();
        } else {
            jQuery(".shipping_implement").html(`
				<div class="no-shipping-detail">
					<div class="card" data-function="shipping-card">
						<div data-function="shipping-list">
							<div class="shipping-message" data-function="no-shipping-options">
								<p class="no-shipping-options">
									<i class="fa fa-globe"></i>
									No shipping options are available for your location
								</p>
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
                data: {
                    country_code: jQuery(this).find(":selected").attr("country_code"),
                },
                success: function (response) {
                    if (response.status) {
                        if (response.states?.length > 0) {
                            let option_html = `<option value="">Select State</option>`;
                            $.each(response.states, function (index, value) {
                                option_html += `<option value="${value?.state_name}">${value.state_name}</option>`;
                            });
                            $("#shipping_state").html(option_html);
                            jQuery(".shipping_state_section").show();
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
    });

    /*
     * Change total amount if checked shipping rates
     */
    jQuery(document).on("click change", 'input[name="shipping_rate"]', function (event) {
        let jquery_this = jQuery(this);

        let shipping_rate = jquery_this.val();
        let shipping_id = jquery_this.attr("data-id");
        let shipping_rate_name = jquery_this.attr("shipping_rate_name");
        
        console.log("shipping_rate_name-----------",shipping_rate_name);

        let total_price = parseFloat(totalPrice) + parseFloat(shipping_rate);
        console.log("console.log(total_price)",shipping_rate)
        jQuery(".total-span").html(`
			$${total_price.toFixed(2)}
			<input type="hidden" name="subtotal" value="${totalPrice}" />
			<input type="hidden" name="total_price" value="${total_price.toFixed(2)}" />
		`);
        jQuery("#button_price").html(`$${total_price.toFixed(2)}`);

        jQuery(".free-shipping").html(`
			${shipping_rate_name} <span class="shipping_rate">$${shipping_rate}</span>
            <input type="hidden" name="shipping_rate_name" value="${shipping_rate_name}" />
			<input type="hidden" name="shipping_rate_amount" value="${shipping_rate}" />
		`);
    });

    /*
     * fetch billing country and state
     */
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
                                option_html += `<option value="${value?.state_name}">${value.state_name}</option>`;
                            });
                            $("#billing_state_drop").html(option_html);
                            jQuery(".billing_state_section").show();
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
});

/*
 * Credit Card Validate Function
 */
function cardFormValidate() {
    var cardValid = 0;
    //card number validation
    let checkCardCompany = checkCreditCard(jQuery("#card_number").val());
    if (checkCardCompany.success) {
        jQuery("#card_number").removeClass("requiredBorder");
        cardValid = 1;
    } else {
        jQuery("#card_number").addClass("requiredBorder");
        cardValid = 0;
    }
    console.log(checkCreditCard(jQuery("#card_number").val()));
    //card details validation
    var expMonth = jQuery("#expiry_month").val();
    var expYear = jQuery("#expiry_year").val();
    var cvv = jQuery("#cvv").val();
    var regMonth = /01|02|03|04|05|06|07|08|09|10|11|12/gi;
    var regYear = /^2023|2024|2025|2026|2027|2028|2029|2030|2031$/;
    var regCVV = /^[0-9]{3,3}$/;
    // /_createdDate|_createdTime|user_name|bid_name|APP_URL|APP_BUILD_URL|bidhq_view_link|bid_due_date|user_icon|client_name/gi,
    if (cardValid == 0) {
        jQuery("#card_number").addClass("requiredBorder");
    } else {
        jQuery("#card_number").removeClass("requiredBorder");
    }
    if (!regMonth.test(expMonth)) {
        jQuery("#expiry_month").addClass("requiredBorder");
    } else {
        jQuery("#expiry_month").removeClass("requiredBorder");
    }
    if (!regYear.test(expYear)) {
        jQuery("#expiry_year").addClass("requiredBorder");
    } else {
        jQuery("#expiry_year").removeClass("requiredBorder");
    }
    if (!regCVV.test(cvv)) {
        jQuery("#cvv").addClass("requiredBorder");
    } else {
        jQuery("#cvv").removeClass("requiredBorder");
    }

    console.log(cardValid, regMonth.test(expMonth), regYear.test(expYear), regCVV.test(cvv));

    if (cardValid === 1 && regMonth.test(expMonth) && regYear.test(expYear) && regCVV.test(cvv)) {
        jQuery("#card_number").removeClass("requiredBorder");
        jQuery("#expiry_month").removeClass("requiredBorder");
        jQuery("#expiry_year").removeClass("requiredBorder");
        jQuery("#cvv").removeClass("requiredBorder");
        jQuery("#pay_button").prop("disabled", false);
        return true;
    } else {
        jQuery("#pay_button").prop("disabled", true);
        return false;
    }
}

/*
 * Billing Details Validate Function
 */
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
        jQuery("#billing_first_name").show();
        jQuery("input[name='billing_first_name']").css("border-color", jQuery("input[name='billing_first_name']").attr("class"));
    } else {
        jQuery("#billing_first_name").hide();
    }
    if (!address) {
        jQuery("#billing_address").show();
        jQuery("input[name='billing_address']").css("border-color", jQuery("input[name='billing_address']").attr("class"));
    } else {
        jQuery("#billing_address").hide();
    }
    if (!city) {
        jQuery("#billing_city").show();
        jQuery("input[name='billing_city']").css("border-color", jQuery("input[name='billing_city']").attr("class"));
    } else {
        jQuery("#billing_city").hide();
    }
    if (!zip) {
        jQuery("#billing_zip_code").show();
        jQuery("input[name='billing_zip_code']").css("border-color", jQuery("input[name='billing_zip_code']").attr("class"));
    } else {
        if (!zipCode.test(zip)) {
            jQuery("#billing_zip_code").html("Enter valid Zip code");
            jQuery("input[name='billing_zip_code']").css("border-color", jQuery("input[name='billing_zip_code']").attr("class"));
        } else {
            jQuery("#billing_zip_code").hide();
        }
    }
    if (!country) {
        jQuery("#billing_country").show();
        jQuery("select[name='billing_country']").css("border-color", jQuery("select[name='billing_country']").attr("class"));
    } else {
        jQuery("select[name='billing_country']").css("border-color", "");
        jQuery("#billing_country").hide();
    }
    if (!state) {
        jQuery("#billing_state").show();
        jQuery("select[name='billing_state']").css("border-color", jQuery("select[name='billing_state']").attr("class"));
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

/*
 * Shipping Details Validate Function
 */
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

    if (customize_checkout.require_address_number) phone = jQuery("input[name='phone']").val();
    else phone = true;

    if (!email) {
        jQuery("#email").show();
        jQuery("input[name='email']").css("border-color", jQuery("input[name='email']").attr("class"));
    } else {
        if (!emailRegex.test(email)) {
            jQuery("#email").html("Enter valid email");
            jQuery("input[name='email']").css("border-color", jQuery("input[name='email']").attr("class"));
        } else {
            jQuery("#email").hide();
        }
    }

    if (!first_name) {
        jQuery("#first_name").show();
        jQuery("input[name='first_name']").css("border-color", jQuery("input[name='first_name']").attr("class"));
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
    } else {
        jQuery("#address").hide();
    }
    if (!phone) {
        jQuery("#phone").show();
        jQuery("input[name='phone']").css("border-color", jQuery("input[name='phone']").attr("class"));
    } else {
        if (!mobile_no.test(phone)) {
            jQuery("#phone").html("Enter valid mobile no");
            jQuery("input[name='phone']").css("border-color", jQuery("input[name='phone']").attr("class"));
        } else {
            jQuery("#phone").hide();
        }
    }
    if (!city) {
        jQuery("#city").show();
        jQuery("input[name='city']").css("border-color", jQuery("input[name='city']").attr("class"));
    } else {
        jQuery("#city").hide();
    }
    if (!zip) {
        jQuery("#zip_code").show();
        jQuery("input[name='zip_code']").css("border-color", jQuery("input[name='zip_code']").attr("class"));
    } else {
        if (!zipCode.test(zip)) {
            jQuery("#zip_code").html("Enter valid Zip code");
            jQuery("input[name='zip_code']").css("border-color", jQuery("input[name='zip_code']").attr("class"));
        } else {
            jQuery("#zip_code").hide();
        }
    }
    if (!country) {
        jQuery("#shipping_country_error").show();
        jQuery("select[name='shipping_country']").css("border-color", jQuery("select[name='shipping_country']").attr("class"));
    } else {
        jQuery("select[name='shipping_country']").css("border-color", "");
        jQuery("#shipping_country_error").hide();
    }
    if (!state) {
        jQuery("#shipping_state_error").show();
        jQuery("select[name='shipping_state']").css("border-color", jQuery("select[name='shipping_state']").attr("class"));
    } else {
        jQuery("select[name='shipping_state']").css("border-color", "");
        jQuery("#shipping_state_error").hide();
    }
    console.log(emailRegex.test(email), first_name, address, city, zipCode.test(zip), phone, country, state);
    if (emailRegex.test(email) && first_name != null && address != null && city != null && zipCode.test(zip) && phone != null && country != null && state != null) {
        return true;
    } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return false;
    }
}

// async function CustomerDetails(){
//     const SippingDetails = await shippingDetailValidation();
//     const BillingDetails = true;
//     if (jQuery('input[name="shipping_rate"]').is(":checked")) {
//         sipping_rate = jQuery('input[name="shipping_rate"]').val().slice(1, 3);
//     }
// }

async function paymentGateway(select_option) {
    switch (select_option) {
        case "Stripe":
            StripePayment(product_details, checkout_detail);
            break;
        case "PayPal":
            PayPalPayment(product_details, checkout_detail);
            break;
        case "cash_on_delivery":
            CashOnDelivery();
            break;
        default:
        // code block
    }
}

async function StripePayment(product_details, checkout_detail) {
    // Stripe payment
    var expiry_month = jQuery("#expiry_month").val(),
        expiry_year = jQuery("#expiry_year").val(),
        cvv = jQuery("#cvv").val(),
        card_number = jQuery("#card_number").val();

    let Customer = CustomerDetail(checkout_detail, "Stripe");

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
        dataType: "json",
        url: `${ajax_url}/pay`,
        data: {
            product_details: JSON.stringify(checkout_detail),
            subtotal: jQuery('input[name="subtotal"]').val(),
            price: jQuery('input[name="total_price"]').val(),
            shipping_rate_id: jQuery('input[name="shipping_rate"]:checked').attr("data-id"),
            shipping_rate_amount: jQuery('input[name="shipping_rate_amount"]').val(),
            shipping_name: jQuery('input[name="shipping_rate"]').attr("shipping_rate_name"),
            currency_name: "USD",
            card_number: card_number,
            expiry_month: expiry_month,
            expiry_year: expiry_year,
            cvv: cvv,
            email: Customer.email,
            first_name: Customer.first_name,
            last_name: Customer.last_name,
            address: Customer.address,
            phone: Customer.phone,
            city: Customer.city,
            zipcode: Customer.zipCode,
            country: Customer.country,
            state: Customer.state,
            method: "stripe",
            store_id: checkout_detail.shop_id,
            billing_status: billing,
            billingDetails: JSON.stringify(billingDetails)
        },
        success: function (response) {
            if (response.response?.status) {
                jQuery.ajax({
                    type: "POST",
                    url: `${ajax_url}/order-create`,
                    data: {
                        status: "true",
                        billing_status: billing,
                        customer: JSON.stringify(Customer),
                        card_brand: response.response?.card_brand,
                        stripe_cardNo: response.response?.stripe_cardNo,
                        billing_details: JSON.stringify(billingDetails),
                    },
                    success: function (response) {
                        if (response.status) {
                            window.location.href = `${ajax_url}/${checkout_detail.shop_id}/checkout-thankyou/${response?.data?.id}`;
                            // window.location.href = `${ajax_url}/${checkout_detail.shop_id}/checkout-thankyou/${checkout_detail.id}`;
                            return true;
                        }else{
                            jQuery("#pay_button").removeClass("button-loading");
                            jQuery("#pay_button").removeClass("loading");
                        }
                    },
                    error: function (response) {
                        jQuery("#pay_button").removeClass("button-loading");
                        jQuery("#pay_button").removeClass("loading");
                        console.error("order-create error------------------", response.responseText);
                    },
                });
            }
            if (response?.error) {
                jQuery("#pay_button").removeClass("button-loading");
                jQuery("#pay_button").removeClass("loading");
                console.error(response, "response");
                jQuery.notify({ message: response?.error.error.raw.message }, { type: "danger" });
            }
        },
        error: function (response) {
            jQuery("#pay_button").removeClass("button-loading");
            jQuery("#pay_button").removeClass("loading");
            console.error(response.responseText, "response error");
        },
    });
}

async function PayPalPayment(product_details, checkout_detail) {
    // Paypal payment
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
        sipping_rate = jQuery('input[name="shipping_rate"]').val().slice(1, 3);
    }
    let CustomerDetails = CustomerDetail(checkout_detail, "PayPal");

    await jQuery.ajax({
        type: "POST",
        url: `${ajax_url}/pay`,
        data: {
            data: JSON.stringify(productData),
            shop_id: checkout_detail.shop_id,
            checkout_id: checkout_detail.id,
            method: "paypal",
            single: true,
            sipping_rate: sipping_rate,
        },
        success: function (response) {
            if (response.payment_url) {
                jQuery.ajax({
                    type: "POST",
                    url: `${ajax_url}/order-create`,
                    data: { data: JSON.stringify(CustomerDetails), status: "false" },
                    success: function (response) {
                        if (response.success) {
                            return true;
                        }
                    },
                    error: function (response) {
                        jQuery.notify({ message: response.responseText }, { type: "error" });
                        console.error(response.responseText, "response error");
                    },
                });

                return (payment_url = response.payment_url);
            }
        },
        error: function (response) {
            alert(response.responseText);
        },
    });
    window.location.href = payment_url;
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
        checkout_id: checkout_detail.id,
        store_id: checkout_detail.shop_id,
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
    const regex = new RegExp("^[0-9]{13,19}$");
    if (!regex.test(number)) {
        return false;
    }

    return luhnCheck(number);
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
    if (!validateCardNumber(cardNumber)) {
        return response(false, ccErrors[2]);
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

async function selectCountry() {}