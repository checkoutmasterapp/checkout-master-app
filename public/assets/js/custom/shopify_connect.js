jQuery(document).ready(function () {
    load_store_stepper();

    // Add your store
    jQuery(document).on("click change paste keyup", "form#store_name input[name='store_name']", function () {
        let jquery_this = jQuery(this);

        let store_name = jquery_this.val();
        store_name = store_name.replace(/ /g, "");
        store_name = $.trim(store_name);

        jquery_this.val(store_name);
    });

    jQuery("#store_name").validate({
        errorPlacement: function (error, element) {
            if (element.attr("type") == "checkbox" || element.attr("type") == "radio") {
                element.parent().parent().parent().append(error);
            } else {
                element.parent().parent().append(error);
            }
        },
        submitHandler: function (form) {
            jQuery("form#store_name :submit").attr("disabled", true);
            jQuery.ajax({
                type: "POST",
                cache: false,
                dataType: "json",
                contentType: false,
                processData: false,
                data: new FormData(form),
                url: `${ajax_url}/store-connect`,
                mimeType: "multipart/form-data",
                error: function (xhr, ajaxOptions, thrownError) {
                    jQuery("form#store_name :submit").attr("disabled", false);
                    jQuery.notify({ message: "Something went wrong with ajax. Please try again" }, { type: "danger" });
                },
                success: function (response) {
                    jQuery("form#store_name :submit").attr("disabled", false);
                    if (response?.status && response.page.includes("store_scopes")) {
                        let sessionStorageData = {
                            shopDomain: response?.store_name,
                            shopApiKey: "",
                            shopSecretKey: "",
                            password: "",
                        };
                        window.sessionStorage.setItem("STORE_DATA", JSON.stringify(sessionStorageData));
                        window.sessionStorage.setItem("connect_store_steps", 1);

                        load_store_stepper();
                    } else {
                        jQuery.notify({ message: response.message }, { type: "danger" });
                    }
                },
            });
        },
    });

    // Create a custom app
    jQuery("#store_scopes").validate({
        submitHandler: function (form) {
            window.sessionStorage.setItem("connect_store_steps", 2);
            load_store_stepper();
        },
    });

    jQuery(document).on("click", ".clipboard_app_name", function () {
        let jquery_this = jQuery(this);
        let copy_content = jquery_this.parent().parent().find("input").val();

        var temp = jQuery("<input>");
        jQuery("body").append(temp);
        temp.val(copy_content).select();

        document.execCommand("copy");
        temp.remove();

        jQuery.notify({ message: "Copied" }, { type: "success" });
    });

    // Add app details
    jQuery("#store_details").validate({
        submitHandler: function (form) {
            jQuery("form#store_details :submit").attr("disabled", true);
            jQuery.ajax({
                type: "POST",
                cache: false,
                dataType: "json",
                contentType: false,
                processData: false,
                data: new FormData(form),
                url: `${ajax_url}/store-connect`,
                mimeType: "multipart/form-data",
                success: function (response) {
                    jQuery("form#store_details :submit").attr("disabled", false);
                    jQuery(".store_setup_stepper_bar .bar_a:nth-child(3)").removeClass("error");

                    if (response?.status) {
                        if (response.page.includes("congrats_page")) {
                            jQuery.notify({ message: response.message }, { type: "success" });
                            sessionStorage.removeItem("connect_store_steps");
                            sessionStorage.removeItem("STORE_DATA");

                            window.location.href = response?.redirect_url;
                        }

                        if (response.page.includes("incorrect_scopes")) {
                            jQuery.notify({ message: response?.message }, { type: "danger" });
                            jQuery(".store_setup_stepper_bar .bar_a:nth-child(3)").addClass("error");

                            window.sessionStorage.setItem(
                                "STORE_DATA",
                                JSON.stringify({
                                    shopDomain: response?.store_name,
                                    shopApiKey: response?.api_key,
                                    shopSecretKey: response?.secret_key,
                                    password: response?.password,
                                })
                            );

                            jQuery("#store_domain_verify").val(response?.store_name);
                            jQuery("#shopify_api_key_verify").val(response?.api_key);
                            jQuery("#shopify_secret_key_verify").val(response?.secret_key);
                            jQuery("#access_token_verify").val(response?.password);

                            jQuery(".store_details").hide();
                            jQuery(".store_verify_details").show();
                            if (response?.incorrectScopes.includes("read_products") || response?.incorrectScopes.includes("write_products")) {
                                jQuery('.products').show()
                            } else {
                                jQuery('.products').hide()
                            }
                            if (response?.incorrectScopes.includes("read_customers") || response?.incorrectScopes.includes("write_customers")) {
                                jQuery('.customers').show()
                            } else {
                                jQuery('.customers').hide()
                            }
                            if (response?.incorrectScopes.includes("read_discounts") || response?.incorrectScopes.includes("write_discounts")) {
                                jQuery('.discounts').show()
                            } else {
                                jQuery('.discounts').hide()
                            }
                            if (response?.incorrectScopes.includes("read_fulfillments")) {
                                jQuery('.fulfillments').show()
                            } else {
                                jQuery('.fulfillments').hide()
                            }
                            if (response?.incorrectScopes.includes("read_gdpr_data_request")) {
                                jQuery('.gdpr').show()
                            } else {
                                jQuery('.gdpr').hide()
                            }
                            if (response?.incorrectScopes.includes("read_gift_cards")) {
                                jQuery('.gift_cards').show()
                            } else {
                                jQuery('.gift_cards').hide()
                            }
                            if (response?.incorrectScopes.includes("read_inventory") || response?.incorrectScopes.includes("write_inventory")) {
                                jQuery('.inventory').show()
                            } else {
                                jQuery('.inventory').hide()
                            }
                            if (response?.incorrectScopes.includes("read_order_edits") || response?.incorrectScopes.includes("write_order_edits")) {
                                jQuery('.order_edits').show()
                            } else {
                                jQuery('.order_edits').hide()
                            }
                            if (response?.incorrectScopes.includes("read_orders") || response?.incorrectScopes.includes("write_orders")) {
                                jQuery('.orders').show()
                            } else {
                                jQuery('.orders').hide()
                            }
                            if (response?.incorrectScopes.includes("read_price_rules") || response?.incorrectScopes.includes("write_price_rules")) {
                                jQuery('.price_rules').show()
                            } else {
                                jQuery('.price_rules').hide()
                            }
                            if (response?.incorrectScopes.includes("read_product_listings") || response?.incorrectScopes.includes("write_product_listings")) {
                                jQuery('.product_listings').show()
                            } else {
                                jQuery('.product_listings').hide()
                            }
                            if (response?.incorrectScopes.includes("read_script_tags") || response?.incorrectScopes.includes("write_script_tags")) {
                                jQuery('.script_tags').show()
                            } else {
                                jQuery('.script_tags').hide()
                            }
                            if (response?.incorrectScopes.includes("read_shipping") || response?.incorrectScopes.includes("write_shipping")) {
                                jQuery('.shipping').show()
                            } else {
                                jQuery('.shipping').hide()
                            }
                            if (response?.incorrectScopes.includes("read_themes") || response?.incorrectScopes.includes("write_themes")) {
                                jQuery('.themes').show()
                            } else {
                                jQuery('.themes').hide()
                            }

                        }
                    } else {
                        jQuery.notify({ message: response.message }, { type: "danger" });
                    }
                },
            });
        },
    });

    // Add app details
    jQuery("#store_verify_details").validate({
        submitHandler: function (form) {
            jQuery("form#store_verify_details :submit").attr("disabled", true);
            jQuery.ajax({
                type: "POST",
                cache: false,
                dataType: "json",
                contentType: false,
                processData: false,
                data: new FormData(form),
                url: `${ajax_url}/store-connect`,
                mimeType: "multipart/form-data",
                success: function (response) {
                    jQuery("form#store_verify_details :submit").attr("disabled", false);
                    jQuery(".store_setup_stepper_bar .bar_a:nth-child(3)").removeClass("error");

                    if (response?.status) {
                        // jQuery(".incorrect_scopes").html("");

                        if (response.page.includes("congrats_page")) {
                            jQuery.notify({ message: response.message }, { type: "success" });
                            sessionStorage.removeItem("connect_store_steps");
                            sessionStorage.removeItem("STORE_DATA");

                            window.location.href = response?.redirect_url;
                        }

                        if (response.page.includes("incorrect_scopes")) {
                            jQuery.notify({ message: response?.message }, { type: "danger" });
                            jQuery(".store_setup_stepper_bar .bar_a:nth-child(3)").addClass("error");

                            jQuery(".store_details").hide();
                            jQuery(".store_verify_details").show();
                            if (response?.incorrectScopes.includes("read_products") || response?.incorrectScopes.includes("write_products")) {
                                jQuery('.products').show()
                            } else {
                                jQuery('.products').hide()
                            }
                            if (response?.incorrectScopes.includes("read_customers") || response?.incorrectScopes.includes("write_customers")) {
                                jQuery('.customers').show()
                            } else {
                                jQuery('.customers').hide()
                            }
                            if (response?.incorrectScopes.includes("read_discounts") || response?.incorrectScopes.includes("write_discounts")) {
                                jQuery('.discounts').show()
                            } else {
                                jQuery('.discounts').hide()
                            }
                            if (response?.incorrectScopes.includes("read_fulfillments")) {
                                jQuery('.fulfillments').show()
                            } else {
                                jQuery('.fulfillments').hide()
                            }
                            if (response?.incorrectScopes.includes("read_gdpr_data_request")) {
                                jQuery('.gdpr').show()
                            } else {
                                jQuery('.gdpr').hide()
                            }
                            if (response?.incorrectScopes.includes("read_gift_cards")) {
                                jQuery('.gift_cards').show()
                            } else {
                                jQuery('.gift_cards').hide()
                            }
                            if (response?.incorrectScopes.includes("read_inventory") || response?.incorrectScopes.includes("write_inventory")) {
                                jQuery('.inventory').show()
                            } else {
                                jQuery('.inventory').hide()
                            }
                            if (response?.incorrectScopes.includes("read_order_edits") || response?.incorrectScopes.includes("write_order_edits")) {
                                jQuery('.order_edits').show()
                            } else {
                                jQuery('.order_edits').hide()
                            }
                            if (response?.incorrectScopes.includes("read_orders") || response?.incorrectScopes.includes("write_orders")) {
                                jQuery('.orders').show()
                            } else {
                                jQuery('.orders').hide()
                            }
                            if (response?.incorrectScopes.includes("read_price_rules") || response?.incorrectScopes.includes("write_price_rules")) {
                                jQuery('.price_rules').show()
                            } else {
                                jQuery('.price_rules').hide()
                            }
                            if (response?.incorrectScopes.includes("read_product_listings") || response?.incorrectScopes.includes("write_product_listings")) {
                                jQuery('.product_listings').show()
                            } else {
                                jQuery('.product_listings').hide()
                            }
                            if (response?.incorrectScopes.includes("read_script_tags") || response?.incorrectScopes.includes("write_script_tags")) {
                                jQuery('.script_tags').show()
                            } else {
                                jQuery('.script_tags').hide()
                            }
                            if (response?.incorrectScopes.includes("read_shipping") || response?.incorrectScopes.includes("write_shipping")) {
                                jQuery('.shipping').show()
                            } else {
                                jQuery('.shipping').hide()
                            }
                            if (response?.incorrectScopes.includes("read_themes") || response?.incorrectScopes.includes("write_themes")) {
                                jQuery('.themes').show()
                            } else {
                                jQuery('.themes').hide()
                            }
                        }
                    } else {
                        jQuery.notify({ message: response.message }, { type: "danger" });
                    }
                },
            });
        },
    });
});

