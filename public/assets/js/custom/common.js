jQuery(document).ready(function () {

    if (jQuery(".flash_alert").length > 0) {
        setTimeout(function () {
            jQuery(".flash_alert .alert_close").click();
        }, 2000);
    }

    if (jQuery(".flatpickr_datepicker").length) {
        jQuery(".flatpickr_datepicker").flatpickr();
    }

    if (jQuery(".flatpickr_timepicker").length) {
        jQuery(".flatpickr_timepicker").flatpickr({
            enableTime: true,
            noCalendar: true,
            dateFormat: "H:i",
            // defaultDate: "today",
        });
    }

    if (jQuery(".flatpickr_datepicker_mimdate").length) {
        jQuery(".flatpickr_datepicker_mimdate").flatpickr({
            allowInput: false,
            altFormat: "F j, Y",
            dateFormat: "Y-m-d",
            // defaultDate: "today",
            minDate: moment().format('YYYY-MM-DD'),
        });
    }

    if (jQuery(".bootstrap_datatable").length > 0) {
        jQuery(".bootstrap_datatable").DataTable({
            info: false,
            paging: true,
            searching: false,
        });
        let select_html = $('.dataTables_length').closest('div').find('select').html();
        let id = $('.dataTables_length').attr('id');
        let number = id.match(/\d+/);
        let add_html = `<select name=${id} aria-controls='DataTables_Table_${number}' class="custom-select custom-select-sm form-control form-control-sm" style="margin-top:10px">${select_html}</select>`;
        let lbl = $('.dataTables_length').closest('div').find('label').html('Show Entries');
        let data = $(lbl).append(add_html);
        $('.dataTables_length').append(data);
    }

    jQuery(document).on("click", "#edit_counteries", function () {
        jQuery("#contriesPicker").modal("show");
    });

    jQuery(document).on("click", "#addProducts", function () {
        jQuery("#productsPicker").modal("show");
    });

    jQuery(document).on("click", "#add_product_for_offer_2", function () {
        jQuery("#addproductforoffer2").modal("show");
    });

    jQuery(document).on("click", "#add_product_for_offer_3", function () {
        jQuery("#addproductforoffer3").modal("show");
    });

    jQuery(".publish_button").click(function () {
        var store_id = $("#storeId").val();
        jQuery(".publish_button").prop("disabled", true);

        fetch(`${window.location.origin}/${store_id}/get-shop-token`).then((result) => {
            return result.json();
        }).then(async (response) => {
            if (response?.status == false) {
                jQuery(".publish_button").prop("disabled", false);
                jQuery.notify({ message: response.message }, { type: "danger" });
            } else {
                jQuery.notify({ message: response.message }, { type: "success" });
            }
        });
    });

    // Set Connection With Backend
    // const socket = io(`${ajax_url}`);
    // socket.on("connection");
    // socket.on("socket_connected", (response) => {
    //     console.log("socket_connected----------", response);
    // });

});

function array_column(array, column) {
    return array?.map((item) => item[column]);
};

function changeStore(value) {
    jQuery.ajax({
        type: "POST",
        dataType: "json",
        data: JSON.parse(value),
        url: `${ajax_url}/change-default-store`,
        success: function (response) {
            if (response.status) {
                window.location.href = response.redirect_url;
            }
        },
    });
}