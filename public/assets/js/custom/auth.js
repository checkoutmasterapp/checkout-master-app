jQuery(document).ready(function () {
    jQuery("#register_btn").removeAttr("disabled");
    jQuery("#forgot_pwd_link").removeAttr("disabled");
    jQuery("#create_account_link").removeAttr("disabled");
    jQuery("#go_back_login").removeAttr("disabled");
    jQuery("#reset_pwd_btn").removeAttr("disabled");
    jQuery("#login_button_id").removeAttr("disabled");

    jQuery("#register_form input[name=first_name]").on("change", function () {
        jQuery("#register_form input[name=first_name]").val($.trim(jQuery("#register_form input[name=first_name]").val()));
    });
    jQuery("#register_form input[name=last_name]").on("change", function () {
        jQuery("#register_form input[name=last_name]").val($.trim(jQuery("#register_form input[name=last_name]").val()));
    });

    jQuery("#login_form").validate({
        errorPlacement: function (error, element) {
            if (element.attr("type") == "checkbox") {
                element.parent().append(error);
            } else {
                element.parent().append(error);
            }
        },
        submitHandler: function (form) {
            jQuery("form#login_form :submit").attr("disabled", true);
            jQuery.ajax({
                type: "POST",
                cache: false,
                dataType: "json",
                contentType: false,
                processData: false,
                data: new FormData(form),
                url: `${ajax_url}/login`,
                mimeType: "multipart/form-data",
                success: function (response) {
                    if (response?.status) {
                        jQuery.notify({ message: response.message }, { type: "success" });
                        setTimeout(function () {
                            window.location.href = response?.redirect_url;
                        }, 1500);
                    } else {
                        jQuery("form#login_form :submit").attr("disabled", false);
                        jQuery.notify({ message: response.message }, { type: "danger" });
                    }
                },
            });
        },
    });

    jQuery("#password").on("keyup", function () {
        var number = /([0-9])/;
        var alphabets = /([a-zA-Z])/;
        var special_characters = /([~,!,@,#,$,%,^,&,*,-,_,+,=,?,>,<])/;
        if (jQuery("#password").val().length < 6) {
            jQuery("#password-strength-status").removeClass();
            jQuery("#password-strength-status").addClass("weak-password");
            jQuery("#password-strength-status").html("Weak (should be atleast 6 characters.)");
            jQuery("form#register_form :submit").attr("disabled", true);
            jQuery("form#verify_password :submit").attr("disabled", true);
        } else {
            if (jQuery("#password").val().match(number) && jQuery("#password").val().match(alphabets) && jQuery("#password").val().match(special_characters)) {
                jQuery("#password-strength-status").removeClass();
                jQuery("#password-strength-status").addClass("strong-password");
                jQuery("#password-strength-status").html("Strong");
                jQuery("form#register_form :submit").attr("disabled", false);
                jQuery("form#verify_password :submit").attr("disabled", false);
            } else {
                jQuery("#password-strength-status").removeClass();
                jQuery("#password-strength-status").addClass("medium-password");
                jQuery("#password-strength-status").html("Medium (should include minimum 1 alphabet, numbers and minimum 1 special characters or some combination)");
                jQuery("form#register_form :submit").attr("disabled", true);
                jQuery("form#verify_password :submit").attr("disabled", true);
            }
        }
    });


    /*** Register Form ***/
    if (jQuery("#register_form").length) {
        jQuery("#register_form").validate({
            errorPlacement: function (error, element) {
                if (element.attr("type") == "checkbox") {
                    element.parent().append(error);
                } else {
                    element.parent().append(error);
                }
            },
            submitHandler: function (form) {
                jQuery("form#register_form :submit").attr("disabled", true);

                var email = jQuery("form#register_form input[name='email']").val();
                jQuery.ajax({
                    type: "POST",
                    cache: false,
                    dataType: "json",
                    contentType: false,
                    processData: false,
                    data: new FormData(form),
                    url: `${ajax_url}/register`,
                    mimeType: "multipart/form-data",
                    success: function (response) {
                        if (response?.status) {

                            fpr("referral", { email: email });

                            jQuery.notify({ message: response.message }, { type: "success" });
                            setTimeout(function () {
                                window.location.href = response?.redirect_url;
                            }, 1500);
                        } else {
                            jQuery("form#register_form :submit").attr("disabled", false);
                            jQuery.notify({ message: response.message }, { type: "danger" });
                        }
                    },
                });
            },
        });
    }

    if (jQuery(".account-verify").length) {
        window.addEventListener('DOMContentLoaded', function () {
            var userEmail = document.getElementById('user-email').innerText;
            fpr("referral", { email: userEmail });
        });
    }

    jQuery("#email-forgot").on("change", function () {
        jQuery("#code-send").removeAttr("disabled");
    });

    jQuery("#forgot_password").validate({
        errorPlacement: function (error, element) {
            if (element.attr("type") == "checkbox") {
                element.parent().append(error);
            } else {
                element.parent().append(error);
            }
        },
        submitHandler: function (form) {
            jQuery("#code-send").hide();
            jQuery("#loading_button").show();
            jQuery("form#forgot_password :submit").attr("disabled", true);

            jQuery.ajax({
                type: "POST",
                cache: false,
                dataType: "json",
                contentType: false,
                processData: false,
                data: new FormData(form),
                url: `${ajax_url}/forgotPassword`,
                mimeType: "multipart/form-data",
                success: function (response) {
                    if (response?.status) {
                        jQuery.notify({ message: response.message }, { type: "success" });
                        setTimeout(function () {
                            window.location.href = response?.redirect_url;
                        }, 1500);
                        jQuery("#code-send").show();
                        jQuery("#code-send").attr("disabled", "disabled");
                        jQuery("#loading_button").hide();
                        jQuery("#forgot_password input").attr("disabled", "disabled");
                    } else {
                        jQuery("#code-send").show();
                        jQuery("#loading_button").hide();
                        jQuery("form#forgot_password :submit").attr("disabled", false);
                        jQuery.notify({ message: response.message }, { type: "danger" });
                    }
                },
            });
        },
    });

    jQuery("#resend_email_verification").validate({
        errorPlacement: function (error, element) {
            if (element.attr("type") == "checkbox") {
                element.parent().append(error);
            } else {
                element.parent().append(error);
            }
        },
        submitHandler: function (form) {
            jQuery("#code-send").hide();
            jQuery("#loading_button").show();
            jQuery("form#resend_email_verification :submit").attr("disabled", true);

            jQuery.ajax({
                type: "POST",
                cache: false,
                dataType: "json",
                contentType: false,
                processData: false,
                data: new FormData(form),
                url: `${ajax_url}/resend-verification-email`,
                mimeType: "multipart/form-data",
                success: function (response) {
                    jQuery("#code-send").show();
                    jQuery("#loading_button").hide();
                    jQuery("form#resend_email_verification :submit").attr("disabled", false);

                    if (response?.status) {
                        jQuery.notify({ message: response.message }, { type: "success" });
                        setTimeout(function () {
                            window.location.href = response?.redirect_url;
                        }, 1500);
                    } else {
                        jQuery.notify({ message: response.message }, { type: "danger" });
                    }
                },
            });
        }
    })


    jQuery("#resend_link").validate({
        errorPlacement: function (error, element) {
            if (element.attr("type") == "checkbox") {
                element.parent().append(error);
            } else {
                element.parent().append(error);
            }
        },
        submitHandler: function (form) {
            jQuery.ajax({
                type: "POST",
                cache: false,
                dataType: "json",
                contentType: false,
                processData: false,
                data: new FormData(form),
                url: `${ajax_url}/forgotPassword`,
                mimeType: "multipart/form-data",
                success: function (response) {
                    if (response?.status) {
                        jQuery.notify({ message: response.message }, { type: "success" });
                        setTimeout(function () {
                            window.location.href = response?.redirect_url;
                        }, 1500);
                    } else {
                        jQuery.notify({ message: response.message }, { type: "danger" });
                    }
                },
            });
        },
    });

    let queryString = window.location.href;

    let user_id = queryString.substring(queryString.lastIndexOf("/") + 1);
    jQuery("#verify_password").validate({
        errorPlacement: function (error, element) {
            if (element.attr("type") == "checkbox") {
                element.parent().append(error);
            } else {
                element.parent().append(error);
            }
        },
        submitHandler: function (form) {
            jQuery("form#verify_password :submit").attr("disabled", true);
            jQuery.ajax({
                type: "POST",
                cache: false,
                dataType: "json",
                contentType: false,
                processData: false,
                data: new FormData(form),
                url: `${ajax_url}/resetPassword/${user_id}`,
                mimeType: "multipart/form-data",
                success: function (response) {
                    if (response?.status) {
                        jQuery.notify({ message: response.message }, { type: "success" });
                        setTimeout(function () {
                            window.location.href = `${ajax_url}/resetSuccess`;
                        }, 1500);
                    } else {
                        jQuery("form#verify_password :submit").attr("disabled", false);
                        jQuery.notify({ message: response.message }, { type: "danger" });
                    }
                },
            });
        },
    });

    jQuery("#resend_verify_email").validate({
        errorPlacement: function (error, element) {
            if (element.attr("type") == "checkbox") {
                element.parent().append(error);
            } else {
                element.parent().append(error);
            }
        },
        submitHandler: function (form) {
            jQuery("#loading_button").show();
            jQuery("form#resend_verify_email :submit").attr("disabled", true);

            jQuery.ajax({
                type: "POST",
                cache: false,
                dataType: "json",
                contentType: false,
                processData: false,
                data: new FormData(form),
                url: `${ajax_url}/account-verify`,
                mimeType: "multipart/form-data",
                success: function (response) {
                    if (response?.status) {
                        jQuery.notify({ message: response.message }, { type: "success" });
                        setTimeout(function () {
                            window.location.href = response?.redirect_url;
                        }, 1500);

                        jQuery("#code-send").attr("disabled", "disabled");
                        jQuery("#loading_button").hide();
                    } else {
                        jQuery("#loading_button").hide();
                        jQuery("form#resend_verify_email :submit").attr("disabled", false);
                        jQuery.notify({ message: response.message }, { type: "danger" });
                    }
                },
            });
        },
    });
});