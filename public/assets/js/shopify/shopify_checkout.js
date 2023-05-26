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


let phone_code;
var money_format = customize_checkout?.money_format;

jQuery(document).ready(async function () {
    let localised_country_code;
    await $.get("https://ipapi.co/country_calling_code/", function (response) {
        localised_country_code = response
        phone_code = response
    });

    var shipping_phone_number = jQuery(".shipping_phone_number");
    shipping_phone_number.val(`${localised_country_code}`);
    shipping_phone_number.keyup(function (e) {
        var selected_country = shipping_phone_number.intlTelInput("getSelectedCountryData")
        phone_code = `+${selected_country?.dialCode}`
        let newNumber = jQuery(".shipping_phone_number").val()

        if (e.keyCode == 8 && (newNumber.length < phone_code.length || newNumber === '+undefined')) {
            shipping_phone_number.val(`+${selected_country?.dialCode}`);
            e.preventDefault()
        }
    })


    shipping_phone_number.intlTelInput({
        formatOnDisplay: true,
        // separateDialCode: true,
    });
    shipping_phone_number.on("countrychange", function () {
        var selected_country_flag = shipping_phone_number.intlTelInput("getSelectedCountryData")
        shipping_phone_number.val(`+${selected_country_flag?.dialCode}`);
        phone_code = `+${selected_country_flag?.dialCode}`

        console.log("shipping_phone_number selected_country_flag-------", selected_country_flag);
    });

    jQuery(".resposive-dhdh").click(function () {
        jQuery(".smry-data-show").toggle("slow");
        jQuery(".resposive-dhdh").toggleClass("active");
    });

    /**************************************************
        *** 10 minute timer implement
        *** Display a scarcity timer on the Checkout
        *** https://codepen.io/yaphi1/pen/KpbRZL
    **************************************************/
    if (customize_checkout?.display_timer) {
        var time_in_minutes = 10;
        var current_time = Date.parse(new Date());
        var deadline = new Date(current_time + time_in_minutes * 60 * 1000);

        function time_remaining(endTime) {
            var timer = Date.parse(endTime) - Date.parse(new Date());
            var seconds = Math.floor((timer / 1000) % 60);
            var minutes = Math.floor((timer / 1000 / 60) % 60);
            minutes = (minutes < 10 ? '0' : '') + minutes;
            seconds = (seconds < 10 ? '0' : '') + seconds;
            return { total: timer, minutes: minutes, seconds: seconds };
        }

        var scarcity_clock_section = jQuery(".scarcity_clock_section").html();
        function update_clock() {
            var timer = time_remaining(deadline);
            let clock_timer = `${timer.minutes}:${timer.seconds}`;

            let scarcity_clock_html = scarcity_clock_section.replace("clock_timer", clock_timer);
            jQuery(".scarcity_clock_section").html(scarcity_clock_html)

            if (timer.total <= 0) {
                window.location.href = `https://${store_detail.store_domain}`
                // history.back();
                clearInterval(timeInTerval);
            }
            jQuery(".scarcity_clock_section").show();
        }

        update_clock();
        var timeInTerval = setInterval(update_clock, 1000);
    }

    // Fetch Shipping country and state
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

    // Checkout Digital
    if (jQuery('input[name="digital"]').val() === 'digital') {
        jQuery(".billing-form").toggle("slow");
    }

    jQuery(document).on("change", 'input[name="who_buying"]', function (event) {
        let who_buying = jQuery(this).val();
        if (who_buying === "someone_else") {
            jQuery(".gift_someone_section").show("slow");
        } else {
            jQuery(".gift_someone_section").hide("slow");
        }
    });

    jQuery(document).on("change", 'input[name="delivery_date"]', function (event) {
        let who_buying = jQuery(this).val();
        if (who_buying === "future_date") {
            jQuery(".delivery_date_future").show("slow");
        } else {
            jQuery(".delivery_date_future").hide("slow");
        }
        time_selector()
    });


    // Shipping method
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


                var shipping_rate_price = shipping_option.shipping_rate_price;
                if (shipping_include === true) {
                    shipping_detail_html += `
                        <label class="main-inr-payment ss-kjmar">
                            <div class="main-inner-payment">
                                <img src="/assets/img/XMLID_678_.png" />
                                <p class="shipp-12-e">${shipping_option ? shipping_option.shipping_rate_name : "n/a"}</p>
                                <span>${shipping_option ? shopify_money_format(shipping_rate_price, customize_checkout?.money_format) : "n/a"}</span>
                            </div>
                            <div class="main-iner-right-pay">
                                <input
                                    type="radio"
                                    class="shipping-free radio-style"
                                    name="shipping_rate"
                                    data-id=${shipping_option.id}
                                    shipping_rate_name='${shipping_option.shipping_rate_name}'
                                    value=${shipping_option ? shipping_option.shipping_rate_price : "n/a"}
                                />
                            </div>
                        </label>
                    `;
                }
            });
        } else {
            shipping_detail_html += `
                <div class="no-shipping-detail">
                    <div class="chekshade">
                        <div>
                            <div class="shipping-message" data-function="no-shipping-options">
                                <p class="no-shipping-options"><i class="fa fa-globe"></i>No shipping options are available for your location</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
        jQuery(".shipping_method_html").html(shipping_detail_html);
        jQuery("input[name='shipping_rate']:first").click();

        // Get State on the base of country
        try {
            jQuery.ajax({
                type: "POST",
                dataType: "json",
                url: `${store_domain_url}/select-state`,
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

                            if (initGeoLoc) {
                                jQuery(`select[name="shipping_state"] [code="${initGeoLoc?.region}"]`).prop("selected", true);
                            }
                        } else {
                            jQuery(".shipping_state_section").hide();
                        }
                    }
                },
                error: function (error) {
                    console.error("shipping_country error-------", error);
                },
            });
        } catch (error) {
            console.error("shipping_country error-------", error);
        }

        load_checkout_price_section();
    });

    jQuery(document).on("change", 'input[name="email"]', function (event) {
        const email = jQuery("input[name='email']").val()
        const first_name = jQuery("input[name='first_name']").val()
        const last_name = jQuery("input[name='last_name']").val()
        const emailRegex = /^([_\-\.0-9a-zA-Z]+)@([_\-\.0-9a-zA-Z]+)\.([a-zA-Z]){2,7}$/

        console.log("*******email********252",)

        if (!email) {
            jQuery("input[name='email']").addClass("error");
            jQuery.notify({ message: "Email field is required" }, { type: "danger" });
        } else {
            if (!emailRegex.test(email)) {
                jQuery("input[name='email']").addClass("error");
                jQuery.notify({ message: "Enter valid email" }, { type: "danger" });
            } else {
                jQuery("input[name='email']").removeClass("error");
            }
        }

        if ((email && first_name && last_name && emailRegex.test(email)) || (jQuery('input[name="digital"]').val() === 'digital' && email && emailRegex.test(email))) {
            jQuery.ajax({
                type: "post",
                dataType: "json",
                url: `${store_domain_url}/abandoned_checkout`,
                data: {
                    store_id: store_id,
                    checkout_id: checkout_id,
                    email,
                    first_name,
                    last_name,
                },
                success: function (response) {
                    jQuery("body").removeClass("loader-animation");
                    if (response.status) {
                        return true;
                    } else {
                        jQuery.notify({ message: response?.message }, { type: "danger" });
                    }
                },
                error: function (error) {
                    jQuery("body").removeClass("loader-animation");
                    jQuery.notify({ message: error?.message }, { type: "danger" });
                }
            })
        }
    });

    /*** Change total amount if checked shipping rates ***/
    jQuery(document).on("change", 'input[name="shipping_rate"]', function (event) {
        let jquery_this = jQuery(this);

        shipping_rate_id = jquery_this.attr("data-id");
        shipping_rate_amount = parseFloat(jquery_this.val());
        shipping_rate_name = jquery_this.attr("shipping_rate_name");

        load_checkout_price_section();
    });

    jQuery(document).on("click", "input[name='billing_checkbox']", function () {
        jQuery(".billing-form").toggle("slow");
    });

    // fetch billing country and state
    jQuery('select[name="billing_country"]').change(function () {
        try {
            jQuery.ajax({
                type: "POST",
                dataType: "json",
                url: `${store_domain_url}/select-state`,
                data: {
                    country_code: jQuery(this).find(":selected").attr("country_code"),
                },
                success: function (response) {
                    if (response.status) {
                        if (response.states?.length > 0) {
                            let option_html = `<option value="">Select State</option>`;

                            jQuery.each(response.states, function (index, value) {
                                option_html += `
                                    <option value="${value?.state_name}" code=${value?.state_code}>
                                       ${value.state_name}
                                    </option>
                                `;
                            });

                            jQuery("#billing_state").html(option_html);
                            jQuery(".billing_state_section").show();

                            if (initGeoLoc) {
                                jQuery(`select[name="billing_state"] [code="${initGeoLoc?.region}"]`).prop("selected", true);
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

    // Apple Pay button click
    jQuery("#apple_pay_button").click(function () {
        jQuery(".credit_card_section").hide("slow");
        jQuery(".payment_method_apple_pay_input").prop("checked", true);
        jQuery(".pay-on-button").click();
    });


    //////////////////////////////////// Check discount code exist in store e-commerce platform
    let ecommerce_discount_code = window.sessionStorage.getItem("ecommerce_discount_code");
    if (ecommerce_discount_code) {
        jQuery('.discount_code_input').val(ecommerce_discount_code);
        jQuery('.mobile_discount_code_input').val(ecommerce_discount_code);
        ecommerce_discount = window.sessionStorage.getItem("ecommerce_discount");

        jQuery(".ecommerce_discount_apply").hide();
        jQuery(".ecommerce_discount_remove").show();
    } else {
        jQuery(".ecommerce_discount_apply").show();
        jQuery(".ecommerce_discount_remove").hide();
    }

    if (web_discount) {
        jQuery(".discount_code_input").val(web_discount);
        jQuery(".mobile_discount_code_input").val(web_discount);
        jQuery(".mobile_discount_outside_code_input").val(web_discount);
        ecommerce_discount_apply(web_discount, "web");
    }

    jQuery(document).on("click", '.ecommerce_discount_apply', function (event) {
        let discount_code = jQuery('.discount_code_input').val();
        if (!discount_code) {
            discount_code = jQuery('.mobile_discount_code_input').val();
        }
        if (!discount_code) {
            discount_code = jQuery('.mobile_discount_outside_code_input').val();
        }

        if (jQuery.trim(discount_code) === '') {
            jQuery.notify({ message: "Please add valid Discount" }, { type: "danger" });
            return false;
        }
        ecommerce_discount_apply(discount_code, "apply");
    });

    jQuery(document).on("click", '.ecommerce_discount_remove', function (event) {
        jQuery('.discount_code_input').val("");
        jQuery('.mobile_discount_code_input').val("");

        jQuery(".ecommerce_discount_apply").show();
        jQuery(".ecommerce_discount_remove").hide();

        sessionStorage.removeItem("ecommerce_discount");
        sessionStorage.removeItem("ecommerce_discount_code");

        ecommerce_discount = {};

        load_checkout_price_section();
    });


    // Stripe Credit Card Validation
    jQuery(".credit_card_stripe input").on("keyup", function () {
        var stripe_card_check = stripe_card_validation();
        console.log("credit_card_stripe stripe_card_check-------", stripe_card_check);
    });

    jQuery("input[name='stripe_card_number']").on("input", function (e) {
        var value = jQuery(this).inputmask("unmaskedvalue");
        jQuery("input[name='stripe_card_number']").inputmask({
            mask: value.substr(0, 2) === "36" ? "9999 999999 9999" : value.substr(0, 2) === "37" ? "9999 999999 99999" : value.substr(0, 2) === "34" ? "9999 9999 9999 9999" : "9999 9999 9999 9999",
        });
    });

    // Checkout Credit Card Validation
    jQuery(".credit_card_checkout input").on("keyup", function () {
        checkout_card_validation();
    });

    jQuery("input[name='checkout_card_number']").on("input", function (e) {
        var value = jQuery(this).inputmask("unmaskedvalue");
        jQuery("input[name='checkout_card_number']").inputmask({
            mask: value.substr(0, 2) === "36" ? "9999 999999 9999" : value.substr(0, 2) === "37" ? "9999 999999 99999" : value.substr(0, 2) === "34" ? "9999 9999 9999 9999" : "9999 9999 9999 9999",
        });
    });

    // Payment Button enable and disable when chose payment method
    jQuery('input[name="payment_method"]').change(function () {
        if (jQuery(this).is(":checked")) {
            let payment_method = jQuery(this).val();

            jQuery(".credit_card_section").hide("slow");

            if (payment_method == "Stripe") {
                jQuery(".credit_card_stripe").show("slow");
            }
            if (payment_method == "Checkout.com") {
                jQuery(".credit_card_checkout").show("slow");
            }
        }
    });

    // Default first Payment Method checked
    jQuery("input:radio[name=payment_method]:first").click();

    async function digitalfieldValidation() {
        var email = jQuery("input[name='email']").val(),
            emailRegex = /^([_\-\.0-9a-zA-Z]+)@([_\-\.0-9a-zA-Z]+)\.([a-zA-Z]){2,7}$/,
            mobile_no = /^((\+[1-9]{1,4}[ \-]*)|(\([0-9]{2,3}\)[ \-]*)|([0-9]{2,4})[ \-]*)*?[0-9]{3,4}?[ \-]*[0-9]{3,4}?$/,
            buying_for = document.querySelector('input[name="who_buying"]:checked')?.value,
            gift_someone_email = jQuery("input[name='gift_someone_email']").val(),
            delivery_date = document.querySelector('input[name="delivery_date"]:checked')?.value;


        if (!email) {
            jQuery("input[name='email']").addClass("error");
            jQuery.notify({ message: "Email field is required" }, { type: "danger" });
        } else {
            if (!emailRegex.test(email)) {
                jQuery("input[name='email']").addClass("error");
                jQuery.notify({ message: "Enter valid email" }, { type: "danger" });
            } else {
                jQuery("input[name='email']").removeClass("error");
            }
        }

        if (customize_checkout.require_phone_number) phone = jQuery("input[name='phone']").val();
        else phone = true;

        let phone_status = true

        if (!phone) {
            phone_status = false
            jQuery(".phone-number-filed").addClass("error-section");
            jQuery.notify({ message: "Phone no. field is required" }, { type: "danger" });
        } else {
            if (phone != true) {
                if (!mobile_no.test(phone) || mobile_no.length > (5 + phone_code.length) || mobile_no.length < (15 + phone_code.length)) {
                    phone_status = false
                    jQuery(".phone-number-filed").addClass("error-section");
                    jQuery.notify({ message: "Enter valid mobile no" }, { type: "danger" });
                } else {
                    jQuery(".phone-number-filed").removeClass("error-section");
                }
            }
        }

        let buying_for_status = true

        if (buying_for === "someone_else") {
            if (!gift_someone_email) {
                jQuery("input[name='gift_someone_email']").addClass("error");
                jQuery.notify({ message: "Email field is required" }, { type: "danger" });
            } else {
                if (!emailRegex.test(gift_someone_email)) {
                    jQuery("input[name='gift_someone_email']").addClass("error");
                    jQuery.notify({ message: "Enter valid email" }, { type: "danger" });
                } else {
                    jQuery("input[name='gift_someone_email']").removeClass("error");
                }
            }

            if (emailRegex.test(gift_someone_email)) {
                return buying_for_status = true;
            } else {
                return buying_for_status = false;
            }
        }

        let delivery_date_status = true

        if (delivery_date === 'future_date') {
            let year = jQuery("select[name='date_year']").val();
            let month = jQuery("select[name='date_month']").val();
            let day = jQuery("select[name='date_day']").val();
            let send_time = jQuery("input[name='send_time']").val();
            let time_format = jQuery("select[name='time_format']").val();
            let time_zone = jQuery("select[name='time_zone']").val();

            if (!year) {
                jQuery("select[name='date_year']").addClass("error");
                jQuery.notify({ message: "Year field is required" }, { type: "danger" });
            } else {
                jQuery("select[name='date_year']").removeClass("error");
            }

            if (!month) {
                jQuery("select[name='date_month']").addClass("error");
                jQuery.notify({ message: "Month field is required" }, { type: "danger" });
            } else {
                jQuery("select[name='date_month']").removeClass("error");
            }

            if (!day) {
                jQuery("select[name='date_day']").addClass("error");
                jQuery.notify({ message: "Day field is required" }, { type: "danger" });
            } else {
                jQuery("select[name='date_day']").removeClass("error");
            }

            if (!send_time) {
                jQuery("select[name='send_time']").addClass("error");
                jQuery.notify({ message: "Time field is required" }, { type: "danger" });
            } else {
                jQuery("select[name='send_time']").removeClass("error");
            }

            if (!time_format) {
                jQuery("select[name='time_format']").addClass("error");
                jQuery.notify({ message: "Time format field is required" }, { type: "danger" });
            } else {
                jQuery("select[name='time_format']").removeClass("error");
            }

            if (!time_zone) {
                jQuery("select[name='time_zone']").addClass("error");
                jQuery.notify({ message: "Time zone field is required" }, { type: "danger" });
            } else {
                jQuery("select[name='time_zone']").removeClass("error");
            }


            if (year && month && day && send_time && time_format && time_zone) {
                return delivery_date_status = true;
            } else {
                window.scrollTo({ top: 0, behavior: "smooth" });
                return delivery_date_status = false;
            }
        }

        if (emailRegex.test(email) && phone != "" && phone_status && buying_for && buying_for_status && delivery_date && delivery_date_status) {
            return true;
        } else {
            window.scrollTo({ top: 0, behavior: "smooth" });
            return false;
        }

    }

    // Click Payment Button
    jQuery(".pay-on-button").bind("click", async function () {
        var product_type = jQuery('input[name="digital"]').val();

        if (product_type === 'digital') {

            var delivery_date = document.querySelector('input[name="delivery_date"]:checked')?.value;
            let check_with = '';
            let check_delivery_date = '';
            if (delivery_date === 'future_date') {
                let year = jQuery("select[name='date_year']").val();
                let month = jQuery("select[name='date_month']").val();
                let day = jQuery("select[name='date_day']").val();
                let dateforDelivery = `${year}-${month}-${day}`
                jQuery(".flatpickr_datepicker_mimdate").val(moment(dateforDelivery).format('YYYY-MM-DD'));
                // let send_date = jQuery("input[name='send_date']").val();
                let select_time = jQuery("select[name='select_time']").val();
                let time_format = jQuery("select[name='time_format']").val();
                let send_time = jQuery("select[name='select_time']").val();
                let time_zone = jQuery("select[name='time_zone']").val();
                send_delivery_date = `${dateforDelivery} Time:${select_time}${time_format} ${time_zone}`
                // jQuery(".flatpickr_timepicker").val(moment().format('HH:mm'))
                switch (time_format) {
                    case 'AM':
                        if (select_time === '12:00' || select_time === '12:30') {
                            const st = select_time.split(":");
                            select_time = parseFloat(st[0]) - 12
                            send_time = `${select_time}:${st[1]}`
                        } else {
                            send_time = select_time;
                        }
                        break;
                    case 'PM':
                        if (select_time === '12:00' || select_time === '12:30') {
                            send_time = select_time;
                        } else {
                            const st = select_time.split(":");
                            select_time = 12 + parseFloat(st[0])
                            send_time = `${select_time}:${st[1]}`
                        }
                        break;
                    default:
                        send_time = jQuery("input[name='send_time']").val();
                        break;
                }
                check_with = moment();
                let b = `${dateforDelivery} ${send_time}`;
                switch (time_zone) {
                    case 'EST':
                        check_with = moment.utc().subtract(5, 'hours').format()
                        check_delivery_date = moment.utc(b).subtract(5, 'hours').format()
                        break;
                    case 'UTC':
                        check_with = moment.utc().format()
                        check_delivery_date = moment.utc(b).format()
                        break;
                    case 'WET':
                        check_with = moment.utc().format()
                        check_delivery_date = moment.utc(b).format()
                        break;
                    case 'GMT':
                        check_with = moment.utc().format()
                        check_delivery_date = moment.utc(b).format()
                        break;
                    case 'CET':
                        check_with = moment.utc().add(1, 'hours').format()
                        check_delivery_date = moment.utc(b).add(1, 'hours').format()
                        break;
                    case 'IST':
                        check_with = moment().utcOffset("+05:30").format()
                        check_delivery_date = moment(b).utcOffset("+05:30").format()
                        break;
                    case 'EDT':
                        check_with = moment.utc().subtract(4, 'hours').format()
                        check_delivery_date = moment.utc(b).subtract(4, 'hours').format()
                        break;
                    default:
                        check_delivery_date = moment.utc(b).format()
                        break;
                }
                check_delivery_date = moment.utc(b).format()
            } else {
                send_delivery_date = `${moment().format('YYYY-MM-DD')} Time:${moment().format('HH:mm')} UTC`
            }

            if (check_with) {
                let from = moment(check_with);
                let to = moment(check_delivery_date);
                let date_diff = from.diff(to, "minute");
                if (date_diff > 0) {
                    jQuery.notify({ message: "Selected delivery date is not correct" }, { type: "danger" });
                    return
                }
            }

            let digitalValidate = await digitalfieldValidation();
            let billing_details = await BillingDetailValidation();
            if (digitalValidate && billing_details) {
                let select_option = document.querySelector('input[name="payment_method"]:checked')?.value;
                if (select_option) {
                    paymentGateway(select_option);
                } else {
                    jQuery.notify({ message: "Select Payment Method" }, { type: "danger" });
                }
                return
            }
            return
        }

        let shipping_status = true;
        if (jQuery('input[name="shipping_rate"]').val() !== undefined) {
            if (jQuery('input[name="shipping_rate"]').is(":checked")) {
                shipping_status = true;
                jQuery("input[name='shipping_rate']").closest(".main-inner-free").removeClass("requiredBorder");
            } else {
                shipping_status = false;
                jQuery("input[name='shipping_rate']").closest(".main-inner-free").addClass("requiredBorder");
            }
        }

        let shipping_details = await shippingDetailValidation();

        let billing_details = true;
        if (!jQuery('input[name="billing_checkbox"]').is(":checked")) {
            billing_details = await BillingDetailValidation();
        }

        if (shipping_details && shipping_status && billing_details) {
            let select_option = document.querySelector('input[name="payment_method"]:checked')?.value;
            if (select_option) {
                paymentGateway(select_option);
            } else {
                jQuery.notify({ message: "Select Payment Method" }, { type: "danger" });
            }
        }
    });

    jQuery(document).on("click", '.checkout_footer_link', function (event) {
        let href_link = jQuery(this).attr("href_link");

        jQuery(".checkout_footer_link_model_body").html(`<iframe src="${href_link}" width="100%" height="500"></iframe>`);
        jQuery("#checkout_footer_link_model").modal("show");
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

    //////////////////////////////////// Socket Initialize for Payout Master payment webhook
    socket.on("payoutmaster_webhook_payment", (response) => {
        if (store_id === response?.store_id && checkout_id === response?.checkout_id) {
            jQuery("#payment_gateway_security").html('');
            if (response?.success) {
                // window.location.href = `${store_domain_url}/${store_id}/checkout-thankyou/${response?.data?.order_uuid}`;
                window.location.replace(`${store_domain_url}/${checkout_detail.shop_id}/checkout-thankyou/${response?.data?.order_uuid}`)
            }
        }
    });

    //////////////////////////////////// Socket Initialize for checkout.com payment webhook
    socket.on("checkout_webhook_payment", (response) => {
        if (store_id === response?.store_id && checkout_id === response?.checkout_id) {
            jQuery("#payment_gateway_security").html('');
            if (response?.success) {
                if (upsell_detail) {
                    // window.location.href = `${store_domain_url}/${checkout_detail.shop_id}/c/${checkout_detail.checkout_uuid}/o/${response?.data?.order_uuid}/upsells/${upsell_detail?.upsell_uuid}`;
                    window.location.replace(`${store_domain_url}/${checkout_detail.shop_id}/c/${checkout_detail.checkout_uuid}/o/${response?.data?.order_uuid}/upsells/${upsell_detail?.upsell_uuid}`);
                } else {
                    // window.location.href = `${store_domain_url}/${checkout_detail.shop_id}/checkout-thankyou/${response?.data?.order_uuid}`;
                    window.location.replace(`${store_domain_url}/${checkout_detail.shop_id}/checkout-thankyou/${response?.data?.order_uuid}`)
                }
            }
        }
    });
});

function shopify_money_format(cents, money_format) {
    let default_money_format = "${{amount}}";
    // if (typeof cents == 'string') { cents = cents.replace('.', ''); }
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

function ecommerce_discount_apply(discount_code, discount_type) {
    jQuery("body").addClass("loader-animation");
    jQuery.ajax({
        type: "post",
        dataType: "json",
        url: `${store_domain_url}/check-discount-code`,
        data: {
            store_id: store_id,
            checkout_id: checkout_id,
            discount_code: discount_code,
        },
        success: function (response) {
            jQuery("body").removeClass("loader-animation");
            if (response.status) {
                ecommerce_discount = JSON.stringify(response?.ecommerce_discount);

                if (discount_type === "apply") {
                    window.sessionStorage.setItem("ecommerce_discount", ecommerce_discount);
                    window.sessionStorage.setItem("ecommerce_discount_code", discount_code);
                }

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
}
/***********************************************************
 *** Load Checkout Price Section Function
 ***********************************************************/
function load_checkout_price_section() {
    jQuery("body").addClass("loader-animation");

    let selected_Country_Code = jQuery('select[name="shipping_country"]').find(":selected").attr("country_code");

    jQuery.ajax({
        type: "post",
        dataType: "json",
        url: `${store_domain_url}/check-automatic-discount`,
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

                jQuery(".mobile_total_price").html(`${shopify_money_format(response.totalPrice, customize_checkout?.money_format)}`)
                if (response.totalPrice > 0) {
                    jQuery(".payment_method_label").show();
                    jQuery(".payment_method_free_purchase").hide();
                    jQuery("input:radio[name=payment_method]:first").click();
                } else {
                    jQuery(".payment_method_label").hide();
                    jQuery(".payment_method_free_purchase").show();
                    jQuery("input:radio[name=payment_method][value=free_payment]").click();
                }

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

/*** Shipping Details Validate Function ***/
async function shippingDetailValidation() {
    var email = jQuery("input[name='email']").val(),
        first_name = jQuery("input[name='first_name']").val(),
        city = jQuery("input[name='city']").val(),
        zip = jQuery("input[name='zip_code']").val(),
        country = jQuery("select[name='shipping_country']").val(),
        state = jQuery("select[name='shipping_state']").val(),
        emailRegex = /^([_\-\.0-9a-zA-Z]+)@([_\-\.0-9a-zA-Z]+)\.([a-zA-Z]){2,7}$/,
        zipCode = country === 'India' ? /^\d{6}(?:-?\d{4})?$/ : /^\d{5}(?:-?\d{4})?$/,
        mobile_no = /^((\+[1-9]{1,4}[ \-]*)|(\([0-9]{2,3}\)[ \-]*)|([0-9]{2,4})[ \-]*)*?[0-9]{3,4}?[ \-]*[0-9]{3,4}?$/;

    if (customize_checkout.require_address_number) address = jQuery("input[name='address']").val();
    else address = true;

    if (customize_checkout.require_phone_number) phone = jQuery("input[name='phone']").val();
    else phone = true;

    if (!first_name) {
        jQuery("input[name='first_name']").addClass("error");
        jQuery.notify({ message: translation && translation.first_name_required || "First name field is required" }, { type: "danger" });
    } else {
        jQuery("input[name='first_name']").removeClass("error");
    }

    if (first_name && Number(first_name)) {
        jQuery("input[name='first_name']").addClass("error");
        jQuery.notify({ message: translation && translation.valid_firstname || "First name cant not be integer" }, { type: "danger" });
    }

    if (!email) {
        jQuery("input[name='email']").addClass("error");
        jQuery.notify({ message: translation && translation.email_required || "Email field is required" }, { type: "danger" });
    } else {
        if (!emailRegex.test(email)) {
            jQuery("input[name='email']").addClass("error");
            jQuery.notify({ message: translation && translation.valid_email || "Enter valid email" }, { type: "danger" });
        } else {
            jQuery("input[name='email']").removeClass("error");
        }
    }

    if (!address) {
        jQuery("input[name='address']").addClass("error");
        jQuery.notify({ message: translation && translation.address_required || "Address field is required" }, { type: "danger" });
    } else {
        jQuery("input[name='address']").removeClass("error");
    }

    let phone_status = true

    if (!phone) {
        phone_status = false
        jQuery(".phone-number-filed").addClass("error-section");
        jQuery.notify({ message: translation && translation.phone_required || "Phone no. field is required" }, { type: "danger" });
    } else {
        if (phone != true) {
            if (phone_code === '+91') {
                if (!mobile_no.test(phone) || phone.length !== (10 + phone_code.length)) {
                    phone_status = false
                    jQuery(".phone-number-filed").addClass("error-section");
                    jQuery.notify({ message: translation && translation.valid_phone || "Enter valid mobile no" }, { type: "danger" });
                } else {
                    jQuery(".phone-number-filed").removeClass("error-section");
                }
            } else {
                if (!mobile_no.test(phone) || mobile_no.length > (5 + phone_code.length) || mobile_no.length < (15 + phone_code.length)) {
                    phone_status = false
                    jQuery(".phone-number-filed").addClass("error-section");
                    jQuery.notify({ message: translation && translation.valid_phone || "Enter valid mobile no" }, { type: "danger" });
                } else {
                    jQuery(".phone-number-filed").removeClass("error-section");
                }
            }

        }
    }

    if (!city) {
        jQuery("input[name='city']").addClass("error");
        jQuery.notify({ message: translation && translation.city_required || "City field is required" }, { type: "danger" });
    } else {
        jQuery("input[name='city']").removeClass("error");
    }

    if (!zip) {
        jQuery("input[name='zip_code']").addClass("error");
        jQuery.notify({ message: translation && translation.zip_required || "Zip code field is required" }, { type: "danger" });
    } else {
        if (!zipCode.test(zip)) {
            jQuery("input[name='zip_code']").addClass("error");
            jQuery.notify({ message: translation && translation.valid_zip || "Enter valid Zip code" }, { type: "danger" });
        } else {
            jQuery("input[name='zip_code']").removeClass("error");
        }
    }


    if (!country) {
        jQuery("select[name='shipping_country']").addClass("error");
        jQuery.notify({ message: translation && translation.country_required || "Country field is required" }, { type: "danger" });
    } else {
        jQuery("select[name='shipping_country']").removeClass("error");
    }

    if (!state) {
        jQuery("select[name='shipping_state']").addClass("error");
        jQuery.notify({ message: translation && translation.state_required || "State field is required" }, { type: "danger" });
    } else {
        jQuery("select[name='shipping_state']").removeClass("error");
    }

    if (emailRegex.test(email) && first_name && address && city && zipCode.test(zip) && phone != "" && phone_status && country && state) {
        return true;
    } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
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
        zipCode = country === 'India' ? /^\d{6}(?:-?\d{4})?$/ : /^\d{5}(?:-?\d{4})?$/;

    if (!first_name) {
        jQuery("input[name='billing_first_name']").addClass("error");
        jQuery.notify({ message: translation && translation.first_name_required || "First name field is required" }, { type: "danger" });
    } else {
        jQuery("input[name='billing_first_name']").removeClass("error");
    }

    if (!address) {
        jQuery("input[name='billing_address']").addClass("error");
        jQuery.notify({ message: translation && translation.address_required || "Address field is required" }, { type: "danger" });
    } else {
        jQuery("input[name='billing_address']").removeClass("error");
    }

    if (!city) {
        jQuery("input[name='billing_city']").addClass("error");
        jQuery.notify({ message: translation && translation.city_required || "City field is required" }, { type: "danger" });
    } else {
        jQuery("input[name='billing_city']").removeClass("error");
    }

    if (!zip) {
        jQuery("input[name='billing_zip_code']").addClass("error");
        jQuery.notify({ message: translation && translation.zip_required || "Zip code field is required" }, { type: "danger" });
    } else {
        if (!zipCode.test(zip)) {
            jQuery("input[name='billing_zip_code']").addClass("error");
            jQuery.notify({ message: translation && translation.valid_zip || "Enter valid Zip code" }, { type: "danger" });
        } else {
            jQuery("input[name='billing_zip_code']").removeClass("error");
        }
    }

    if (!country) {
        jQuery("select[name='billing_country']").addClass("error");
        jQuery.notify({ message: translation && translation.country_required || "Country field is required" }, { type: "danger" });
    } else {
        jQuery("select[name='billing_country']").removeClass("error");
    }

    if (!state) {
        jQuery("select[name='billing_state']").addClass("error");
        jQuery.notify({ message: translation && translation.state_required || "State field is required" }, { type: "danger" });
    } else {
        jQuery("select[name='billing_state']").removeClass("error");
    }

    if (first_name && address && city && zipCode.test(zip) && country && state) {
        return true;
    } else {
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
        case "free_payment":
            FreePayment();
            break;
        default:
            break;
    }
}

async function StripePayment() {
    var stripe_card_check = stripe_card_validation();
    console.log("StripePayment stripe_card_check-------", stripe_card_check);
    var product_type = jQuery('input[name="digital"]').val();

    let buying_for = '';
    let gift_someone_email = '';
    let delivery_date = '';
    let messeage_txt = ''

    if (stripe_card_check?.is_valid) {
        let card_number = stripe_card_check?.card_number;
        let expiry_year = stripe_card_check?.expiry_year;
        let expiry_month = stripe_card_check?.expiry_month;
        let cvv = stripe_card_check?.cvv;

        let customer_detail = CustomerDetail(checkout_detail);

        let billing_detail;
        let billing_status = false;
        if (!jQuery('input[name="billing_checkbox"]').is(":checked")) {
            billing_status = true;
            billing_detail = BillingDetail();
        }

        if (product_type === 'digital') {
            buying_for = document.querySelector('input[name="who_buying"]:checked')?.value;
            gift_someone_email = jQuery("input[name='gift_someone_email']").val();
            delivery_date = document.querySelector('input[name="delivery_date"]:checked')?.value;
            messeage_txt = jQuery("textarea[name='messeage_txt']").val();
            billing_status = true;
            billing_detail = BillingDetail();
        }

        jQuery("body").addClass("loader-animation");
        jQuery.ajax({
            type: "POST",
            dataType: "json",
            url: `${store_domain_url}/pay`,
            data: {
                method: "stripe",

                store_id: store_id,
                checkout_id: checkout_id,

                currency: store_detail?.store_currency,

                card_number: card_number,
                expiry_month: expiry_month,
                expiry_year: expiry_year,
                cvv: cvv,

                subtotal: jQuery('input[name="subtotal"]').val(),
                price: jQuery('input[name="total_price"]').val(),

                product_type,
                buying_for,
                gift_someone_email,
                delivery_type: delivery_date,
                send_delivery_date,
                messeage_txt,

                email: customer_detail?.email,
                first_name: customer_detail?.first_name,
                last_name: customer_detail?.last_name,
                address: customer_detail?.address,
                phone: customer_detail?.phone,
                city: customer_detail?.city,
                zipcode: customer_detail?.zipCode,
                country: customer_detail?.country,
                state: customer_detail?.state,

                billing_status: billing_status,
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
                        // window.location.href = `${store_domain_url}/${checkout_detail.shop_id}/c/${checkout_detail.checkout_uuid}/o/${response?.data?.order_uuid}/upsells/${upsell_detail?.upsell_uuid}`;
                        window.location.replace(`${store_domain_url}/${checkout_detail.shop_id}/c/${checkout_detail.checkout_uuid}/o/${response?.data?.order_uuid}/upsells/${upsell_detail?.upsell_uuid}`);
                    } else {
                        // window.location.href = `${store_domain_url}/${checkout_detail.shop_id}/checkout-thankyou/${response?.data?.order_uuid}`;
                        window.location.replace(`${store_domain_url}/${checkout_detail.shop_id}/checkout-thankyou/${response?.data?.order_uuid}`);
                    }
                    return true;
                } else {
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
        jQuery.notify({ message: translation && translation.valid_card || "Enter valid card details" }, { type: "danger" });
    }
}

async function PayPalPayment() {
    let customer_detail = CustomerDetail(checkout_detail);
    var product_type = jQuery('input[name="digital"]').val();

    let buying_for = '';
    let gift_someone_email = '';
    let delivery_date = '';
    let messeage_txt = ''

    if (product_type === 'digital') {
        buying_for = document.querySelector('input[name="who_buying"]:checked')?.value;
        gift_someone_email = jQuery("input[name='gift_someone_email']").val();
        delivery_date = document.querySelector('input[name="delivery_date"]:checked')?.value;
        messeage_txt = jQuery("textarea[name='messeage_txt']").val();
    }

    let billing_detail;
    let billing = false;
    if (!jQuery('input[name="billing_checkbox"]').is(":checked")) {
        billing = true;
        billing_detail = BillingDetail();
    }

    jQuery("body").addClass("loader-animation");
    jQuery(".pay-on-button").addClass("loading button-loading").attr("disabled", true);

    jQuery.ajax({
        type: "POST",
        dataType: "json",
        url: `${store_domain_url}/pay`,
        data: {
            method: "paypal",

            store_id: store_id,
            checkout_id: checkout_id,

            currency: store_detail?.store_currency,

            subtotal: jQuery('input[name="subtotal"]').val(),
            price: jQuery('input[name="total_price"]').val(),

            product_type,
            buying_for,
            gift_someone_email,
            delivery_type: delivery_date,
            send_delivery_date,
            messeage_txt,

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
            console.log("PayPalPayment response----------", response);

            jQuery("body").removeClass("loader-animation");
            jQuery(".pay-on-button").removeClass("loading button-loading").attr("disabled", false);
            // sessionStorage.removeItem("ecommerce_discount");
            // sessionStorage.removeItem("ecommerce_discount_code");

            // if (response.status) {
            //     jQuery("#payment_gateway_security").html(`
            //         <iframe src="${response?.redirect_url}" width="100%" height="500"></iframe>
            //     `);
            //     jQuery("html, body").animate({ scrollTop: jQuery(".payment_method_section").offset().top }, "slow");
            //     return false;
            // } else {
            //     jQuery(".pay-on-button").removeClass("loading button-loading").attr("disabled", false);
            //     jQuery.notify({ message: response?.message }, { type: "danger" });
            // }
        },
        error: function (error) {
            jQuery("body").removeClass("loader-animation");
            jQuery(".pay-on-button").removeClass("loading button-loading").attr("disabled", false);
            console.error("PayPalPayment error----------", error);
        },
    });
}

