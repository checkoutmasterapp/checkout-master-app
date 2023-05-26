jQuery(document).ready(function () {

    /*****************************************
     ***** Buy Link Js
    *****************************************/
    jQuery(document).on("click", "#add_buylink", function () {
        jQuery("input[name='product_search']").val("");

        load_buylink_product();
        jQuery("#add_buylink_modal").modal("show");
    });

    jQuery(document).on("change paste keyup", "input[name='product_search']", function (target, event) {
        load_buylink_product();
    });

    jQuery(document).on("click", "#add_buy_link", function () {
        let selected_products = [];
        jQuery(".add_buylink_body input:checked").each(function (index, element) {
            if (!selected_products.includes(element.value)) {
                selected_products.push(element.value);
            }
        });

        if (selected_products?.length === 0) {
            jQuery.notify({ message: "Please select product" }, { type: "danger", z_index: 999999 });
            return false;
        }

        selected_products.forEach(function (selected_product) {
            const product_found = product_details.find((product_detail) => product_detail.id == selected_product);
            if (product_found) {
                buylink_products.push({
                    trigger_id: product_found?.id,
                    trigger_title: product_found?.title,
                    trigger_image: product_found?.image?.src,

                    trigger_varient_quantity: 1,
                    trigger_varient_id: product_found?.variants[0]?.id,
                    trigger_varient_title: product_found?.variants[0]?.title,
                    // trigger_variants: product_found?.variants
                });
            }
        });

        load_buylink_product_section();

        jQuery("#add_buylink_modal").modal("hide");
        jQuery('.checkbox_product').prop('checked', false);
    });

    jQuery('#add_buylink_modal_close').click(function () {
        jQuery('#add_buylink_modal').modal('toggle');
        jQuery('.checkbox_product').prop('checked', false);
    });

    jQuery(document).on("click", ".copy_buylink_url", function () {
        let jquery_this = jQuery(this);
        let copy_content = jquery_this.parent().find("input").val();

        if (copy_content) {
            var temp = jQuery("<input>");
            jQuery("body").append(temp);
            temp.val(copy_content).select();

            document.execCommand("copy");
            temp.remove();

            jQuery.notify({ message: "Copied" }, { type: "success" });
        }
    });

    /*****************************************
     ***** Update Buy Link Product Js
    *****************************************/
    jQuery(document).on("click", ".update_buylink_variant", function () {
        let product_id = jQuery(this).attr("product_id");
        let buylink_product_index = jQuery(this).attr("buylink_product_index");

        let product_detail = product_details.find(function (product_detail) {
            return product_detail?.id == product_id
        });

        let buylink_product = buylink_products[buylink_product_index];
        let select_varient_id = buylink_product?.trigger_varient_id;

        let buylink_variant_html = "";
        let product_variants = product_detail?.variants;
        for (let product_variant of product_variants) {

            let is_checked = (product_variant?.id === select_varient_id) ? "checked" : "";
            buylink_variant_html += `
                <label class="w-100 cursor-pointer picker-item radio-item">
                    <div class="flex items-center p-2 space-x-5">
                        <input
                            type="radio"
                            class="buylink_product_variant_id"
                            name="buylink_product_variant_id[]" value="${product_variant.id}" ${is_checked}
                        />
                        <span class="text-xs product_title">${product_variant.title}</span>
                    </div>
                </label>
            `;
        }

        jQuery("#buylink_variant_modal .modal-body").html(buylink_variant_html);
        jQuery("#buylink_variant_modal input[name='product_id']").val(product_id);
        jQuery("#buylink_variant_modal input[name='buylink_product_index']").val(buylink_product_index);

        jQuery("#buylink_variant_modal").modal("show");
    });

    jQuery(document).on("click", "#buylink_variant_update", function () {
        let product_id = jQuery("#buylink_variant_modal input[name='product_id']").val();
        let buylink_product_index = jQuery("#buylink_variant_modal input[name='buylink_product_index']").val();
        let buylink_product_variant_id = jQuery("input[class='buylink_product_variant_id']:checked").val();

        let product_detail = product_details.find(function (product_detail) {
            return product_detail?.id == product_id
        });

        let choice_variant = product_detail?.variants.find((variant) => {
            return variant?.id == buylink_product_variant_id
        });

        let buylink_product = buylink_products[buylink_product_index];

        buylink_product.trigger_varient_id = choice_variant?.id;
        buylink_product.trigger_varient_title = choice_variant?.title;

        buylink_products[buylink_product_index] = buylink_product;

        load_buylink_product_section();
        jQuery("#buylink_variant_modal").modal("hide");
    });

    jQuery(document).on("click", "#buylink_variant_close", function () {
        jQuery("#buylink_variant_modal").modal("hide");
    });

    /*****************************************
     ***** Update Buy Link Product Quantity Js
    *****************************************/
    jQuery(document).on("change paste keyup", "input[name='buylink_quantity_input']", function (event) {

        let buylink_product_index = jQuery(this).attr("buylink_product_index");
        let trigger_varient_quantity = jQuery(this).val();

        trigger_varient_quantity = parseInt(trigger_varient_quantity);

        if (trigger_varient_quantity > 0) {
            trigger_varient_quantity = parseInt(trigger_varient_quantity);
        } else {
            trigger_varient_quantity = 1;
        }

        let buylink_product = buylink_products[buylink_product_index];
        buylink_product.trigger_varient_quantity = trigger_varient_quantity;
        buylink_products[buylink_product_index] = buylink_product;

        load_buylink_product_section();
    });

    /*****************************************
     ***** Delete Buy Link Product Js
    *****************************************/
    jQuery(document).on("click", ".delete_buylink_product", function () {
        let product_id = jQuery(this).attr("product_id");

        buylink_products = jQuery.grep(buylink_products, function (buylink_product) {
            return buylink_product?.trigger_id != product_id;
        });

        load_buylink_product_section();
    });

    /*****************************************
     ***** Apply discount code Js
    *****************************************/
    jQuery(document).on("click", "#buylink_apply_discount", function () {
        if (jQuery("#buylink_apply_discount").prop("checked") == true) {
            jQuery(".discount_code_section").show("slow");
        } else {
            jQuery(".discount_code_section").hide("slow");
        }
        genrate_buylink();
    });

    jQuery(document).on("change paste keyup", "input[name='discount_code']", function () {
        genrate_buylink()
    });

    /*****************************************
     ***** Create new buy link Js
    *****************************************/
    jQuery(document).on("click", "#create_buylink", function () {
        jQuery.ajax({
            type: "POST",
            dataType: "json",
            url: `${ajax_url}/buylink/create`,
            data: {
                store_id: store_id,
                buylink_products: JSON.stringify(buylink_products),
                buylink_url: jQuery("input[name='buylink_url']").val(),
                discount_code: jQuery("input[name='discount_code']").val(),
            },
            success: function (response) {
                if (response?.status) {
                    window.location.href = response?.redirect_url;
                    return true;
                } else {
                    jQuery.notify({ message: response?.message }, { type: "danger" });
                }
            },
            error: function (error) {
                jQuery.notify({ message: error.message }, { type: "danger" });
            },
        });
    });
});

