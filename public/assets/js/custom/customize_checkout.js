jQuery(document).ready(function () {

    jQuery(document).on("click", "#add_section", function () {
        let section_count = jQuery(this).attr("section_count");
        section_count = parseInt(section_count) + 1;

        let section_html = `
            <div class="accordion-item" id="about_section_${section_count}">
                <h2 class="accordion-header" id="heading_${section_count}">
                    <button class="accordion-button collapsed" type="button" myattr="${section_count}">
                        <img class="img img-thumbnail" src="/assets/img/avatar.png" style="max-width: 50px; margin-right: 5px;" />
                        New About section #${section_count}
                    </button>
                </h2>
                <div id="collapse_${section_count}" class="accordion-collapse collapse show" aria-labelledby="heading_${section_count}" data-bs-parent="#section_accordion" style="display: block;">
                    <div class="accordion-body row">
                        <div class="col-md-12 scrpit">
                            <label class="form-label">
                                Section title
                            </label>
                        </div>
                        <div class="col-md-12">
                            <input class="form-control required" name="section_title[${section_count}]" placeholder="Section Title" />
                        </div>
                        <div class="col-md-12">
                            <br />
                            <div class="col-12">
                                <label class="form-label">Section Icon</label>
                                <p class="pera-label-d">Section Icon URL must be in http://.png format</p>
                            </div>
                            <input type="url" class="form-control required" name="section_icon[${section_count}]" placeholder="Section Icon(image url)" />
                        </div>
                        <div class="col-md-12">
                            <br />
                            <div class="col-md-12 scrpit">
                                <label class="form-label">
                                    Section description
                                </label>
                            </div>
                            <textarea class="form-control required" name="section_description[${section_count}]" rows="5" placeholder="Section Text"></textarea>
                        </div>
                        <div class="deldt-btn delete_section" selection_type="new" about_section_id="${section_count}">
                            <i class="bi bi-trash accordion-trash"></i>
                            <span>Delete Section</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        jQuery(".checkout_sections").append(section_html);
        jQuery(this).attr("section_count", section_count);
    });

    jQuery(document).on("click", ".delete_section", function () {
        let jQuery_this = jQuery(this);
        let about_section_id = jQuery_this.attr("about_section_id");
        let selection_type = jQuery_this.attr("selection_type");

        if (selection_type == "new") {
            jQuery(`#about_section_${about_section_id}`).remove();
        } else {
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
                            cache: false,
                            dataType: "json",
                            url: `${ajax_url}/checkout-delete-section`,
                            data: { about_section_id: about_section_id },
                            success: function (response) {
                                if (response?.status) {
                                    jQuery(`#about_section_${about_section_id}`).remove();
                                    jQuery.notify({ message: response.message }, { type: "success" });
                                    // setTimeout(function () { window.location.reload(); }, 1500);
                                } else {
                                    jQuery.notify({ message: response.message }, { type: "danger" });
                                }
                            },
                        });
                    }
                }
            });
        }
    });

    var buttonclicked = false;
    jQuery("#preview-checkout").click(function () {
        if (!buttonclicked) {
            buttonclicked = true;
        }
    });

    jQuery("#customize_checkout_form").validate({
        errorPlacement: function (error, element) {
            if (element.attr("type") == "checkbox") {
                element.parent().append(error);
            } else {
                element.parent().append(error);
            }
        },
        submitHandler: function (form) {
            jQuery("form#customize_checkout_form :submit").attr("disabled", true);
            jQuery.ajax({
                type: "POST",
                cache: false,
                dataType: "json",
                contentType: false,
                processData: false,
                data: new FormData(form),
                url: `${ajax_url}/customize-checkout`,
                mimeType: "multipart/form-data",
                success: function (response) {
                    jQuery("form#customize_checkout_form :submit").attr("disabled", false);
                    if (response?.status) {
                        jQuery.notify({ message: response.message }, { type: "success" });
                        setTimeout(function () {
                            if (buttonclicked == true) {
                                window.location.href = `${ajax_url}/${response.store_id}/preview-checkout`;
                            } else {
                                window.location.href = response?.redirect_url;
                            }
                        }, 1500);
                    } else {
                        jQuery.notify({ message: response.message }, { type: "danger" });
                    }
                },
            });
        },
    });

    jQuery("#font_size").keyup(function () {
        if (jQuery("#font_size").val() < 11 || jQuery("#font_size").val() > 30) {
            jQuery("#errorMsg").show();
        } else {
            jQuery("#errorMsg").hide();
        }
    });

    jQuery("body").delegate(".accordion-button", "click", function () {
        let indexvalue = jQuery(this).attr("myattr");
        let accId = "#collapse_" + indexvalue;
        if (jQuery(accId).attr("style") == "display: block;") {
            jQuery(this).removeClass("collapsed");
        } else {
            jQuery(this).addClass("collapsed");
        }
        jQuery(accId).toggle("slow");
    });
});