async function PayoutMasterPayment() {
    let customer_detail = CustomerDetail(checkout_detail);
    var product_type = jQuery('input[name="digital"]').val();

    let buying_for = '';
    let gift_someone_email = '';
    let delivery_date = '';
    let messeage_txt = ''

    if (product_type === 'digital') {
        buying_for = document.querySelector('input[name="who_buying"]:checked')?.value;
        gift_someone_email = jQuery("input[name='gift_someone_email']").val();
        delivery_date = document.querySelector('input[name="delivery_date"]:checked')?.value;
        messeage_txt = jQuery("textarea[name='messeage_txt']").val();
    }

    let billing_detail;
    let billing = false;
    if (!jQuery('input[name="billing_checkbox"]').is(":checked")) {
        billing = true;
        billing_detail = BillingDetail();
    }

    jQuery("body").addClass("loader-animation");
    jQuery(".pay-on-button").addClass("loading button-loading").attr("disabled", true);

    jQuery.ajax({
        type: "POST",
        dataType: "json",
        url: `${store_domain_url}/pay`,
        data: {
            method: "payout_master",

            store_id: store_id,
            checkout_id: checkout_id,

            currency: store_detail?.store_currency,

            subtotal: jQuery('input[name="subtotal"]').val(),
            price: jQuery('input[name="total_price"]').val(),

            product_type,
            buying_for,
            gift_someone_email,
            delivery_type: delivery_date,
            send_delivery_date,
            messeage_txt,

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
                jQuery("#payment_gateway_security").html(`
                    <iframe src="${response?.redirect_url}" width="100%" height="500"></iframe>
                `);
                jQuery("html, body").animate({ scrollTop: jQuery(".payment_method_section").offset().top }, "slow");
                return false;
            } else {
                jQuery(".pay-on-button").removeClass("loading button-loading").attr("disabled", false);
                jQuery.notify({ message: response?.message }, { type: "danger" });
            }
        },
        error: function (error) {
            jQuery("body").removeClass("loader-animation");
            jQuery(".pay-on-button").removeClass("loading button-loading").attr("disabled", false);
            console.error("PayoutMasterPayment error----------", error);
        },
    });
}

