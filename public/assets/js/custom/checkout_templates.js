jQuery(document).ready(function () {

    limit = jQuery("select[name='template_limit']").val();
    load_checkout_templates();
    jQuery(document).on("change", ".checkout_template_filter", function () {
        offset = 0;
        limit = jQuery("select[name='template_limit']").val();
        jQuery(".checkout_template_section_html").html("");
        load_checkout_templates();
    });

    jQuery(document).on("click", "#load_more_button", function () {
        load_checkout_templates();
    });

    jQuery(document).on("click", ".apply_template", function () {
        let template_id = jQuery(this).attr("template_id");
        let template_code = jQuery(this).attr("template_code");

        jQuery.ajax({
            type: "post",
            dataType: "json",
            url: `${ajax_url}/change-checkout-templates`,
            data: {
                store_id: store_id,
                template_id: template_id,
                template_code: template_code,
            },
            success: function (response) {
                console.log("apply_template response -------", response);
                if (response?.status) {
                    jQuery.notify({ message: response.message }, { type: "success" });
                    setTimeout(function () { window.location.href = response?.redirect_url; }, 1500);
                } else {
                    jQuery.notify({ message: response.message }, { type: "danger" });
                }
            },
            error: function (response) {
                jQuery.notify({ message: response.message }, { type: "danger" });
            },
        });
    });
});

function load_checkout_templates() {

    let record_show = parseFloat(offset) + 1;
    record_show = parseFloat(record_show) * parseFloat(limit);
    jQuery("#load_more_button").prop('disabled', true);

    jQuery.ajax({
        type: "post",
        dataType: "json",
        url: `${ajax_url}/checkout-templates`,
        data: {
            limit: limit,
            offset: offset * limit,
        },
        success: function (response) {

            let checkout_template_i = 1;
            let checkout_template_section_html = `<div class="row digit-row-uppar mt-5 mb-3">`;
            for (let checkout_template of response?.data) {
                if (checkout_template_i > 4) {
                    checkout_template_section_html += `</div><div class="row digit-row-uppar mt-5 mb-3">`;
                    checkout_template_i = 1;
                }

                let active_class = checkout_template?.template_code === customize_checkout?.template_code ? "selected-template" : ""
                checkout_template_section_html += `
                    <div
                    class="col-lg-3 checkout-template ${active_class}"
                    template_code="${checkout_template?.template_code}"
                    >
                        <div class="main-section-inner-image position-relative">
                            <div class="main-inner-templates">
                                <img class="lazy img-efect" src="/assets/img/checkout-template/${checkout_template?.template_code}.png" />
                                <div class="on-hover-in-image">
                                <button
                                    class="appply apply_template"
                                    template_id="${checkout_template?.id}"
                                    template_code="${checkout_template?.template_code}"
                                >Apply this template</button>
                            </div>
                            </div>
                        </div>
                        <div class="template-name">
                            ${checkout_template?.template_name}
                        </div>
                    </div>
                `;
                checkout_template_i++;
            }
            checkout_template_section_html += `</div>`;

            offset += 1;
            jQuery("#load_more_button").prop('disabled', false);
            jQuery(".checkout_template_section_html").append(checkout_template_section_html);
            if (record_show >= response?.recordsTotal) {
                jQuery(".load_more").css("visibility", "hidden");
            } else {
                jQuery(".load_more").css("visibility", "visible");
            }

        },
        error: function (response) {
            jQuery.notify({ message: response.message }, { type: "danger" });
        },
    });
}