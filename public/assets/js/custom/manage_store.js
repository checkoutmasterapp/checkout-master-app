jQuery(document).ready(function () {

    jQuery(document).on("click", ".store_script_clipboard", function () {
        let jquery_this = jQuery(this);

        let copy_content = jquery_this.parent().parent().find("input").val();

        var temp = jQuery("<input>");
        jQuery("body").append(temp);
        temp.val(copy_content).select();

        document.execCommand("copy");
        temp.remove();

        jQuery.notify({ message: "Copied" }, { type: "success" });
    });

    jQuery(document).on("click", ".store_delete", function () {
        let store_id = jQuery(this).attr("store_id");

        bootbox.confirm({
            title: "Are you sure?",
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
                    jQuery.ajax({
                        type: "delete",
                        dataType: "json",
                        url: `${ajax_url}/store-delete`,
                        data: { store_id: store_id },
                        error: function (response) {
                            jQuery.notify({ message: response.message }, { type: "danger" });
                        },
                        success: function (response) {
                            if (response?.status) {
                                jQuery.notify({ message: response.message }, { type: "success" });
                                setTimeout(function () { window.location.href = response?.redirect_url; }, 1500);
                            } else {
                                jQuery.notify({ message: response.message }, { type: "danger" });
                            }
                        },
                    });
                }
            },
        });
    });

})