async function CheckoutPayment() {
    let checkout_card_check = checkout_card_validation();
    if (checkout_card_check?.is_valid) {

        let card_number = checkout_card_check?.card_number;
        let expiry_year = checkout_card_check?.expiry_year;
        let expiry_month = checkout_card_check?.expiry_month;
        let cvv = checkout_card_check?.cvv;

        let customer_detail = CustomerDetail(checkout_detail);

        var product_type = jQuery('input[name="digital"]').val();

        let buying_for = '';
        let gift_someone_email = '';
        let delivery_date = '';
        let messeage_txt = ''

        if (product_type === 'digital') {
            buying_for = document.querySelector('input[name="who_buying"]:checked')?.value;
            gift_someone_email = jQuery("input[name='gift_someone_email']").val();
            delivery_date = document.querySelector('input[name="delivery_date"]:checked')?.value;
            messeage_txt = jQuery("textarea[name='messeage_txt']").val();
        }


        let billing_detail;
        let billing = false;
        if (!jQuery('input[name="billing_checkbox"]').is(":checked")) {
            billing = true;
            billing_detail = BillingDetail();
        }

        jQuery("body").addClass("loader-animation");
        jQuery(".pay-on-button").addClass("loading button-loading").attr("disabled", true);
        jQuery.ajax({
            type: "POST",
            dataType: "json",
            url: `${store_domain_url}/pay`,
            data: {
                method: "Checkout.com",

                store_id: store_id,
                checkout_id: checkout_id,

                currency: store_detail?.store_currency,

                card_number: card_number,
                expiry_month: expiry_month,
                expiry_year: expiry_year,
                cvv: cvv,

                subtotal: jQuery('input[name="subtotal"]').val(),
                price: jQuery('input[name="total_price"]').val(),

                product_type,
                buying_for,
                gift_someone_email,
                delivery_type: delivery_date,
                send_delivery_date,
                messeage_txt,

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

                if (response.status) {
                    sessionStorage.removeItem("ecommerce_discount");
                    sessionStorage.removeItem("ecommerce_discount_code");

                    if (response?.payment_status === "Pending") {
                        jQuery("#payment_gateway_security").html(`
                            <iframe src="${response?.redirect_url}" width="100%" height="500"></iframe>
                        `)
                        jQuery("html, body").animate({ scrollTop: jQuery(".payment_method_section").offset().top }, "slow");
                        return false;
                    } else {
                        jQuery.notify({ message: response?.message }, { type: "success" });

                        if (upsell_detail) {
                            window.location.replace(`${store_domain_url}/${checkout_detail.shop_id}/c/${checkout_detail.checkout_uuid}/o/${response?.data?.order_uuid}/upsells/${upsell_detail?.upsell_uuid}`);
                            // window.location.href = `${store_domain_url}/${checkout_detail.shop_id}/c/${checkout_detail.checkout_uuid}/o/${response?.data?.order_uuid}/upsells/${upsell_detail?.upsell_uuid}`;
                        } else {
                            // window.location.href = `${store_domain_url}/${checkout_detail.shop_id}/checkout-thankyou/${response?.data?.order_uuid}`;
                            window.location.replace(`${store_domain_url}/${checkout_detail.shop_id}/checkout-thankyou/${response?.data?.order_uuid}`)
                        }

                        return true;
                    }
                } else {
                    jQuery(".pay-on-button").removeClass("loading button-loading").attr("disabled", false);
                    jQuery.notify({ message: response?.message }, { type: "danger" });
                }
            },
            error: function (error) {
                console.log("CheckoutPayment pay error-------------", error);
                jQuery("body").removeClass("loader-animation");
                jQuery(".pay-on-button").removeClass("loading button-loading").attr("disabled", false);
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
    let customer_detail = CustomerDetail(checkout_detail);

    var product_type = jQuery('input[name="digital"]').val();

    let buying_for = '';
    let gift_someone_email = '';
    let delivery_date = '';
    let messeage_txt = ''

    if (product_type === 'digital') {
        buying_for = document.querySelector('input[name="who_buying"]:checked')?.value;
        gift_someone_email = jQuery("input[name='gift_someone_email']").val();
        delivery_date = document.querySelector('input[name="delivery_date"]:checked')?.value;
        messeage_txt = jQuery("textarea[name='messeage_txt']").val();
    }

    let billing_detail;
    let billing = false;
    if (!jQuery('input[name="billing_checkbox"]').is(":checked")) {
        billing = true;
        billing_detail = BillingDetail();
    }

    jQuery("body").addClass("loader-animation");
    jQuery(".pay-on-button").addClass("loading button-loading").attr("disabled", true);

    jQuery.ajax({
        type: "POST",
        dataType: "json",
        url: `${store_domain_url}/pay`,
        data: {
            method: "Revolut",

            store_id: store_id,
            checkout_id: checkout_id,

            currency: store_detail?.store_currency,

            subtotal: jQuery('input[name="subtotal"]').val(),
            price: jQuery('input[name="total_price"]').val(),

            product_type,
            buying_for,
            gift_someone_email,
            delivery_type: delivery_date,
            send_delivery_date,
            messeage_txt,

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
                sessionStorage.removeItem("ecommerce_discount");
                sessionStorage.removeItem("ecommerce_discount_code");

                let payment_type = (PAYMENT_MODE === "live") ? "prod" : "sandbox";

                RevolutCheckout(response.public_id, payment_type).then(function (RC) {
                    jQuery("body").removeClass("loader-animation");
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
                            jQuery("body").removeClass("loader-animation");
                            jQuery(".pay-on-button").removeClass("loading button-loading").attr("disabled", false);
                            jQuery.notify({ message: "Payment failed!" }, { type: "danger" });
                        },
                        // (optional) Callback in case user cancelled a transaction
                        onCancel() {
                            jQuery("body").removeClass("loader-animation");
                            jQuery(".pay-on-button").removeClass("loading button-loading").attr("disabled", false);
                            jQuery.notify({ message: "Payment cancelled!" }, { type: "danger" });
                        },
                    });
                });
            } else {
                jQuery("body").removeClass("loader-animation");
                jQuery(".pay-on-button").removeClass("loading button-loading").attr("disabled", false);
                jQuery.notify({ message: response?.message }, { type: "danger" });
            }
        },
        error: function (error) {
            console.log("RevolutPayment pay error-------------", error);
            jQuery("body").removeClass("loader-animation");
            jQuery(".pay-on-button").removeClass("loading button-loading").attr("disabled", false);
            jQuery.notify({ message: error?.message }, { type: "danger" });
        },
    });
}

