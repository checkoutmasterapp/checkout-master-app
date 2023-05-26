jQuery(document).ready(function () {
    let tax_country_codes = [];
    load_recovery_emails()
    jQuery(document).on("click", "#region-checkbox-Africa", function () {
        jQuery(".region-Africa").prop("checked", jQuery(this).prop("checked"));
    });

    jQuery(document).on("click", "#region-checkbox-Americas", function () {
        jQuery(".region-Americas").prop("checked", jQuery(this).prop("checked"));
    });

    jQuery(document).on("click", "#region-checkbox-Asia", function () {
        jQuery(".region-Asia").prop("checked", jQuery(this).prop("checked"));
    });

    jQuery(document).on("click", "#region-checkbox-Europe", function () {
        jQuery(".region-Europe").prop("checked", jQuery(this).prop("checked"));
    });

    jQuery(document).on("click", "#region-checkbox-Oceania", function () {
        jQuery(".region-Oceania").prop("checked", jQuery(this).prop("checked"));
    });

    jQuery(document).on("click", "#tax_rate_name", function (e) {
        jQuery(this).removeClass("error");
    });

    jQuery(document).on("click", "#tax_rate_percentage", function (e) {
        jQuery(this).removeClass("error");
    });
    $('#switch-tax-not-included').prop("checked", true);

    $("#switch-tax-not-included").click(function () {
        var checked = $(this).is(':checked');
        if (checked) {
            $('.inner1').css('border', '1px solid #000');
            $('.inner2').css('border', '1px solid lightgrey');

            $('.tax-warning').show();
            $('#switch-tax-included').prop("checked", false);
        }
        else {
            $('.inner1').css('border', '1px solid lightgrey');
            $('.inner2').css('border', '1px solid #000');
            $('.tax-warning').hide();
            $('#switch-tax-not-included').prop("checked", false);
            $('#switch-tax-included').prop("checked", true);

        }
    });

    $("#switch-tax-included").click(function () {
        var checked = $(this).is(':checked');
        if (checked) {
            $('.inner1').css('border', '1px solid lightgrey');
            $('.inner2').css('border', '1px solid #000');
            $('.tax-warning').hide();
            $('#switch-tax-not-included').prop("checked", false);
            $('#switch-tax-included').prop("checked", true);

        }
        else {
            $('.inner1').css('border', '1px solid #000');
            $('.inner2').css('border', '1px solid lightgrey');
            $('.tax-warning').show();
            $('#switch-tax-included').prop("checked", false);
            $('#switch-tax-not-included').prop("checked", true);
        }
    });

    $("#switch-tax-shipping-rate").click(function () {
        var checked = $(this).is(':checked');
        if (checked) {
            $('.inner3').css('border', '1px solid #000');
        }
        else {
            $('.inner3').css('border', '1px solid lightgrey');
        }
    });

    jQuery(document).on("click", "#update_tax_countries_btn", function () {
        tax_country_codes = [];
        jQuery("#tax-rate-countries").html("");
        jQuery("#tax-rate-item-flags").html("");
        jQuery("#validate-countries-error").css("display", "none");

        jQuery("input:checkbox:checked.custom-control-input").each(function () {
            let id = jQuery(this).attr("id");
            let text = jQuery('label[for="' + id + '"]').html();
            let code = jQuery(this).val();
            if (code != "on") {
                tax_country_codes.push({
                    country_code: code,
                    country_name: text,
                });
            }
        });
        if (tax_country_codes.length > 0) {
            var html;
            let countries_count;
            for (let index = 0; index < tax_country_codes.length; index++) {
                const country_details = tax_country_codes[index];
                if (index < 3) {
                    html = '<span class="flags-icons fi fi-' + country_details.country_code.toLowerCase() + '" ></span>' + country_details.country_name;
                    jQuery("#tax-rate-countries").append(html);
                }
            }
            if (tax_country_codes.length >= 3) {
                countries_count = tax_country_codes.length - 3;
                let count = " +" + countries_count + " others";
                jQuery("#tax-rate-countries").append(count);
            }
            jQuery("#contriesPicker").modal("toggle");
            jQuery("#validate-countries-error").css("display", "none");
        } else {
            jQuery("#validate-countries-error").css("display", "block");
        }
    });

    jQuery(".model_close").on("click", function (e) {
        jQuery("#contriesPicker").modal("toggle");
    });

    if ($("#switch-tax-included").is(':checked')) {
        $('.inner1').css('border', '1px solid lightgrey');
        $('.inner2').css('border', '1px solid #000');
        $('.tax-warning').hide();
        $('#switch-tax-not-included').prop("checked", false);

    }

    jQuery("#add-tax-rate").validate({
        errorPlacement: function (error, element) {
            if (element.attr("type") == "checkbox") {
                element.parent().append(error);
            } else {
                element.parent().append(error);
            }
        },
        submitHandler: function (form) {
            jQuery("form#add-tax-rate :submit").attr("disabled", true);
            jQuery.ajax({
                type: "POST",
                cache: false,
                dataType: "json",
                contentType: false,
                processData: false,
                data: new FormData(form),
                url: `${ajax_url}/taxes/new`,
                mimeType: "multipart/form-data",
                success: function (response) {
                    if (response?.status) {
                        jQuery.notify({ message: response.message }, { type: "success" });
                        setTimeout(function () {
                            window.location.href = response?.redirect_url;
                        }, 1500);
                    } else {
                        jQuery.notify({ message: response.message }, { type: "danger" });
                        jQuery("form#add-tax-rate :submit").attr("disabled", false);
                    }
                },
            });
        },
    });

    jQuery("#tax-preference").validate({
        errorPlacement: function (error, element) {
            if (element.attr("type") == "checkbox") {
                element.parent().append(error);
            } else {
                element.parent().append(error);
            }
        },
        submitHandler: function (form) {
            jQuery("form#tax-preference :submit").attr("disabled", true);
            jQuery.ajax({
                type: "POST",
                cache: false,
                dataType: "json",
                contentType: false,
                processData: false,
                data: new FormData(form),
                url: `${ajax_url}/taxes/tax-preference`,
                mimeType: "multipart/form-data",
                success: function (response) {
                    if (response?.status) {
                        jQuery.notify({ message: response.message }, { type: "success" });
                        setTimeout(function () {
                            window.location.href = response?.redirect_url;
                        }, 1500);
                    } else {
                        jQuery.notify({ message: response.message }, { type: "danger" });
                        jQuery("form#tax-preference :submit").attr("disabled", false);
                    }
                },
            });
        },
    });

    jQuery("#edit-tax-rate").validate({
        errorPlacement: function (error, element) {
            if (element.attr("type") == "checkbox") {
                element.parent().append(error);
            } else {
                element.parent().append(error);
            }
        },
        submitHandler: function (form) {
            jQuery("form#edit-tax-rate :submit").attr("disabled", true);
            jQuery.ajax({
                type: "POST",
                cache: false,
                dataType: "json",
                contentType: false,
                processData: false,
                data: new FormData(form),
                url: `${ajax_url}/taxes/edit-tax-rate`,
                mimeType: "multipart/form-data",
                success: function (response) {
                    if (response?.status) {
                        jQuery.notify({ message: response.message }, { type: "success" });
                        setTimeout(function () {
                            window.location.href = response?.redirect_url;
                        }, 1500);
                    } else {
                        jQuery.notify({ message: response.message }, { type: "danger" });
                        jQuery("form#edit-tax-rate :submit").attr("disabled", false);
                    }
                },
            });
        },
    });

    function deleteTaxRate(tax_rate_id, store_id) {
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
                            tax_rate_id: tax_rate_id,
                        }),
                        url: `${ajax_url}/taxes/delete-tax-rate`,
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
                }
            }
        });
    }

    jQuery(document).on("click", ".delete_tax_rate_data", function () {
        let tax_rate_id = this.id;
        let store_id = jQuery(this).attr("store_id");
        deleteTaxRate(tax_rate_id, store_id)
    })

    jQuery(".delete_tax_rate").click(function () {
        let tax_rate_id = this.id;
        let store_id = jQuery(this).attr("store_id");
        deleteTaxRate(tax_rate_id, store_id)
    });
});


function load_recovery_emails() {
    jQuery("#tax_rate_table").DataTable({
        cache: false,
        destroy: true,
        searching: false,
        responsive: true,
        processing: true,
        serverSide: true,
        ajax: {
            type: "POST",
            dataType: "json",
            url: `${ajax_url}/taxes_listing`,
            data: function (d) {
                d.store_id = store_id;
            },
        },
        columns: [
            { orderable: false, data: "tax_rate_name" },
            { orderable: false, data: "tax_rate_percentage" },
            { orderable: false, data: "country_codes" },
            { orderable: false, data: "action" },
        ],
        fnDrawCallback: function () {
            iTotalRecords = this.api().page.info().recordsTotal;
            if (!iTotalRecords) {
                jQuery(".tax_rate_listing").hide();
                jQuery(".tax_rate_banner").show();
            } else {
                jQuery(".tax_rate_listing").show();
                jQuery(".tax_rate_banner").hide();
            }
        }
    });
}