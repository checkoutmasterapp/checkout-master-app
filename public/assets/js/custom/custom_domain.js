jQuery(document).ready(function () {

    /*****************************************
     ***** Create Custom Domain Js
    *****************************************/
    jQuery("#add_custom_domain_form").validate({
        errorPlacement: function (error, element) {
            if (element.attr("type") == "checkbox" || element.attr("type") == "radio") {
                element.parent().parent().parent().append(error);
            } else {
                element.parent().parent().append(error);
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
                url: `${ajax_url}/custom-domain`,
                mimeType: "multipart/form-data",
                error: function (xhr, ajaxOptions, thrownError) {
                    jQuery("body").removeClass("loader-animation");
                    jQuery.notify({ message: "Something went wrong with ajax. Please try again" }, { type: "danger" });
                },
                success: function (response) {
                    if (response?.status) {
                        jQuery.notify({ message: response.message }, { type: "success" });
                        setTimeout(function () { window.location.href = response?.redirect_url; }, 1500);
                    } else {
                        jQuery("body").removeClass("loader-animation");
                        jQuery.notify({ message: response.message }, { type: "danger" });
                    }
                },
            });
        },
    });

    jQuery(document).on("click", ".clipboard_content", function () {
        let jquery_this = jQuery(this);
        let copy_content = jquery_this.parent().parent().find("input").val();

        var temp = jQuery("<input>");
        jQuery("body").append(temp);
        temp.val(copy_content).select();

        document.execCommand("copy");
        temp.remove();

        jQuery.notify({ message: "Copied" }, { type: "success" });
    });

    /*****************************************
     ***** Pending verification Custom Domain Js
    *****************************************/
    jQuery(document).on("click", ".pending_verification", function () {
        let custom_domain_id = jQuery("input[name='custom_domain_id']").val();
        jQuery("body").addClass("loader-animation");
        jQuery.ajax({
            type: "POST",
            dataType: "json",
            url: `${ajax_url}/custom-domain/edit`,
            data: {
                store_id: store_id,
                custom_domain_id: custom_domain_id,
                action: "pending_verification",
            },
            error: function (response) {
                jQuery("body").removeClass("loader-animation");
                jQuery.notify({ message: response.message }, { type: "danger" });
            },
            success: function (response) {
                jQuery("body").removeClass("loader-animation");
                if (response?.status) {
                    jQuery.notify({ message: response.message }, { type: "success" });
                    setTimeout(function () { window.location.href = `${ajax_url}/${store_id}/custom-domain/edit`; }, 1500);
                } else {
                    jQuery.notify({ message: response.message }, { type: "danger" });
                }
            },
        });
    });

    /*****************************************
     ***** Delete Custom Domain Js
    *****************************************/
    jQuery(document).on("click", ".delete_domain", function () {
        let store_id = jQuery("input[name='store_id']").val()
        let custom_domain_id = jQuery("input[name='custom_domain_id']").val();

        bootbox.confirm({
            title: "Alert",
            message: "Are you sure you want to delete?",
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
                    jQuery("body").addClass("loader-animation");
                    jQuery.ajax({
                        type: "delete",
                        dataType: "json",
                        url: `${ajax_url}/custom-domain/delete`,
                        data: {
                            store_id: store_id,
                            custom_domain_id: custom_domain_id
                        },
                        error: function (response) {
                            jQuery("body").removeClass("loader-animation");
                            jQuery.notify({ message: response.message }, { type: "danger" });
                        },
                        success: function (response) {
                            if (response?.status) {
                                jQuery.notify({ message: response.message }, { type: "success" });
                                setTimeout(function () { window.location.href = `${ajax_url}/${store_id}/custom-domain`; }, 1500);
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
});