async function RevolutPaymentSuccess(revolut_order) {
    jQuery("body").addClass("loader-animation");
    jQuery.ajax({
        type: "POST",
        dataType: "json",
        url: `${store_domain_url}/pay`,
        data: {
            action: "revolut_success",
            payment_id: revolut_order?.public_id,
        },
        success: function (response) {
            if (response?.status) {
                jQuery.notify({ message: response?.message }, { type: "success" });

                if (upsell_detail) {
                    // window.location.href = `${store_domain_url}/${checkout_detail.shop_id}/c/${checkout_detail.checkout_uuid}/o/${response?.data?.order_uuid}/upsells/${upsell_detail?.upsell_uuid}`;
                    window.location.replace(`${store_domain_url}/${checkout_detail.shop_id}/c/${checkout_detail.checkout_uuid}/o/${response?.data?.order_uuid}/upsells/${upsell_detail?.upsell_uuid}`);
                } else {
                    // window.location.href = `${store_domain_url}/${checkout_detail.shop_id}/checkout-thankyou/${response?.data?.order_uuid}`;
                    window.location.replace(`${store_domain_url}/${checkout_detail.shop_id}/checkout-thankyou/${response?.data?.order_uuid}`)
                }
                return true;
            } else {
                jQuery("body").removeClass("loader-animation");
                jQuery.notify({ message: response?.message }, { type: "danger" });
            }
        },
        error: function (error) {
            console.error("RevolutPaymentSuccess error-------------", error);
            jQuery("body").removeClass("loader-animation");
            jQuery.notify({ message: response.error?.message }, { type: "danger" });
        },
    });
}

