jQuery(document).ready(function () {
    load_upsell();

    jQuery(document).on("click", ".delete_upsell", function () {
        let upsell_uuid = jQuery(this).attr("upsell_uuid");
        console.log("delete_upsell upsell_uuid----------", upsell_uuid);

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
                        url: `${ajax_url}/delete-upsell`,
                        data: {
                            upsell_id: upsell_uuid,
                            store_id: jQuery(".store_id").val()
                        },
                        success: function (response) {
                            if (response?.status) {
                                load_upsell();
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

function load_upsell() {
    jQuery("#upsell_table").DataTable({
        responsive: true,
        cache: false,
        destroy: true,
        searching: false,
        processing: true,
        serverSide: true,
        ajax: {
            type: "POST",
            dataType: "json",
            url: `${ajax_url}/upsell`,
            data: function (d) {
                d.store_id = jQuery(".store_id").val();
            },
        },
        columns: [
            { orderable: false, data: "upsell_triggers" },
            { orderable: false, data: "upsell_offers" },
            { orderable: false, data: "created_at" },
            { orderable: false, data: "status" },
            { orderable: false, data: "action" },
        ],
        fnDrawCallback: function () {
            iTotalRecords = this.api().page.info().recordsTotal;
            if (!iTotalRecords) {
                jQuery(".upsell_listing").hide();
                jQuery(".upsell_banner").show();
            } else {
                jQuery(".upsell_listing").show();
                jQuery(".upsell_banner").hide();
            }
        }
    });
}