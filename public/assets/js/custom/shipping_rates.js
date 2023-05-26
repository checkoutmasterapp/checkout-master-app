jQuery(document).ready(function () {

    //////////////////////////////////// Listing Page js Start
    load_shipping_rate_table();
    jQuery(document).on("click", ".shipping_rate_delete", function () {
        let shipping_rate_id = jQuery(this).attr("shipping_rate_id");

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
                        cache: false,
                        url: `${ajax_url}/delete-shipping-rate`,
                        data: {
                            store_id: store_id,
                            shipping_rate_id: shipping_rate_id,
                        },
                        success: function (response) {
                            console.log("shipping_rate_delete response---------", response);
                            jQuery.notify({ message: response.message }, { type: "success" });
                            load_shipping_rate_table();
                        },
                    });
                }
            }
        });
    });

    //////////////////////////////////// Listing Page js End

    let country_codes = [];
    /*** Africa Countries ***/
    jQuery(document).on("click", "#region-checkbox-Africa", function () {
        jQuery(".region-Africa").prop("checked", jQuery(this).prop("checked"));
    });

    jQuery("input:checkbox:checked.region-Africa").on("change", function () {
        let isChecked = $(this).is(":checked");
        if (isChecked == false) {
            if ($("#region-checkbox-Africa").is(":checked") == true) {
                $("#region-checkbox-Africa").prop("checked", false);
            }
        } else {
            jQuery("input:checkbox:checked.region-Africa").each(function (count) {
                if (count == 58) {
                    $("#region-checkbox-Africa").prop("checked", true);
                }
            });
        }
    });

    jQuery("input:checkbox:checked.region-Africa").each(function (count) {
        if (count == 58) {
            $("#region-checkbox-Africa").prop("checked", true);
        }
    });

    /*** Americas Countries ***/
    jQuery(document).on("click", "#region-checkbox-Americas", function () {
        jQuery(".region-Americas").prop("checked", jQuery(this).prop("checked"));
    });

    jQuery("input:checkbox:checked.region-Americas").on("change", function () {
        let isChecked = $(this).is(":checked");
        if (isChecked == false) {
            if ($("#region-checkbox-Americas").is(":checked") == true) {
                $("#region-checkbox-Americas").prop("checked", false);
            }
        } else {
            jQuery("input:checkbox:checked.region-Americas").each(function (count) {
                if (count == 56) {
                    $("#region-checkbox-Americas").prop("checked", true);
                }
            });
        }
    });

    jQuery("input:checkbox:checked.region-Americas").each(function (count) {
        if (count == 56) {
            $("#region-checkbox-Americas").prop("checked", true);
        }
    });

    /*** Asia Countries ***/
    jQuery(document).on("click", "#region-checkbox-Asia", function () {
        jQuery(".region-Asia").prop("checked", jQuery(this).prop("checked"));
    });

    jQuery("input:checkbox:checked.region-Asia").on("change", function () {
        let isChecked = $(this).is(":checked");
        if (isChecked == false) {
            if ($("#region-checkbox-Asia").is(":checked") == true) {
                $("#region-checkbox-Asia").prop("checked", false);
            }
        } else {
            jQuery("input:checkbox:checked.region-Asia").each(function (count) {
                if (count == 48) {
                    $("#region-checkbox-Asia").prop("checked", true);
                }
            });
        }
    });

    jQuery("input:checkbox:checked.region-Asia").each(function (count) {
        if (count == 48) {
            $("#region-checkbox-Asia").prop("checked", true);
        }
    });

    /*** Europe Countries ***/
    jQuery(document).on("click", "#region-checkbox-Europe", function () {
        jQuery(".region-Europe").prop("checked", jQuery(this).prop("checked"));
    });

    jQuery("input:checkbox:checked.region-Europe").on("change", function () {
        let isChecked = $(this).is(":checked");
        if (isChecked == false) {
            if ($("#region-checkbox-Europe").is(":checked") == true) {
                $("#region-checkbox-Europe").prop("checked", false);
            }
        } else {
            jQuery("input:checkbox:checked.region-Europe").each(function (count) {
                if (count == 50) {
                    $("#region-checkbox-Europe").prop("checked", true);
                }
            });
        }
    });

    jQuery("input:checkbox:checked.region-Europe").each(function (count) {
        if (count == 50) {
            $("#region-checkbox-Europe").prop("checked", true);
        }
    });

    /*** Oceania Countries ***/
    jQuery(document).on("click", "#region-checkbox-Oceania", function () {
        jQuery(".region-Oceania").prop("checked", jQuery(this).prop("checked"));
    });

    jQuery("input:checkbox:checked.region-Oceania").on("change", function () {
        let isChecked = $(this).is(":checked");
        if (isChecked == false) {
            if ($("#region-checkbox-Oceania").is(":checked") == true) {
                $("#region-checkbox-Oceania").prop("checked", false);
            }
        } else {
            jQuery("input:checkbox:checked.region-Oceania").each(function (count) {
                if (count == 26) {
                    $("#region-checkbox-Oceania").prop("checked", true);
                }
            });
        }
    });

    jQuery("input:checkbox:checked.region-Oceania").each(function (count) {
        if (count == 26) {
            $("#region-checkbox-Oceania").prop("checked", true);
        }
    });

    $('[name=shipping_rate_min_amount]').change(function () {
        if ($(this).val() != "") {
            $('[name=shipping_rate_max_amount]').attr("min", $(this).val());
        } else {
            $('[name=shipping_rate_max_amount]').removeAttr("min");
        }
    });

    $('[name=shipping_rate_max_amount]').change(function () {
        if ($(this).val() != "") {
            $('[name=shipping_rate_min_amount]').attr("max", $(this).val());
        } else {
            $('[name=shipping_rate_min_amount]').removeAttr("max");
        }
    });

    $('[name=shipping_rate_min_weight]').change(function () {
        if ($(this).val() != "") {
            $('[name=shipping_rate_max_weight]').attr("min", $(this).val());
        } else {
            $('[name=shipping_rate_max_weight]').removeAttr("min");
        }
    });

    $('[name=shipping_rate_max_weight]').change(function () {
        if ($(this).val() != "") {
            $('[name=shipping_rate_min_weight]').attr("max", $(this).val());
        } else {
            $('[name=shipping_rate_min_weight]').removeAttr("max");
        }
    });

    jQuery(document).on("click", "#update_btn", function () {
        country_codes = [];
        jQuery("#countries").html("");
        jQuery("#item-flags").html("");
        jQuery("#validate-error").css("display", "none");

        jQuery("input:checkbox:checked.custom-control-input").each(function () {
            let id = jQuery(this).attr("id");
            let text = jQuery('label[for="' + id + '"]').next().html();
            let code = jQuery(this).val();
            if (code != "on") {
                country_codes.push({
                    country_code: code,
                    country_name: text,
                });
            }
        });
        console.log("country_codes", country_codes)
        if (country_codes.length > 0) {
            var html = '';
            let countries_count;
            for (let index = 0; index < country_codes.length; index++) {
                const country_details = country_codes[index];
                if (index < 3) {
                    html += '<span class="flags-icons fi fi-' + country_details.country_code.toLowerCase() + '" ></span>' + country_details.country_name;
                }
            }
            console.log("html", html)
            if (country_codes.length == 243) {
                countries_count = country_codes.length - 3;
                let count = "All Countries Selected";
                jQuery("#countries").append(count);
            }
            else if (country_codes.length >= 3) {
                countries_count = country_codes.length - 3;
                let count = " +" + countries_count + " others";
                jQuery("#countries").html(html + count);
                // jQuery("#countries").append(count);
            }
            jQuery("#contriesPicker").modal("toggle");
            jQuery("#validate-error").css("display", "none");
        } else {
            jQuery("#validate-error").css("display", "block");
        }
    });

    jQuery(".model_close").on("click", function (e) {
        jQuery("#contriesPicker").modal("toggle");
    });

    jQuery("#add_shipping_rates").validate({
        errorPlacement: function (error, element) {
            if (element.parent().hasClass("input-group")) {
                element.parent().parent().append(error);
            } else if (element.attr("type") == "checkbox") {
                element.parent().append(error);
            } else {
                element.parent().append(error);
            }
        },
        submitHandler: function (form) {
            jQuery("form#add_shipping_rates :submit").attr("disabled", true);
            jQuery.ajax({
                type: "POST",
                cache: false,
                dataType: "json",
                contentType: false,
                processData: false,
                data: new FormData(form),
                url: `${ajax_url}/add-shipping-rate`,
                mimeType: "multipart/form-data",
                success: function (response) {
                    if (response?.status) {
                        jQuery.notify({ message: response.message }, { type: "success" });
                        setTimeout(function () {
                            window.location.href = response?.redirect_url;
                        }, 1500);
                    } else {
                        jQuery.notify({ message: response.message }, { type: "danger" });
                        jQuery("form#add_shipping_rates :submit").attr("disabled", false);
                    }
                },
            });
        },
    });

    jQuery(document).on("click", ".table-row", function () {
        let id = jQuery(this).attr("id");
        let store_id = jQuery(this).attr("store_id");
        window.location.href = `${ajax_url}/${store_id}/edit-shipping-rate/${id}`;
    });

    jQuery("#edit_shipping_rates").validate({
        errorPlacement: function (error, element) {
            if (element.parent().hasClass("input-group")) {
                element.parent().parent().append(error);
            } else if (element.attr("type") == "checkbox") {
                element.parent().append(error);
            } else {
                element.parent().append(error);
            }
        },
        submitHandler: function (form) {
            jQuery("form#edit_shipping_rates :submit").attr("disabled", true);
            jQuery.ajax({
                type: "POST",
                cache: false,
                dataType: "json",
                contentType: false,
                processData: false,
                data: new FormData(form),
                url: `${ajax_url}/edit-shipping-rate`,
                mimeType: "multipart/form-data",
                success: function (response) {
                    if (response?.status) {
                        jQuery.notify({ message: response.message }, { type: "success" });
                        setTimeout(function () {
                            window.location.href = response?.redirect_url;
                        }, 1500);
                    } else {
                        jQuery.notify({ message: response.message }, { type: "danger" });
                        jQuery("form#edit_shipping_rates :submit").attr("disabled", false);
                    }
                },
            });
        },
    });

    jQuery(".delete_shipping_rate").click(function () {
        let shipping_rate_id = this.id;
        let store_id = jQuery(this).attr("store_id");

        let is_last = $(this).attr("is_last");
        let is_published = $(this).attr("is_published");

        let message = "Once deleted, you will not be able to recover this shipping rate again!";
        if (is_last === "true" && is_published === "true") {
            message = "Once deleted last shipping rate, your current store will unpublished automatically!";
        }

        bootbox.confirm({
            title: "Alert",
            message: "Are you sure you want to delete?",
            buttons: {
                confirm: {
                    label: "delete",
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
                        cache: false,
                        url: `${ajax_url}/delete-shipping-rate`,
                        data: {
                            store_id: store_id,
                            shipping_rate_id: shipping_rate_id,
                        },
                        success: function (response) {
                            jQuery.notify({ message: response.message }, { type: "success" });
                            setTimeout(function () { window.location.href = response?.redirect_url; }, 1500);
                        },
                    });
                }
            }
        });


    });
});

function load_shipping_rate_table() {
    jQuery("#shipping_rate_table").DataTable({
        responsive: true,
        cache: false,
        destroy: true,
        searching: false,
        processing: true,
        serverSide: true,
        ajax: {
            type: "POST",
            dataType: "json",
            url: `${ajax_url}/shipping-rates`,
            data: function (d) {
                d.store_id = store_id;
            },
        },
        columns: [
            { orderable: false, data: "shipping_rate_name" },
            { orderable: false, data: "shipping_rate_price" },
            { orderable: false, data: "price_range" },
            { orderable: false, data: "weight_range" },
            { orderable: false, data: "shipping_countrys" },
            { orderable: false, data: "action" },
        ],
        fnDrawCallback: function () {
            iTotalRecords = this.api().page.info().recordsTotal;
            if (!iTotalRecords) {
                jQuery(".shipping_rate_listing").hide();
                jQuery(".shipping_rate_banner").show();
            } else {
                jQuery(".shipping_rate_listing").show();
                jQuery(".shipping_rate_banner").hide();
            }
        }
    });
}