async function ApplePayPayment() {

    jQuery(".pay-on-button").addClass("loading button-loading").attr("disabled", true);
    const applepay_request = {
        countryCode: 'US',
        currencyCode: store_detail?.store_currency,
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
                url: `${store_domain_url}/applepay-validateSession`,
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
            jQuery(".pay-on-button").removeClass("loading button-loading").attr("disabled", false);
            console.log("starting session.oncancel-----------", JSON.stringify(event));
        };
    }
    catch (error) {
        console.error("ApplePayPayment error ------------", error);
    }
};

async function ApplePayPaymentSuccess(applePaymentToken) {
    let customer_detail = CustomerDetail(checkout_detail);

    var product_type = jQuery('input[name="digital"]').val();

    let buying_for = '';
    let gift_someone_email = '';
    let delivery_date = '';
    let messeage_txt = ''

    if (product_type === 'digital') {
        buying_for = document.querySelector('input[name="who_buying"]:checked')?.value;
        gift_someone_email = jQuery("input[name='gift_someone_email']").val();
        delivery_date = document.querySelector('input[name="delivery_date"]:checked')?.value;
        messeage_txt = jQuery("textarea[name='messeage_txt']").val();
    }

    let billing_detail;
    let billing = false;
    if (!jQuery('input[name="billing_checkbox"]').is(":checked")) {
        billing = true;
        billing_detail = BillingDetail();
    }

    jQuery("body").addClass("loader-animation");
    jQuery(".pay-on-button").addClass("loading button-loading").attr("disabled", true);

    jQuery.ajax({
        type: "POST",
        dataType: "json",
        url: `${store_domain_url}/pay`,
        data: {
            method: "apple_pay",
            store_id: store_id,
            checkout_id: checkout_id,
            applePaymentToken: JSON.stringify(applePaymentToken),

            currency: store_detail?.store_currency,

            subtotal: jQuery('input[name="subtotal"]').val(),
            price: jQuery('input[name="total_price"]').val(),

            product_type,
            buying_for,
            gift_someone_email,
            delivery_type: delivery_date,
            send_delivery_date,
            messeage_txt,

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

                // window.location.href = `${store_domain_url}/${store_id}/checkout-thankyou/${response?.data?.order_uuid}`;
                window.location.replace(`${store_domain_url}/${store_id}/checkout-thankyou/${response?.data?.order_uuid}`);

                return true;
            } else {
                jQuery("body").removeClass("loader-animation");
                jQuery(".pay-on-button").removeClass("loading button-loading").attr("disabled", false);
                jQuery.notify({ message: response?.message }, { type: "danger" });
            }
        },
        error: function (error) {
            console.error("ApplePayPaymentSuccess pay error-------------", error);

            jQuery("body").removeClass("loader-animation");
            jQuery(".pay-on-button").removeClass("loading button-loading").attr("disabled", false);
            jQuery.notify({ message: error?.message }, { type: "danger" });
        },
    });
}

