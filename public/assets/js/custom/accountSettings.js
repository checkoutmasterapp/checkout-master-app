jQuery(document).ready(function () {

    jQuery("#blah").click(function () {
        jQuery("input[id='avatar']").click();
        jQuery("#avatar").change(function () {
            jQuery("#avatar_upload_btn").show();
            readIMG(this);
            const user_id = jQuery('#user_id').val();
            const fd = new FormData();
            const files = jQuery('#avatar')[0].files;
            fd.append('file', files[0]);
            fd.append('user_id', user_id);
            jQuery.ajax({
                type: "POST",
                cache: false,
                dataType: "json",
                contentType: false,
                processData: false,
                data: fd,
                url: `${ajax_url}/change-avatar`,
                mimeType: "multipart/form-data",
                success: function (response) {
                    if (response?.status) {
                        jQuery.notify({ message: response.message }, { type: "success" });
                        setTimeout(function () { window.location.reload(); }, 1000);

                    } else {
                        jQuery.notify({ message: response.message }, { type: "danger" });
                    }
                },
            });
        });
    });

    jQuery("#edit_profile").validate({
        errorPlacement: function (error, element) {
            if (element.attr("type") == "checkbox") {
                element.parent().append(error);
            } else {
                element.parent().append(error);
            }
        },
        submitHandler: function (form) {
            jQuery("body").addClass("loader-animation");

            jQuery.ajax({
                type: "POST",
                cache: false,
                dataType: "json",
                contentType: false,
                processData: false,
                data: new FormData(form),
                url: `${ajax_url}/account-settings`,
                mimeType: "multipart/form-data",
                success: function (response) {
                    if (response?.status) {
                        jQuery.notify({ message: response.message }, { type: "success" });
                        setTimeout(function () { window.location.reload(); }, 1000);
                    } else {
                        jQuery("body").removeClass("loader-animation");
                        jQuery.notify({ message: response.message }, { type: "danger" });
                    }
                },
            });
        },
    });

    jQuery("#edit_password").validate({
        errorPlacement: function (error, element) {
            if (element.attr("type") == "checkbox") {
                element.parent().append(error);
            } else {
                element.parent().append(error);
            }
        },
        submitHandler: function (form) {
            jQuery("form#edit_password :submit").attr("disabled", true);

            jQuery.ajax({
                type: "POST",
                cache: false,
                dataType: "json",
                contentType: false,
                processData: false,
                data: new FormData(form),
                url: `${ajax_url}/changePassword`,
                mimeType: "multipart/form-data",
                success: function (response) {
                    if (response?.status) {
                        jQuery.notify({ message: response.message }, { type: "success" });
                        setTimeout(function () { window.location.reload(); }, 1000);
                    } else {
                        jQuery("form#edit_password :submit").attr("disabled", false);

                        jQuery.notify({ message: response.message }, { type: "danger" });
                    }
                },
            });
        },
    });

    // jQuery("#avatar_upload_btn").click(function () {
    //     const user_id = jQuery('#user_id').val();
    //     const fd = new FormData();
    //     const files = jQuery('#avatar')[0].files;
    //     fd.append('file', files[0]);
    //     fd.append('user_id', user_id);
    //     jQuery.ajax({
    //         type: "POST",
    //         cache: false,
    //         dataType: "json",
    //         contentType: false,
    //         processData: false,
    //         data: fd,
    //         url: `${ajax_url}/change-avatar`,
    //         mimeType: "multipart/form-data",
    //         success: function (response) {
    //             if (response?.status) {
    //                 jQuery.notify({ message: response.message }, { type: "success" });
    //                 setTimeout(function () { window.location.reload(); }, 1500);

    //             } else {
    //                 jQuery.notify({ message: response.message }, { type: "danger" });
    //             }
    //         },
    //     });

    // })
    jQuery("#avatar_delete_btn").click(function () {
        const user_id = jQuery('#user_id').val();
        jQuery.ajax({
            type: "DELETE",
            cache: false,
            dataType: "json",
            contentType: false,
            processData: false,
            data: JSON.stringify({
                user_id: user_id,
            }),
            url: `${ajax_url}/delete-avatar`,
            contentType: "application/json",
            success: function (response) {
                if (response?.status) {
                    jQuery.notify({ message: response.message }, { type: "success" });
                    setTimeout(function () { window.location.reload(); }, 1500);
                } else {
                    jQuery.notify({ message: response.message }, { type: "danger" });
                }
            },
        });

    })
});

function readIMG(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            jQuery('#blah').attr('src', e.target.result);
        }

        reader.readAsDataURL(input.files[0]);
    }
}

$("#new-password").on("keyup", function () {

    var number = /([0-9])/;
    var alphabets = /([a-zA-Z])/;
    var special_characters = /([~,!,@,#,$,%,^,&,*,-,_,+,=,?,>,<])/;

    if ($("#new-password").val().length < 6) {
        $("#new-password-strength-status").removeClass();
        $("#new-password-strength-status").addClass("weak-password");
        $("#new-password-strength-status").html("Weak (should be atleast 6 characters.)");
        jQuery("form#edit_password :submit").attr("disabled", true);
    }
    else if ($("#new-password").val().match(number) && $("#new-password").val().match(alphabets) && $("#new-password").val().match(special_characters)) {
        $("#new-password-strength-status").removeClass();
        $("#new-password-strength-status").addClass("strong-password");
        $("#new-password-strength-status").html("Strong");
        jQuery("form#edit_password :submit").attr("disabled", false);


    } else {
        $("#new-password-strength-status").removeClass();
        $("#new-password-strength-status").addClass("medium-password");
        $("#new-password-strength-status").html("Medium (should include minimum 1 alphabet, numbers and minimum 1 special characters or some combination)");
        jQuery("form#edit_password :submit").attr("disabled", true);

    }
});

