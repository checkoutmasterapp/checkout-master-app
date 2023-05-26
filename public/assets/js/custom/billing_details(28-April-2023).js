let newMonth = new Date().getMonth() + 1;
let newYear = new Date().getFullYear().toString().substr(-2);
let regYearNew = newYear;
for (let i = 1; i <= 7; i++) {
    regYearNew = regYearNew + "|" + parseInt(parseInt(newYear) + parseInt(i));
}
// $("#card_number").on("change", function () {
//     $("#expiry_date_id").val("");
//     $("#cvv_id").val("");
// });
$("#expiry_date_id").on("change", function () {
    $("#cvv_id").val("");
});
$('#card_number').on('input', function (e) {
    $("#expiry_date_id").val("");
    $("#cvv_id").val("");
    var value = $(this).inputmask('unmaskedvalue');
    $('#card_number').inputmask({
        mask: (value.substr(0, 2) === '36' ? '9999 999999 9999' : value.substr(0, 2) === '37' ? '9999 999999 99999' : value.substr(0, 2) === '34' ? '9999 9999 9999 9999' : '9999 9999 9999 9999')
    });
});
// regYearNew = new RegExp(regYearNew, 'gi');
regYearNew = new RegExp(`^${regYearNew}$`);
function cardFormValidate() {
    var cardValid = 0;
    // jQuery("#card_number").inputmask()
    //card number validation
    jQuery("#card_number").validateCreditCard(function (result) {
        if (result.valid) {
            jQuery("#card_number").removeClass("requiredBorder");
            cardValid = 1;
        } else {
            jQuery("#card_number").addClass("requiredBorder");
            cardValid = 0;
        }
    });

    var regCVV = /^[0-9]{3,3}$/;
    var card_value = jQuery("#card_number").inputmask('unmaskedvalue');
    if (card_value.substr(0, 2) === '37') {
        jQuery("#cvv_id").attr("maxlength", "4");
        regCVV = /^[0-9]{4,4}$/;
    } else {
        jQuery("#cvv_id").attr("maxlength", "3");
        regCVV = /^[0-9]{3,3}$/;
    }

    //card details validation
    var expMonth = jQuery("#expiry_date_id").val().substring(0, 2);
    var expYear = jQuery("#expiry_date_id").val().substring(3, 5);
    var cvv = jQuery("#cvv_id").val();
    // var regName = /^[a-z ,.'-]+$/i;
    var regMonth = /^01|02|03|04|05|06|07|08|09|10|11|12$/;
    var regYear = /^23|24|25|26|27|28|29$/;
    // var regYear = regYearNew;
    if (cardValid == 0) {
        jQuery("#card_number").addClass("requiredBorder");
        // jQuery("#card_number").focus();
        jQuery("#submitBilling").attr("disabled", "disabled");
        return false;
    } else if (!regMonth.test(expMonth)) {
        jQuery("#card_number").removeClass("requiredBorder");
        jQuery("#expiry_date_id").addClass("requiredBorder");
        // jQuery("#expiry_date_id").focus();
        jQuery("#submitBilling").attr("disabled", "disabled");
        return false;
    } else if (!regYearNew.test(expYear)) {
        jQuery("#card_number").removeClass("requiredBorder");
        // jQuery("#expiry_date_id").removeClass('requiredBorder');
        jQuery("#expiry_date_id").addClass("requiredBorder");
        // jQuery("#expiry_date_id").focus();
        jQuery("#submitBilling").attr("disabled", "disabled");
        return false;
    } else if (expYear == newYear && expMonth < newMonth) {
        jQuery("#card_number").removeClass("requiredBorder");
        // jQuery("#expiry_date_id").removeClass('requiredBorder');
        jQuery("#expiry_date_id").addClass("requiredBorder");
        // jQuery("#expiry_date_id").focus();
        jQuery("#submitBilling").attr("disabled", "disabled");
        return false;
    } else if (!regCVV.test(cvv)) {
        jQuery("#card_number").removeClass("requiredBorder");
        jQuery("#expiry_date_id").removeClass("requiredBorder");
        jQuery("#cvv_id").addClass("requiredBorder");
        // jQuery("#cvv_id").focus();
        jQuery("#submitBilling").attr("disabled", "disabled");
        return false;
    } else {
        jQuery("#card_number").removeClass("requiredBorder");
        jQuery("#expiry_date_id").removeClass("requiredBorder");
        jQuery("#cvv_id").removeClass("requiredBorder");
        // jQuery("#name_on_card").removeClass('requiredBorder');
        //update expiry_date_id
        // jQuery("#expiry_date_id").val(`${expMonth}/${expYear}`);
        jQuery("#submitBilling").removeAttr("disabled");
        return true;
    }
}
jQuery(document).ready(function () {
    //card validation on input fields
    jQuery("#billing_form input[type=text]").on("keyup", function () {
        cardFormValidate();
    });
    //card validation on input fields
    jQuery("#isCompanyId").on("change", function () {
        if (jQuery("#isCompanyId").prop("checked") == true) {
            jQuery("#billing_form input[name=billing_company]").val("");
            jQuery("#billing_form input[name=billing_company]").removeClass("required");
            jQuery("#billing_form input[name=billing_company]").attr("readonly", true);
        } else {
            jQuery("#billing_form input[name=billing_company]").addClass("required");
            jQuery("#billing_form input[name=billing_company]").removeAttr("readonly");
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
            jQuery("#submitBilling").hide();
            jQuery("#loading_button").show();
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
                    jQuery("#submitBilling").show();
                    jQuery("#loading_button").hide();
                    if (response?.status) {
                        jQuery("#submitBilling").attr("disabled", "disabled");
                        jQuery("#billing_form input").attr("disabled", "disabled");
                        jQuery.notify({ message: response.message }, { type: "success" });
                        setTimeout(function () { window.location.href = response?.redirect_url; }, 1500);
                    } else {
                        jQuery.notify({ message: response.message }, { type: "danger" });
                    }
                },
            });
        },
    });

    jQuery("#billing_form input[type=text]").on("change", function () {
        jQuery(this).val($.trim(jQuery(this).val()));
    });

    jQuery("input[name=card_id]").on("change", function () {
        if (jQuery(this).val() == "new_card") {
            jQuery("#collapseCC").show("slow");
            jQuery("#submitBilling").attr("disabled", "disabled");
        } else {
            jQuery("#collapseCC").hide("slow");
            jQuery("#submitBilling").removeAttr("disabled");
        }
    });

    if (jQuery("input[name=card_id]").is(":checked")) {
        if (jQuery(this).val() == "new_card") {
            jQuery("#submitBilling").attr("disabled", "disabled");
        } else {
            jQuery("#submitBilling").removeAttr("disabled");
        }
    }
});