async function FreePayment() {

    let customer_detail = CustomerDetail(checkout_detail);
    var product_type = jQuery('input[name="digital"]').val();

    let buying_for = '';
    let gift_someone_email = '';
    let delivery_date = '';
    let messeage_txt = ''

    if (product_type === 'digital') {
        buying_for = document.querySelector('input[name="who_buying"]:checked')?.value;
        gift_someone_email = jQuery("input[name='gift_someone_email']").val();
        delivery_date = document.querySelector('input[name="delivery_date"]:checked')?.value;
        messeage_txt = jQuery("textarea[name='messeage_txt']").val();
    }


    let billing_detail;
    let billing = false;
    if (!jQuery('input[name="billing_checkbox"]').is(":checked")) {
        billing = true;
        billing_detail = BillingDetail();
    }

    jQuery("body").addClass("loader-animation");
    jQuery(".pay-on-button").addClass("loading button-loading").attr("disabled", true);

    jQuery.ajax({
        type: "POST",
        dataType: "json",
        url: `${store_domain_url}/pay`,
        data: {
            method: "free",

            store_id: store_id,
            checkout_id: checkout_id,

            currency: store_detail?.store_currency,

            subtotal: jQuery('input[name="subtotal"]').val(),
            price: jQuery('input[name="total_price"]').val(),

            product_type,
            buying_for,
            gift_someone_email,
            delivery_type: delivery_date,
            send_delivery_date,
            messeage_txt,

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
            jQuery("body").removeClass("loader-animation");
            if (response.status) {
                sessionStorage.removeItem("ecommerce_discount");
                sessionStorage.removeItem("ecommerce_discount_code");

                jQuery.notify({ message: response?.message }, { type: "success" });
                // window.location.href = `${store_domain_url}/${checkout_detail.shop_id}/checkout-thankyou/${response?.data?.order_uuid}`;
                window.location.replace(`${store_domain_url}/${checkout_detail.shop_id}/checkout-thankyou/${response?.data?.order_uuid}`);
                return true;
            } else {
                jQuery(".pay-on-button").removeClass("loading button-loading").attr("disabled", false);
                jQuery.notify({ message: response?.message }, { type: "danger" });
            }
        },
        error: function (error) {
            console.error("FreePayment pay error-------------", error);

            jQuery("body").removeClass("loader-animation");
            jQuery(".pay-on-button").removeClass("loading button-loading").attr("disabled", false);
            jQuery.notify({ message: error?.message }, { type: "danger" });
        },
    });
}

