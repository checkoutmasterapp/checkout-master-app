var upsell_product_purchase = [];
var upsell_trigger_offer_index = 0;

jQuery(document).ready(function () {
    jQuery("#upsell_section_0").show();

    jQuery(document).on("click", ".purchase_quantity_plus", function (event) {
        let purchase_quantity_input = jQuery(`#purchase_quantity_${upsell_trigger_offer_index}`);
        let purchase_quantity_val = purchase_quantity_input.val();

        purchase_quantity_val = parseInt(purchase_quantity_val) + 1;

        purchase_quantity_input.val(purchase_quantity_val);

        // Update product price
        let upsell_trigger_offer = upsell_trigger_offers[upsell_trigger_offer_index];

        let product_price = jQuery(`#product_price_${upsell_trigger_offer_index}`).val();
        product_price = parseFloat(product_price) * parseFloat(purchase_quantity_val);

        let compare_at_price = jQuery(`#compare_at_price_${upsell_trigger_offer_index}`).val();
        compare_at_price = parseFloat(compare_at_price) * parseFloat(purchase_quantity_val);

        jQuery(`#upsell_product_price_${upsell_trigger_offer_index}`).html(`$ ${product_price.toFixed(2)}`);
        jQuery(`#upsell_compare_at_price_${upsell_trigger_offer_index}`).html(`$ ${compare_at_price.toFixed(2)}`)


        // Update Upsell Trigger offer Array
        // upsell_trigger_offer.product_price = product_price;
        // upsell_trigger_offer.compare_at_price = compare_at_price;
        upsell_trigger_offer.purchase_quantity = purchase_quantity_val;

        upsell_trigger_offers[upsell_trigger_offer_index] = upsell_trigger_offer;

    });

    jQuery(document).on("click", ".purchase_quantity_minius", function (event) {
        let purchase_quantity_input = jQuery(`#purchase_quantity_${upsell_trigger_offer_index}`);
        let purchase_quantity_val = purchase_quantity_input.val();

        if (purchase_quantity_val > 1) {
            purchase_quantity_val = parseInt(purchase_quantity_val) - 1;
        } else {
            purchase_quantity_val = 1;
            jQuery.notify({ message: "Quantity can not be less then 1" }, { type: "danger" });
        }

        purchase_quantity_input.val(purchase_quantity_val);

        // Update product price
        let upsell_trigger_offer = upsell_trigger_offers[upsell_trigger_offer_index];

        let product_price = jQuery(`#product_price_${upsell_trigger_offer_index}`).val();
        product_price = parseFloat(product_price) * parseFloat(purchase_quantity_val);

        let compare_at_price = jQuery(`#compare_at_price_${upsell_trigger_offer_index}`).val();
        compare_at_price = parseFloat(compare_at_price) * parseFloat(purchase_quantity_val);

        jQuery(`#upsell_product_price_${upsell_trigger_offer_index}`).html(`$ ${product_price.toFixed(2)}`);
        jQuery(`#upsell_compare_at_price_${upsell_trigger_offer_index}`).html(`$ ${compare_at_price.toFixed(2)}`)

        // Update Upsell Trigger offer Array
        // upsell_trigger_offer.product_price = product_price;
        // upsell_trigger_offer.compare_at_price = compare_at_price;
        upsell_trigger_offer.purchase_quantity = purchase_quantity_val;

        upsell_trigger_offers[upsell_trigger_offer_index] = upsell_trigger_offer;
    });



    jQuery(document).on("change", ".upsell_product_variant", function (event) {
        let jquery_this = jQuery(`#upsell_product_variant_${upsell_trigger_offer_index}`).find('option:selected');

        let product_variant_index = jquery_this.attr("product_variant_index");

        let upsell_trigger_offer = upsell_trigger_offers[upsell_trigger_offer_index];

        upsell_trigger_offers[upsell_trigger_offer_index].product_variant = upsell_trigger_offer?.product_variants[product_variant_index];
    });

    jQuery(document).on("click", ".purchase_upsell", function () {
        let product_price = jQuery(`#upsell_product_price_${upsell_trigger_offer_index}`).val();
        let upsell_product_quantity = jQuery(`#upsell_product_quantity_${upsell_trigger_offer_index}`).val();

        let upsell_product = upsell_trigger_offers[upsell_trigger_offer_index];
        upsell_product_purchase.push(upsell_product);

        load_process_upsell();
    });

    jQuery(document).on("click", ".no_thank_upsell", function () {
        load_process_upsell();
    });

});

function load_process_upsell() {

    if (upsell_trigger_offer_index == 0) {
        if (upsell_trigger_offers.length !== 1) {
            jQuery("#upsell_section_0").hide();
            jQuery(`#upsell_section_1`).show();

            upsell_trigger_offer_index = 1;
            return true;
        }
    }

    if (upsell_trigger_offer_index == 1) {
        if (upsell_trigger_offers.length !== 2) {
            jQuery("#upsell_section_1").hide();
            jQuery(`#upsell_section_2`).show();

            upsell_trigger_offer_index = 2;
            return true;
        }
    }

    window.location.href = `${ajax_url}/${store_id}/preview-thankyou/?upsell_id=${upsell_detail?.upsell_uuid}`
}