function isNumber(evt) {
    evt = evt ? evt : window.event;
    var charCode = evt.which ? evt.which : evt.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        return false;
    }
    return true;
}

function formatString(event) {
    var inputChar = String.fromCharCode(event.keyCode);
    var code = event.keyCode;
    var allowedKeys = [8];
    if (allowedKeys.indexOf(code) !== -1) {
        return;
    }

    event.target.value = event.target.value
        .replace(
            /^([1-9]\/|[2-9])$/g,
            "0$1/" // 3 > 03/
        )
        .replace(
            /^(0[1-9]|1[0-2])$/g,
            "$1/" // 11 > 11/
        )
        .replace(
            /^([0-1])([3-9])$/g,
            "0$1/$2" // 13 > 01/3
        )
        .replace(
            /^(0?[1-9]|1[0-2])([0-9]{2})$/g,
            "$1/$2" // 141 > 01/41
        )
        .replace(
            /^([0]+)\/|[0]+$/g,
            "0" // 0/ > 0 and 00 > 0
        )
        .replace(
            /[^\d\/]|^[\/]*$/g,
            "" // To allow only digits and `/`
        )
        .replace(
            /\/\//g,
            "/" // Prevent entering more than 1 `/`
        );
}

jQuery(document).ready(function ($) {
    jQuery(".table-row").click(function () {
        window.document.location = jQuery(this).data("href");
    });
});

function printDiv(divName) {
    var printContents = document.getElementById(divName).innerHTML;
    // printContents.document.write('<style type="text/css">.hide_print{display:none;}</style>')
    var originalContents = document.body.innerHTML;
    document.body.innerHTML = printContents + '<style type="text/css">.hide_print{display:none;}</style>';

    window.print();
    document.body.innerHTML = printContents + '<style type="text/css">.hide_print{display:block;}</style>';
    document.body.innerHTML = originalContents;
}