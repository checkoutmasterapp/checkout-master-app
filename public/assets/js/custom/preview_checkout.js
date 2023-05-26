jQuery(document).ready(function () {

    jQuery(".resposive-dhdh").click(function () {
        jQuery(".smry-data-show").toggle("slow");
        jQuery(".resposive-dhdh").toggleClass("active");
    });

    // Display a scarcity timer on the Checkout
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

    // Shipping method
    jQuery(document).on("change", 'select[name="shipping_country"]', function (event) {
        let selected_country_code = jQuery(this).find(":selected").attr("country_code");
        console.log("selected_country_code-------", selected_country_code);

        let shipping_detail_html = "";
        if (shipping_options?.length > 0) {
            shipping_options.forEach((shipping_option) => {

                var shipping_rate_price = shipping_option.shipping_rate_price;
                shipping_detail_html += `
                    <label class="main-inr-payment ss-kjmar">
                        <div class="main-inner-payment">
                            <img src="/assets/img/XMLID_678_.png" />
                            <p class="shipp-12-e">${shipping_option ? shipping_option.shipping_rate_name : "n/a"}</p>
                            <span>${shipping_option ? `${money_format}` + parseFloat(shipping_rate_price).toFixed(2) : "n/a"}</span>
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

                            jQuery("#billing_state").html(option_html);
                            jQuery(".billing_state_section").show();

                            if (initGeoLoc) {
                                jQuery(`select[name="shipping_state"] [code="${initGeoLoc?.region}"]`).prop("selected", true);
                                jQuery(`select[name="billing_state"] [code="${initGeoLoc?.region}"]`).prop("selected", true);
                            }
                        } else {
                            jQuery(".shipping_state_section").hide();
                            jQuery(".billing_state_section").hide();
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
    });

    jQuery(document).on("click", "input[name='billing_checkbox']", function () {
        jQuery(".billing-form").toggle("slow");
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

    jQuery(document).on("click", '.checkout_footer_link', function (event) {
        let href_link = jQuery(this).attr("href_link");

        jQuery(".checkout_footer_link_model_body").html(`<iframe src="${href_link}" width="100%" height="500"></iframe>`);
        jQuery("#checkout_footer_link_model").modal("show");
    });

});