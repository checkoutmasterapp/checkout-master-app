jQuery(document).ready(function () {

    /*****************************************
     ***** Cart Recovery Listing Js
    *****************************************/
    load_recovery_emails();
    jQuery(document).on("click", ".delete_recovery_email", function () {
        let cart_recovery_id = jQuery(this).attr("cart_recovery_id");
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
                        url: `${ajax_url}/cart-recovery/delete`,
                        data: {
                            store_id: store_id,
                            cart_recovery_id: cart_recovery_id,
                        },
                        success: function (response) {
                            if (response?.status) {
                                load_recovery_emails();
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

    /*****************************************
     ***** Cart Recovery Add Js
    *****************************************/

    jQuery(".performance_filter").flatpickr({
        allowInput: false,
        altFormat: "F j, Y",
        dateFormat: "Y-m-d",
        defaultDate: "today",
        maxDate: moment().format('YYYY-MM-DD'),
    });

    jQuery(document).on("change", ".performance_filter", function () {
        const startDate = $('#from_date').val()
        const endDate = $('#to_date').val()

        jQuery(".performance_filter_error").html("");
        if (endDate < startDate) {
            jQuery(".performance_filter_error").html("Start date can't be greater than end date");
            jQuery.notify({ message: "Start date can't be greater than End date" }, { type: "danger" });
            return
        }

        const store_id = $('input[name="store_id"]').val()
        const cart_recovery_id = $('input[name="id"]').val()
        console.log("startDate", startDate, endDate, store_id, cart_recovery_id)
        jQuery.ajax({
            type: "POST",
            cache: false,
            dataType: "json",
            contentType: "application/json",
            processData: false,
            data: JSON.stringify({
                store_id: store_id,
                cart_recovery_id: cart_recovery_id,
                startDate,
                endDate
            }),
            url: `${ajax_url}/cart-recovery/filter`,
            success: function (response) {
                if (response) {
                    jQuery("#sent_time").html(`${response.sent_time}`)
                    jQuery("#time_clicked").html(`${response.time_clicked}`)
                    jQuery("#purchased_time").html(`${response.purchased_time}`)
                    jQuery("#purchased_amount").html(`$${response.purchased_amount || '0.00'}`)
                } else {
                    console.log("error")
                }
            },
        });
    });


    jQuery("#add_cart_recovery").validate({
        errorPlacement: function (error, element) {
            if (element.attr("type") == "checkbox") {
                element.parent().append(error);
            } else {
                element.parent().append(error);
            }
        },
        submitHandler: function (form) {
            jQuery("form#add_cart_recovery :submit").attr("disabled", true);
            jQuery.ajax({
                type: "POST",
                cache: false,
                dataType: "json",
                contentType: false,
                processData: false,
                data: new FormData(form),
                url: `${ajax_url}/cart-recovery/create`,
                mimeType: "multipart/form-data",
                success: function (response) {
                    if (response?.status) {
                        jQuery.notify({ message: response.message }, { type: "success" });
                        setTimeout(function () { window.location.href = response?.redirect_url }, 1500);
                    } else {
                        jQuery.notify({ message: response.message }, { type: "danger" });
                        jQuery("form#add_cart_recovery :submit").attr("disabled", false);
                    }
                },
            });
        },
    });

    /*****************************************
     ***** Cart Recovery Edit Js
    *****************************************/
    jQuery("#edit_cart_recovery").validate({
        errorPlacement: function (error, element) {
            if (element.attr("type") == "checkbox") {
                element.parent().append(error);
            } else {
                element.parent().append(error);
            }
        },
        submitHandler: function (form) {
            jQuery("form#edit_cart_recovery :submit").attr("disabled", true);
            jQuery.ajax({
                type: "POST",
                cache: false,
                dataType: "json",
                contentType: false,
                processData: false,
                data: new FormData(form),
                url: `${ajax_url}/cart-recovery/edit`,
                mimeType: "multipart/form-data",
                success: function (response) {
                    if (response?.status) {
                        jQuery.notify({ message: response.message }, { type: "success" });
                        setTimeout(function () { window.location.href = response?.redirect_url }, 1500);
                    } else {
                        jQuery.notify({ message: response.message }, { type: "danger" });
                        jQuery("form#edit_cart_recovery :submit").attr("disabled", false);
                    }
                },
            });
        },
    });

    jQuery(".delete_cart_recovery_email").click(function () {
        let cart_recovery_id = this.id;
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
                        type: "DELETE",
                        cache: false,
                        dataType: "json",
                        contentType: "application/json",
                        processData: false,
                        data: JSON.stringify({
                            store_id: store_id,
                            cart_recovery_id: cart_recovery_id,
                        }),
                        url: `${ajax_url}/delete-cart-recovery`,
                        success: function (response) {
                            if (response?.status) {
                                jQuery.notify({ message: response.message }, { type: "success" });
                                setTimeout(function () { window.location.href = response?.redirect_url }, 1500);
                            } else {
                                jQuery.notify({ message: response.message }, { type: "danger" });
                            }
                        },
                    });
                }
            }
        });
    });
});

function load_recovery_emails() {
    jQuery("#recovery_email_table").DataTable({
        cache: false,
        destroy: true,
        searching: false,
        responsive: true,
        processing: true,
        serverSide: true,
        ajax: {
            type: "POST",
            dataType: "json",
            url: `${ajax_url}/cart-recovery`,
            data: function (d) {
                d.store_id = store_id;
            },
        },
        columns: [
            { orderable: false, data: "email_title" },
            { orderable: false, data: "schedule_time" },
            { orderable: false, data: "created_at" },
            { orderable: false, data: "action" },
        ],
        fnDrawCallback: function () {
            iTotalRecords = this.api().page.info().recordsTotal;
            if (!iTotalRecords) {
                jQuery(".cart_recovery_listing").hide();
                jQuery(".cart_recovery_banner").show();
            } else {
                jQuery(".cart_recovery_listing").show();
                jQuery(".cart_recovery_banner").hide();
            }
        }
    });
}