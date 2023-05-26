jQuery(document).ready(function () {

    jQuery("#upsell_section_0").show();

    jQuery(document).on("click", ".purchase_upsell", function () {
        let store_id = jQuery('.store_id').val(),
            order_id = jQuery('.order_id').val(),
            checkout_id = jQuery('.checkout_id').val();

        let offer_index = jQuery(this).attr("upsell_trigger_offer_index");
        let product_id = jQuery(`#upsell_product_id_${offer_index}`).val();
        let product_price = jQuery(`#upsell_product_price_${offer_index}`).val();
        let upsell_product_quantity = jQuery(`#upsell_product_quantity_${offer_index}`).val();

        jQuery.ajax({
            type: "POST",
            dataType: "json",
            url: `${ajax_url}/purchase-upsells`,
            data: {
                store_id: store_id,
                order_id: order_id,
                checkout_id: checkout_id,

                product_id: product_id,
                product_price: product_price,
                upsell_product_quantity: upsell_product_quantity,
            },
            success: function (response) {
                console.log("purchase_upsell1 response -------------", response);
            }
        })
    });

    jQuery(document).on("click", ".no_thank_upsell", function () {
        let upsell_trigger_offer_index = jQuery(this).attr("upsell_trigger_offer_index");

        if (upsell_trigger_offer_index == 0) {
            if (upsell_trigger_offers.length !== 1) {
                jQuery("#upsell_section_0").hide();
                jQuery(`#upsell_section_1`).show();
                return true;
            }
        }

        if (upsell_trigger_offer_index == 1) {
            if (upsell_trigger_offers.length !== 2) {
                jQuery("#upsell_section_1").hide();
                jQuery(`#upsell_section_2`).show();
                return true;
            }
        }

        window.location.href = `${ajax_url}/${store_id}/checkout-thankyou/${order_id}`;
    });

});