/*****************************************
 *** Stripe Card Validate Function ***
*****************************************/
function stripe_card_validation() {
    let card_validation = true;

    let card_types = {};
    if (card_accepted.includes("accepts_visa")) {
        card_types = {
            ...card_types,
            visa: {
                name: "Visa",
                code: "vs",
                security: 3,
                pattern: /^(?:4[0-9]{12}(?:[0-9]{3})?)$/,
                valid_length: [16],
                formats: {
                    length: 16,
                    format: "xxxx xxxx xxxx xxxx",
                },
            }
        }
    }

    if (card_accepted.includes("accepts_mastercard")) {
        card_types = {
            ...card_types,
            mastercard: {
                name: "Mastercard",
                code: "mc",
                security: 3,
                pattern: /^5[1-5]/,
                valid_length: [16],
                formats: {
                    length: 16,
                    format: "xxxx xxxx xxxx xxxx",
                },
            },
        }
    }

    if (card_accepted.includes("accepts_maestro")) {
        card_types = {
            ...card_types,
            maestro: {
                name: "Maestro",
                code: "ma",
                security: 3,
                pattern: /^(50(18|20|38)|5612|5893|63(04|90)|67(59|6[1-3])|0604)/,
                valid_length: [16],
                formats: {
                    length: 16,
                    format: "xxxx xxxx xxxx xxxx",
                },
            },
        }
    }

    if (card_accepted.includes("accepts_amex")) {
        card_types = {
            ...card_types,
            american_express: {
                name: "American Express",
                code: "ax",
                security: 4,
                pattern: /^3[47]/,
                valid_length: [15],
                formats: {
                    length: 15,
                    format: "xxxx xxxxxxx xxxx",
                },
            },
        }
    }

    if (card_accepted.includes("accepts_jcb")) {
        card_types = {
            ...card_types,
            jcb: {
                name: "JCB",
                code: "ax",
                security: 4,
                pattern: /^(?:(?:2131|1800|35\d{3})\d{11})$/,
                valid_length: [16],
                formats: {
                    length: 16,
                    format: "xxxx xxxxxxx xxxx",
                },
            },
        }
    }

    if (card_accepted.includes("accepts_discover")) {
        card_types = {
            ...card_types,
            discover: {
                name: "discover",
                code: "ax",
                security: 4,
                pattern: /^(?:6(?:011|5[0-9][0-9])[0-9]{12})$/,
                valid_length: [16],
                formats: {
                    length: 16,
                    format: "xxxx xxxxxxx xxxx",
                },
            },
        }
    }

    if (card_accepted.includes("accepts_diners_club")) {
        card_types = {
            ...card_types,
            diners_club: {
                name: "Diners Club",
                code: "ax",
                security: 4,
                pattern: /^(?:3(?:0[0-5]|[68][0-9])[0-9]{11})$/,
                valid_length: [14, 16],
                formats: {
                    length: 16,
                    format: "xxxx xxxxxxx xxxx",
                },
            },
        }
    }

    app = {
        monthAndSlashRegex: /^\d\d \/ $/, // regex to match "MM / "
        monthRegex: /^\d\d$/, // regex to match "MM"
        CVVRegex: /^[0-9]{3,3}$/,

        el_cardNumber: "input[name='stripe_card_number']",
        el_expDate: "input[name='stripe_card_expiry_code']",
        el_cvv: "input[name='stripe_card_cvv']",

        el_ccUnknown: "cc_type_unknown",

        cardTypes: card_types,
    };

    app.addSlash = function (e) {
        var isMonthEntered = app.monthRegex.exec(e.target.value);
        if (e.key >= 0 && e.key <= 9 && isMonthEntered) {
            e.target.value = e.target.value + "/";
        }
    };

    app.removeSlash = function (e) {
        var isMonthAndSlashEntered = app.monthAndSlashRegex.exec(e.target.value);
        if (isMonthAndSlashEntered && e.key === "Backspace") {
            e.target.value = e.target.value.slice(0, -3);
        }
    };

    let card_number = jQuery(app.el_cardNumber).inputmask("unmaskedvalue");

    // Check Card expired or not
    jQuery(app.el_expDate).on("keyup", async function (e) {
        await app.addSlash(e);
    });

    jQuery(app.el_expDate).on("keydown", async function (e) {
        await app.removeSlash(e);
    });

    jQuery(app.el_cvv + ", " + app.el_expDate).on("keypress", function (e) {
        return e.charCode >= 48 && e.charCode <= 57;
    });


    // Check Credit card number Validation
    app.isValidLength = function (cc_num, card_type) {
        for (var i in card_type.valid_length) {
            if (cc_num.length <= card_type.valid_length[i]) {
                return true;
            }
        }
        return false;
    };

    app.getCardType = function (cc_num) {
        for (var i in app.cardTypes) {
            var card_type = app.cardTypes[i];
            if (cc_num.match(card_type.pattern) && app.isValidLength(cc_num, card_type)) {
                return card_type;
            }
        }
    };

    app.monitorCcFormat = function ($elem) {
        var cc_num = $elem.val().replace(/\D/g, "");
        var card_type = app.getCardType(cc_num);

        if (card_type) {
            card_validation = false;
            jQuery(app.el_cardNumber).removeClass("error");
        } else {
            card_validation = true;
            jQuery(app.el_cardNumber).addClass("error");
        }
    }

    jQuery(app.el_cardNumber).on("change paste keyup", async function (e) {
        var $elem = $(this);
        app.monitorCcFormat($elem);
    });

    // Check Card Expire date
    if (card_validation == true) {
        var month, year;
        let check_expiry_date = false;
        let expiry_date = jQuery(app.el_expDate).val();
        if (expiry_date.length == 5) {
            month = parseInt(expiry_date.slice(0, -3));
            year = parseInt(`20${expiry_date.slice(3)}`);

            if (month <= 12) {
                var monthSelectOptions = [01, 02, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12];
                check_expiry_date = monthSelectOptions.includes(month)
            } else {
                check_expiry_date = false
            }

            if (check_expiry_date === true) {
                var yearSelectOptions = [2023, 2024, 2025, 2026, 2027, 2028, 2029];
                check_expiry_date = yearSelectOptions.includes(year)
            }

            var expiry = new Date(year, month, 0);
            var today = new Date();
            if (expiry < today) {
                check_expiry_date = false
            }

            if (check_expiry_date) {
                jQuery(app.el_expDate).removeClass("error");
            } else {
                jQuery(app.el_expDate).addClass("error");
            }
        }
        card_validation = check_expiry_date;
    }

    // Check Card CVV
    let card_cvv = jQuery(app.el_cvv).val();
    if (card_validation == true) {
        let check_cvv = false;
        if (card_number.substr(0, 2) === "37") {
            jQuery(app.el_cvv).attr("maxlength", "4");
            app.CVVRegex = /^[0-9]{4,4}$/;
        } else {
            jQuery(app.el_cvv).attr("maxlength", "3");
            app.CVVRegex = /^[0-9]{3,3}$/;
        }

        if (app.CVVRegex.test(card_cvv)) {
            check_cvv = true;
            jQuery(app.el_cvv).removeClass("error");
        } else {
            check_cvv = false;
            jQuery(app.el_cvv).addClass("error");
        }

        card_validation = check_cvv;
    }

    return {
        is_valid: card_validation,
        card_number: card_number,
        expiry_month: month,
        expiry_year: year,
        cvv: card_cvv,
    };
}

