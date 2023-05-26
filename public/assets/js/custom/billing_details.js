jQuery(document).ready(function () {

    // Fetch Shipping country and state
    let initGeoLoc;
    jQuery.ajax({
        url: "https://pro.ip-api.com/json/?key=7FR6Sr0omUEmj2C",
        dataType: "jsonp",
        success: (response) => {
            if (response?.countryCode) {
                initGeoLoc = response;
                console.log("initGeoLoc---------", initGeoLoc);
                jQuery("select[name='billing_country_code']").val(response?.countryCode).change();
            }
        },
    });

    jQuery(document).on("click", ".un_subscribe", function () {
        bootbox.confirm({
            title: "Cancel Subscription",
            message: "Are you sure you want to unsubscribe?",
            buttons: {
                confirm: {
                    label: "Yes",
                    className: "btn-success",
                },
                cancel: {
                    label: "No",
                    className: "btn-danger",
                },
            },
            callback: function (result) {
                if (result) {
                    jQuery("body").addClass("loader-animation");
                    jQuery.ajax({
                        type: "post",
                        dataType: "json",
                        url: `${ajax_url}/billing/unsubscribe`,
                        data: {
                            store_id: store_id,
                            current_billing_subscription: current_billing_subscription
                        },
                        error: function (response) {
                            jQuery("body").removeClass("loader-animation");
                            jQuery.notify({ message: response.message }, { type: "danger" });
                        },
                        success: function (response) {
                            if (response?.status) {
                                jQuery.notify({ message: response.message }, { type: "success" });
                                window.location.reload()
                            } else {
                                jQuery("body").removeClass("loader-animation");
                                jQuery.notify({ message: response.message }, { type: "danger" });
                            }
                        },
                    });
                }
            }
        });
    });

    if (typeof current_billing_subscription !== "undefined") {
        let subscription_package_id = current_billing_subscription?.subscription_package_id
        if (subscription_package_id) {
            jQuery(`input:radio[name=subscription_package][value='${subscription_package_id}']`).click();
        } else {
            jQuery("input:radio[name=subscription_package]:first").click();
        }
    } else {
        jQuery("input:radio[name=subscription_package]:first").click();
    }

    //card validation on input fields
    if (jQuery("#donot_have_company").prop("checked") == true) {
        jQuery("#billing_form input[name=billing_company]").val("");
        jQuery("#billing_form input[name=billing_company]").removeClass("required");
        jQuery("#billing_form input[name=billing_company]").attr("readonly", true);
    } else {
        jQuery("#billing_form input[name=billing_company]").addClass("required");
        jQuery("#billing_form input[name=billing_company]").removeAttr("readonly", false);
    }

    jQuery("#donot_have_company").on("change", function () {
        if (jQuery("#donot_have_company").prop("checked") == true) {
            jQuery("#billing_form input[name=billing_company]").val("");
            jQuery("#billing_form input[name=billing_company]").removeClass("required");
            jQuery("#billing_form input[name=billing_company]").attr("readonly", true);
        } else {
            jQuery("#billing_form input[name=billing_company]").addClass("required");
            jQuery("#billing_form input[name=billing_company]").removeAttr("readonly", false);
        }
    });

    if (jQuery("input[name=selected_card]").is(":checked")) {
        if (jQuery(this).val() == "new_card") {
            jQuery(".accordion_card_default").show("slow");
        } else {
            jQuery(".accordion_card_default").hide("slow");
        }
    }

    jQuery("input[name=selected_card]").on("change", function () {
        if (jQuery(this).val() == "new_card") {
            jQuery(".accordion_card_default").show("slow");
        } else {
            jQuery(".accordion_card_default").hide("slow");
        }
    });

    jQuery("input[name='card_number']").on("input", function (e) {
        var value = jQuery(this).inputmask("unmaskedvalue");
        jQuery("input[name='card_number']").inputmask({
            mask: value.substr(0, 2) === "36" ? "9999 999999 9999" : value.substr(0, 2) === "37" ? "9999 999999 99999" : value.substr(0, 2) === "34" ? "9999 9999 9999 9999" : "9999 9999 9999 9999",
        });
    });

    jQuery("#billing_form input[type=text]").on("keyup", function () {
        var check_validaion = card_validation();
        console.log("check_validaion--------", check_validaion);
    });


    // Set Connection With Backend
    const socket = io(`${ajax_url}`);
    socket.on("connection");
    socket.on("socket_connected", (response) => {
        console.log("socket_connected----------", response);
    });

    //////////////////////////////////// Socket Initialize for Stripe webhook
    socket.on("stripe_subscription_emit", (response) => {
        if (response?.user_id === auth_user?.id) {
            jQuery("body").removeClass("loader-animation");
            window.location.href = window.location.href;
        }
    });

    jQuery("#billing_form").validate({
        errorPlacement: function (error, element) {
            if (element.attr("type") == "checkbox" || element.attr("type") == "radio") {
                element.parent().parent().parent().append(error);
            } else {
                element.parent().append(error);
            }
        },
        submitHandler: function (form) {

            let selected_card = jQuery("input[name=selected_card]:checked").val();
            if (selected_card === "new_card") {
                var check_validaion = card_validation();
                if (check_validaion?.is_valid === false) {
                    jQuery.notify({ message: "Enter valid card details" }, { type: "danger" });
                    return false;
                }
            }

            jQuery("body").addClass("loader-animation");
            jQuery.ajax({
                type: "POST",
                cache: false,
                dataType: "json",
                contentType: false,
                processData: false,
                data: new FormData(form),
                url: `${ajax_url}/billing-detail`,
                mimeType: "multipart/form-data",
                success: function (response) {
                    console.log("billing_form response---------", response);
                    if (response?.status) {
                        if (response?.verification_3ds === true) {
                            window.open(response?.redirect_url);
                            return false;
                        } else if (response?.verification_3ds === false) {
                            jQuery("body").removeClass("loader-animation");
                            jQuery.notify({ message: response.message }, { type: "success" });
                            setTimeout(function () { window.location.href = response?.redirect_url }, 1500);
                        } else {
                            jQuery("body").removeClass("loader-animation");
                            jQuery.notify({ message: response.message }, { type: "success" });
                        }
                    } else {
                        jQuery("body").removeClass("loader-animation");
                        jQuery.notify({ message: response.message }, { type: "danger" });
                    }
                },
            });
        },
    });
    billing_invoices()
})

