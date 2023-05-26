jQuery(document).ready(function () {
    load_buylink_table();

    jQuery(document).on("click", ".clipboard_buylink_url", function () {
        let jquery_this = jQuery(this);
        let copy_content = jquery_this.parent().parent().find("input").val();

        var temp = jQuery("<input>");
        jQuery("body").append(temp);
        temp.val(copy_content).select();

        document.execCommand("copy");
        temp.remove();

        jQuery.notify({ message: "Copied" }, { type: "success" });
    });


    jQuery(document).on("click", ".delete_buylink", function () {
        let buylink_uuid = jQuery(this).attr("buylink_uuid");

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
                    jQuery.ajax({
                        type: "delete",
                        dataType: "json",
                        url: `${ajax_url}/buylink/delete`,
                        data: {
                            store_id: store_id,
                            buylink_uuid: buylink_uuid,
                        },
                        success: function (response) {
                            if (response?.status) {
                                load_buylink_table();
                                jQuery.notify({ message: response.message }, { type: "success" });
                            } else {
                                jQuery.notify({ message: response.message }, { type: "danger" });
                            }
                        },
                        error: function (response) {
                            jQuery.notify({ message: response.message }, { type: "danger" });
                        },
                    });
                }
            }
        });
    });
});

function load_buylink_table() {
    jQuery("#buylink_table").DataTable({
        responsive: true,
        cache: false,
        destroy: true,
        searching: false,
        processing: true,
        serverSide: true,
        ajax: {
            type: "POST",
            dataType: "json",
            url: `${ajax_url}/buylink/list`,
            data: function (d) {
                d.store_id = store_id;
            },
        },
        columns: [
            { orderable: false, data: "buylink_url" },
            { orderable: false, data: "discount_code" },
            { orderable: false, data: "created_at" },
            { orderable: false, data: "action" },
        ],
        fnDrawCallback: function () {
            iTotalRecords = this.api().page.info().recordsTotal;
            if (!iTotalRecords) {
                jQuery(".buy_listing").hide();
                jQuery(".buylink_banner").show();
            } else {
                jQuery(".buy_listing").show();
                jQuery(".buylink_banner").hide();
            }
        }
    });
}