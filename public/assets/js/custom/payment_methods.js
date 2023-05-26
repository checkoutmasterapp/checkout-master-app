jQuery(document).ready(function () {

    load_payment_method();

    if (typeof payment_method !== "undefined" && typeof payment_method !== undefined) {
        load_payment_method_section(payment_method?.method_name);

        payment_method?.card_accepted?.map((card_accepted) => {
            jQuery(`#gateway_${card_accepted}`).prop("checked", true);
        });
    }

    jQuery(document).on("click", ".table-payment-method-row", function () {
        let id = jQuery(this).attr("id");
        let store_id = jQuery(this).attr("store_id");
        window.location.href = `${ajax_url}/${store_id}/payment-method/${id}`;
    });

    let card_payment_method_accept = true;
    let card_method_lists = ["Stripe", "Checkout.com", "Revolut", "Payout Master"];
    if (typeof select_method_lists !== undefined && typeof select_method_lists !== "undefined") {
        let card_method_exist = select_method_lists.filter((select_method_list) => card_method_lists.includes(select_method_list));
        card_payment_method_accept = card_method_exist.length ? true : false;
    }

    //////////////////////////////////// Applepay select payment method
    jQuery(document).on("change", "#select_payment_method", function () {
        let method_name = jQuery(this).val();

        jQuery(".payment_section").hide();
        jQuery(".payment_method_input").removeClass("required");

        if (card_payment_method_accept) {
            if (card_method_lists.includes(method_name)) {
                jQuery("#select_payment_method").prop("selectedIndex", 0);
                jQuery.notify({ message: "Only one credit card payment method can be added at a time. Please remove the current credit card payment method and try again." }, { type: "danger" });
                return false;
            }
        }

        load_payment_method_section(method_name);
    });

    //////////////////////////////////// Apple Pay Certificates, Identifier & Profiles
    const readUploadedFileAsText = (inputFile) => {
        const temporaryFileReader = new FileReader();
        return new Promise((resolve, reject) => {
            temporaryFileReader.onerror = () => {
                temporaryFileReader.abort();
                reject(new DOMException("Problem parsing input file."));
            };
            temporaryFileReader.onload = () => {
                resolve(temporaryFileReader.result);
            };
            temporaryFileReader.readAsText(inputFile);
        });
    };

    jQuery(document).on("change", "form#add_payment_method input[name='apple_certificate']", async () => {
        const apple_certificate_file = jQuery("form#add_payment_method input[name='apple_certificate']")[0];
        const apple_certificate = await readUploadedFileAsText(apple_certificate_file.files[0]);

        jQuery.ajax({
            type: "POST",
            cache: false,
            dataType: "json",
            data: {
                "action": "apple_certificate",
                "apple_certificate": apple_certificate
            },
            url: `${ajax_url}/payment-verify`,
            success: function (response) {
                jQuery(".applepay_certificate_detail").show();
                jQuery(".applepay_certificate_verfication_file").remove();
            },
        });
    });

    //////////////////////////////////// Applepay Submit payment method
    jQuery.validator.addMethod("checkemail", function (value, element) {
        return this.optional(element) || /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(value);
    }, "Please enter a valid email address.");

    jQuery("#add_payment_method").validate({
        rules: {
            payment_email: {
                email: true,
                checkemail: true,
            },
        },
        errorPlacement: function (error, element) {
            if (element.attr("type") == "checkbox") {
                element.parent().append(error);
            } else {
                element.parent().append(error);
            }
        },
        submitHandler: function (form) {
            // jQuery("form#add_payment_method :submit").attr("disabled", true);
            jQuery.ajax({
                type: "POST",
                cache: false,
                dataType: "json",
                contentType: false,
                processData: false,
                data: new FormData(form),
                url: `${ajax_url}/add-payment-method`,
                mimeType: "multipart/form-data",
                success: function (response) {
                    if (response?.status) {
                        jQuery.notify({ message: response.message }, { type: "success" });
                        setTimeout(function () {
                            window.location.href = response?.redirect_url;
                        }, 1500);
                    } else {
                        jQuery.notify({ message: response.message }, { type: "danger" });
                        jQuery("form#add_payment_method :submit").attr("disabled", false);
                    }
                },
            });
        },
    });

    jQuery("#edit_payment_method").validate({
        rules: {
            payment_email: {
                email: true,
                checkemail: true,
            },
        },
        errorPlacement: function (error, element) {
            if (element.attr("type") == "checkbox") {
                element.parent().append(error);
            } else {
                element.parent().append(error);
            }
        },
        submitHandler: function (form) {
            let id = jQuery("button[type=submit]").attr("id");
            jQuery("form#edit_payment_method :submit").attr("disabled", true);

            jQuery.ajax({
                type: "POST",
                cache: false,
                dataType: "json",
                contentType: false,
                processData: false,
                data: new FormData(form),
                url: `${ajax_url}/edit-payment-method/${id}`,
                mimeType: "multipart/form-data",
                success: function (response) {
                    if (response?.status) {
                        jQuery.notify({ message: response.message }, { type: "success" });
                        setTimeout(function () {
                            window.location.href = window.location.href;
                            // window.location.href = response?.redirect_url;
                        }, 1500);
                    } else {
                        jQuery.notify({ message: response.message }, { type: "danger" });
                        jQuery("form#edit_payment_method :submit").attr("disabled", false);
                    }
                },
            });
        },
    });

    jQuery(".delete_payment_method").click(function () {
        let payment_method_id = jQuery(this).attr("payment_method_id");

        let is_last = jQuery(this).attr("is_last");
        let is_published = jQuery(this).attr("is_published");
        let message = "Once deleted, you will not be able to recover this payment method again!";
        if (is_last === "true" && is_published === "true") {
            message = "Once deleted last payment method, your current store will unpublished automatically!";
        }

        bootbox.confirm({
            title: "Are you sure?",
            message: message,
            buttons: {
                confirm: {
                    label: "Delete",
                    className: "btn-success",
                },
                cancel: {
                    label: "Cancel",
                    className: "btn-danger",
                },
            },
            callback: function (result) {
                if (result) {
                    jQuery.ajax({
                        type: "POST",
                        cache: false,
                        dataType: "json",
                        contentType: "application/json",
                        processData: false,
                        url: `${ajax_url}/delete-payment-method`,
                        data: JSON.stringify({
                            store_id: store_id,
                            payment_method_id: payment_method_id,
                        }),
                        success: function (response) {
                            if (response?.status) {
                                jQuery.notify({ message: "Your payment method  has been deleted!" }, { type: "success" });
                                setTimeout(function () { window.location.href = response?.redirect_url; }, 1500);
                                
                                // if (is_last === "true" && is_published === "true") {
                                //     jQuery.ajax({
                                //         type: "GET",
                                //         cache: false,
                                //         url: `${ajax_url}/${store_id}/store_disconnect`,
                                //         success: function (response2) {
                                //             jQuery.notify({ message: "Your payment method has been deleted & current store unpublished!" }, { type: "success" });
                                //             setTimeout(function () {
                                //                 window.location.href = response?.redirect_url;
                                //             }, 1500);
                                //         },
                                //     });
                                // } else {
                                //     jQuery.notify({ message: "Your payment method  has been deleted!" }, { type: "success" });
                                //     setTimeout(function () {
                                //         window.location.href = response?.redirect_url;
                                //     }, 1500);
                                // }
                            } else {
                                jQuery.notify({ message: response.message }, { type: "danger" });
                            }
                        },
                    });
                }
            },
        });
    });
});