function load_buylink_product() {

    let buylink_product_ids = jQuery('.buylink_products').map(function () {
        return jQuery(this).attr('product_id');
    }).get();

    let product_search = jQuery("input[name='product_search']").val();

    let product_display_count = 0;
    let buylink_product_html = "";
    product_details.forEach((product_detail, product_detail_key) => {

        if (buylink_product_ids.includes(product_detail?.id?.toString())) {
            return false;
        }

        if (product_search) {
            if (product_detail?.title.toLowerCase().indexOf(product_search.toLowerCase()) == -1) {
                return false;
            }
        }

        buylink_product_html += `
            <label class="w-100 cursor-pointer">
                <div class="flex items-center p-2 main-item space-x-5">
                    <input
                        type="checkbox"
                        class="checkbox_product"
                        value="${product_detail.id}"
                    />
                    <img
                        style="max-height: 100px;"
                        src="${product_detail.image ? product_detail.image.src : ''}"
                        class="object-contain ms-3 object-center w-12 h-12 border rounded-lg border-black-400"
                    />
                    <span class="text-xs product_title">${product_detail.title}</span>
                </div>
            </label>
        `;


        product_display_count++;
    });

    if (product_display_count === 0) {
        buylink_product_html = `<span class="text-center">No result found</span>`;
    }

    jQuery("#add_buylink_modal .modal-body").html(buylink_product_html);
}

function load_buylink_product_section() {
    let buylink_product_html = "";
    buylink_products.forEach((buylink_product, buylink_product_index) => {
        buylink_product_html += `
            <div
                id="buylink_product_${buylink_product.trigger_id}"
                class=" row items-center space-x-5 buylink-products buylink_products"
                data-trigger-type="product"
                product_id="${buylink_product.trigger_id}"
            >
                <div class="buylink-product-img d-flex col-lg-5 col-md-5 col-sm-12">    
                    <img
                        src="${buylink_product?.trigger_image}"
                        class="object-contain object-center w-12 h-12 border rounded-lg border-black-400"
                    />
                    <p id="trigger_title" value="${buylink_product?.trigger_title}">
                        ${buylink_product?.trigger_title}
                    </p>
                </div>
                <div class="col-lg-5 col-md-5 col-sm-9 main-carint-quanity d-flex">
                    <a
                        class="buylink-variant update_buylink_variant me-3"
                        product_id="${buylink_product.trigger_id}"
                        buylink_product_index="${buylink_product_index}"
                    >
                        <span>${buylink_product?.trigger_varient_title}</span>
                        <i class="bi bi-chevron-right"></i>
                    </a>
                    <div class="buylink-quantity">
                        <input
                            type="number"
                            step="1" min="1"
                            class="form-control required"
                            name="buylink_quantity_input"
                            buylink_product_index="${buylink_product_index}"
                            value="${buylink_product.trigger_varient_quantity}"
                        />
                        <label>Quantity:</label>
                    </div>
                </div>
            
                <div class="delete_one col-md-2 col-lg-2 col-sm-3">
                    <i class="bi bi-trash delete_buylink_product" product_id="${buylink_product?.trigger_id}"></i>
                </div>
            </div>
        `;
    });
    jQuery(".buylink_product_section").html(buylink_product_html);

    genrate_buylink();
}

function genrate_buylink() {

    let buylink_url_products = [];

    if (buylink_products.length > 0) {
        buylink_products.forEach((buylink_product, buylink_product_index) => {
            buylink_url_products.push(`${buylink_product?.trigger_id}_${buylink_product?.trigger_varient_id}_${buylink_product?.trigger_varient_quantity}`)
        });

        let buylink_url = `${ajax_url}/${store_id}/buylink-checkout/${buylink_url_products.join('~')}`;

        if (jQuery("#buylink_apply_discount").prop("checked") == true) {
            let discount_code = jQuery("input[name='discount_code']").val();
            buylink_url = `${buylink_url}/?discount=${discount_code}`
        }

        jQuery("#buylink_url").val(buylink_url);
        jQuery("#create_buylink").prop("disabled", false);

        jQuery(".link_updated").show();
        setTimeout(function () { jQuery(".link_updated").hide(); }, 3000);

    } else {
        jQuery("#create_buylink").prop("disabled", true);
    }
}