function load_store_stepper() {
    let getStoreData = window.sessionStorage.getItem("STORE_DATA");
    let domain = JSON.parse(getStoreData);
    if (domain?.shopDomain) {
        jQuery(".store_domain").val(domain?.shopDomain);
        
    }

    // localStorage.clear();
    // sessionStorage.clear();
    let connect_store_steps = window.sessionStorage.getItem("connect_store_steps");
    jQuery(".store_setup_stepper").hide();
    jQuery(".store_setup_stepper_bar .bar_a").removeClass("active");
    console.log("connect_store_steps",connect_store_steps)

    switch (connect_store_steps) {
        case "1":
            jQuery(".store_scopes").show();
            jQuery(".ww").hide();
            jQuery(".store-heading").html('Set App details');
            jQuery(".store_setup_stepper_bar .bar_a:nth-child(1)").addClass("default_active");
            jQuery(".store_setup_stepper_bar .bar_a:nth-child(2)").addClass("active");
            break;

        case "2":
            jQuery(".store_details").show();
            jQuery(".store-heading").html('You’re almost there!');
            jQuery("input[name='access_token']").val(domain?.password);
            jQuery("input[name='shopify_api_key']").val(domain?.shopApiKey);
            jQuery("input[name='shopify_secret_key']").val(domain?.shopSecretKey);
            jQuery(".store_setup_stepper_bar .bar_a:nth-child(1)").addClass("default_active");
            jQuery(".store_setup_stepper_bar .bar_a:nth-child(2)").addClass("default_active");
            jQuery(".store_setup_stepper_bar .bar_a:nth-child(3)").addClass("active");
            break;

        case "3":
            jQuery(".store_verify_details").show();
            break;

        default:
            jQuery(".add_your_store").show();
            jQuery(".store_setup_stepper_bar .bar_a:nth-child(1)").addClass("active");
            break;
    }
}