function load_payment_method_section(method_name) {
    jQuery(".payment_section").hide();
    jQuery(".payment_method_input").removeClass("required");

    if (method_name === "Stripe") {
        jQuery(".stripe_method").show();
        jQuery(".stripe_input").addClass("required");
    }

    if (method_name === "PayPal") {
        jQuery(".paypal_method").show();
        jQuery(".paypal_input").addClass("required");
    }

    if (method_name === "Checkout.com") {
        jQuery(".checkout_method").show();
        jQuery(".checkout_input").addClass("required");
    }

    if (method_name === "Klarna") {
        jQuery(".klarna_method").show();
    }

    if (method_name === "Revolut") {
        jQuery(".revolut_method").show();
        jQuery(".revolut_input").addClass("required");
    }

    if (method_name === "Payout Master") {
        jQuery(".payout_master_method").show();
        jQuery(".payout_master_input").addClass("required");
    }

    if (method_name === "Apple pay") {
        jQuery(".apple_pay_method").show();
        jQuery(".apple_pay_input").addClass("required");
    }
}

function load_payment_method() {
    jQuery("#payment_method_table").DataTable({
        responsive: true,
        cache: false,
        destroy: true,
        searching: false,
        processing: true,
        serverSide: true,
        ajax: {
            type: "POST",
            dataType: "json",
            url: `${ajax_url}/payment-methods`,
            data: function (d) {
                d.store_id = store_id;
            },
        },
        columns: [
            { orderable: false, data: "method_name" },
            { orderable: false, data: "processing_mode" },
            { orderable: false, data: "created_at" },
            { orderable: false, data: "action" },
        ],
        fnDrawCallback: function () {
            iTotalRecords = this.api().page.info().recordsTotal;
            if (!iTotalRecords) {
                jQuery(".payment_method_listing").hide();
                jQuery(".payment_method_banner").show();
            } else {
                jQuery(".payment_method_listing").show();
                jQuery(".payment_method_banner").hide();
            }
        }
    });
}