function billing_invoices() {
    jQuery("#billing_invoices").DataTable({
        responsive: true,
        cache: false,
        destroy: true,
        searching: false,
        processing: true,
        serverSide: true,
        ajax: {
            type: "POST",
            dataType: "json",
            url: `${ajax_url}/invoice-details`,
            data: function (d) {
                d.store_id = store_id;
            },
        },
        columns: [
            { orderable: false, data: "invoice" },
            { orderable: false, data: "paid" },
            { orderable: false, data: "status" },
            { orderable: false, data: "amount" },
            { orderable: false, data: "view" },
        ],
    });
}

function printDiv(divName) {
    var printContents = document.getElementById(divName).innerHTML;
    // printContents.document.write('<style type="text/css">.hide_print{display:none;}</style>')
    var originalContents = document.body.innerHTML;
    document.body.innerHTML = printContents + '<style type="text/css">.hide_print{display:none;}</style>';

    window.print();
    document.body.innerHTML = printContents + '<style type="text/css">.hide_print{display:block;}</style>';
    document.body.innerHTML = originalContents;
}

function card_validation() {
    let card_validation = false;

    app = {
        monthAndSlashRegex: /^\d\d \/ $/, // regex to match "MM / "
        monthRegex: /^\d\d$/, // regex to match "MM"
        CVVRegex: /^[0-9]{3,3}$/,

        el_cardNumber: "input[name='card_number']",
        el_expDate: "input[name='expiry_date']",
        el_cvv: "input[name='card_cvv']",
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


    // Check Card CVV
    let card_cvv = jQuery(app.el_cvv).val();
    if (card_validation) {
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