/*****************************************
 *** Checkout Card Validate Function ***
*****************************************/
function checkout_card_validation() {
    let card_validation = true;

    let card_types = {};
    if (card_accepted.includes("accepts_visa")) {
        card_types = {
            ...card_types,
            visa: {
                name: "Visa",
                code: "vs",
                security: 3,
                pattern: /^(?:4[0-9]{12}(?:[0-9]{3})?)$/,
                valid_length: [16],
                formats: {
                    length: 16,
                    format: "xxxx xxxx xxxx xxxx",
                },
            }
        }
    }

    if (card_accepted.includes("accepts_mastercard")) {
        card_types = {
            ...card_types,
            mastercard: {
                name: "Mastercard",
                code: "mc",
                security: 3,
                pattern: /^5[1-5]/,
                valid_length: [16],
                formats: {
                    length: 16,
                    format: "xxxx xxxx xxxx xxxx",
                },
            },
        }
    }

    if (card_accepted.includes("accepts_maestro")) {
        card_types = {
            ...card_types,
            maestro: {
                name: "Maestro",
                code: "ma",
                security: 3,
                pattern: /^(50(18|20|38)|5612|5893|63(04|90)|67(59|6[1-3])|0604)/,
                valid_length: [16],
                formats: {
                    length: 16,
                    format: "xxxx xxxx xxxx xxxx",
                },
            },
        }
    }

    if (card_accepted.includes("accepts_amex")) {
        card_types = {
            ...card_types,
            american_express: {
                name: "American Express",
                code: "ax",
                security: 4,
                pattern: /^3[47]/,
                valid_length: [15],
                formats: {
                    length: 15,
                    format: "xxxx xxxxxxx xxxx",
                },
            },
        }
    }

    if (card_accepted.includes("accepts_jcb")) {
        card_types = {
            ...card_types,
            jcb: {
                name: "JCB",
                code: "ax",
                security: 4,
                pattern: /^(?:(?:2131|1800|35\d{3})\d{11})$/,
                valid_length: [16],
                formats: {
                    length: 16,
                    format: "xxxx xxxxxxx xxxx",
                },
            },
        }
    }

    if (card_accepted.includes("accepts_discover")) {
        card_types = {
            ...card_types,
            discover: {
                name: "discover",
                code: "ax",
                security: 4,
                pattern: /^(?:6(?:011|5[0-9][0-9])[0-9]{12})$/,
                valid_length: [16],
                formats: {
                    length: 16,
                    format: "xxxx xxxxxxx xxxx",
                },
            },
        }
    }

    if (card_accepted.includes("accepts_diners_club")) {
        card_types = {
            ...card_types,
            diners_club: {
                name: "Diners Club",
                code: "ax",
                security: 4,
                pattern: /^(?:3(?:0[0-5]|[68][0-9])[0-9]{11})$/,
                valid_length: [14, 16],
                formats: {
                    length: 16,
                    format: "xxxx xxxxxxx xxxx",
                },
            },
        }
    }

    app = {
        monthAndSlashRegex: /^\d\d \/ $/, // regex to match "MM / "
        monthRegex: /^\d\d$/, // regex to match "MM"
        CVVRegex: /^[0-9]{3,3}$/,

        el_cardNumber: "input[name='checkout_card_number']",
        el_expDate: "input[name='checkout_card_expiry_code']",
        el_cvv: "input[name='checkout_card_cvv']",

        el_ccUnknown: "cc_type_unknown",

        cardTypes: card_types,
    };

    app.addSlash = function (e) {
        var isMonthEntered = app.monthRegex.exec(e.target.value);
        if (e.key >= 0 && e.key <= 9 && isMonthEntered) {
            e.target.value = e.target.value + "/";
        }
    };

    app.removeSlash = function (e) {
        var isMonthAndSlashEntered = app.monthAndSlashRegex.exec(e.target.value);
        if (isMonthAndSlashEntered && e.key === "Backspace") {
            e.target.value = e.target.value.slice(0, -3);
        }
    };

    let card_number = jQuery(app.el_cardNumber).inputmask("unmaskedvalue");

    // Check Card expired or not
    jQuery(app.el_expDate).on("keyup", async function (e) {
        await app.addSlash(e);
    });

    jQuery(app.el_expDate).on("keydown", async function (e) {
        await app.removeSlash(e);
    });

    jQuery(app.el_cvv + ", " + app.el_expDate).on("keypress", function (e) {
        return e.charCode >= 48 && e.charCode <= 57;
    });


    // Check Credit card number Validation
    app.isValidLength = function (cc_num, card_type) {
        for (var i in card_type.valid_length) {
            if (cc_num.length <= card_type.valid_length[i]) {
                return true;
            }
        }
        return false;
    };

    app.getCardType = function (cc_num) {
        for (var i in app.cardTypes) {
            var card_type = app.cardTypes[i];
            if (cc_num.match(card_type.pattern) && app.isValidLength(cc_num, card_type)) {
                return card_type;
            }
        }
    };

    app.monitorCcFormat = function ($elem) {
        var cc_num = $elem.val().replace(/\D/g, "");
        var card_type = app.getCardType(cc_num);

        if (card_type) {
            card_validation = false;
            jQuery(app.el_cardNumber).removeClass("error");
        } else {
            card_validation = true;
            jQuery(app.el_cardNumber).addClass("error");
        }
    }

    jQuery(app.el_cardNumber).on("change paste keyup", async function (e) {
        var $elem = $(this);
        app.monitorCcFormat($elem);
    });

    // Check Card Expire date
    if (card_validation == true) {
        var month, year;
        let check_expiry_date = false;
        let expiry_date = jQuery(app.el_expDate).val();
        if (expiry_date.length == 5) {
            month = parseInt(expiry_date.slice(0, -3));
            year = parseInt(`20${expiry_date.slice(3)}`);

            if (month <= 12) {
                var monthSelectOptions = [01, 02, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12];
                check_expiry_date = monthSelectOptions.includes(month)
            } else {
                check_expiry_date = false
            }

            if (check_expiry_date === true) {
                var yearSelectOptions = [2023, 2024, 2025, 2026, 2027, 2028, 2029];
                check_expiry_date = yearSelectOptions.includes(year)
            }

            var expiry = new Date(year, month, 0);
            var today = new Date();
            if (expiry < today) {
                check_expiry_date = false
            }

            if (check_expiry_date) {
                jQuery(app.el_expDate).removeClass("error");
            } else {
                jQuery(app.el_expDate).addClass("error");
            }
        }
        card_validation = check_expiry_date;
    }

    // Check Card CVV
    let card_cvv = jQuery(app.el_cvv).val();
    if (card_validation == true) {
        let check_cvv = false;
        if (card_number.substr(0, 2) === "37") {
            jQuery(app.el_cvv).attr("maxlength", "4");
            app.CVVRegex = /^[0-9]{4,4}$/;
        } else {
            jQuery(app.el_cvv).attr("maxlength", "3");
            app.CVVRegex = /^[0-9]{3,3}$/;
        }

        if (app.CVVRegex.test(card_cvv)) {
            check_cvv = true;
            jQuery(app.el_cvv).removeClass("error");
        } else {
            check_cvv = false;
            jQuery(app.el_cvv).addClass("error");
        }

        card_validation = check_cvv;
    }

    return {
        is_valid: card_validation,
        card_number: card_number,
        expiry_month: month,
        expiry_year: year,
        cvv: card_cvv,
    };
}

/*****************************************
 *** Get Customer Details
*****************************************/
function CustomerDetail() {
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

/*****************************************
 *** Get Billing Details
*****************************************/
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


function time_selector() {
    //    jQuery(".flatpickr_datepicker_mimdate").flatpickr({
    //     allowInput: false,
    //     altFormat: "F j, Y",
    //     dateFormat: "Y-m-d",
    //     defaultDate: "today",
    //     minDate: moment().format('YYYY-MM-DD'),
    //     });
    jQuery(".flatpickr_timepicker").val(moment().format('HH:mm'))

}


