jQuery(document).ready(function () {

    if (automatic_discount_count > 0) {
        load_automatic_discount();
        jQuery(".automatic_discount_banner").hide();
        jQuery(".automatic_discount_listing").show();
    } else {
        jQuery(".automatic_discount_banner").show();
        jQuery(".automatic_discount_listing").hide();
    }

    jQuery(document).on("click", ".delete_automatic_discount", function () {
        let discount_id = jQuery(this).attr("discount_id");
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
                        type: "POST",
                        dataType: "json",
                        url: `${ajax_url}/delete-discount`,
                        data: {
                            id: discount_id,
                            store_id: jQuery(".store_id").val()
                        },
                        success: function (response) {
                            if (response?.status) {
                                load_automatic_discount();
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

function load_automatic_discount() {
    jQuery("#automatic_discount_table").DataTable({
        responsive: true,
        cache: false,
        destroy: true,
        searching: false,
        processing: true,
        serverSide: true,
        ajax: {
            type: "POST",
            dataType: "json",
            url: `${ajax_url}/discounts`,
            data: function (d) {
                d.store_id = jQuery(".store_id").val();
            },
        },
        columns: [
            { orderable: false, data: "discount_title" },
            { orderable: false, data: "discount_triggers" },
            { orderable: false, data: "discount_date" },
            { orderable: false, data: "discount_usage" },
            { orderable: false, data: "discount_status" },
            { orderable: false, data: "action" },
        ],
        fnDrawCallback: function () {
            iTotalRecords = this.api().page.info().recordsTotal;
            if (!iTotalRecords) {
                jQuery(".automatic_discount_listing").hide();
                jQuery(".automatic_discount_banner").show();
            } else {
                jQuery(".automatic_discount_listing").show();
                jQuery(".automatic_discount_banner").hide();
            }
        }
    });
}