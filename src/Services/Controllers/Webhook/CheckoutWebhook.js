"use strict";

const { CheckoutPaymentWebhook } = require("../../../libs/CheckoutPaymentHelper");

module.exports.checkout_webhook = async (req, res) => {
    console.log("##################### checkout_webhook #####################");

    let request_body = req.body;
    console.log("checkout_webhook request_body----------", request_body);

    try {
        switch (request_body.type) {
            case "payment_captured":

                let shopify_response = await CheckoutPaymentWebhook({ payment_id: request_body?.data?.id });
                if (shopify_response?.status) {
                    let temp_checkout = shopify_response?.temp_checkout;

                    //////////////////////////////////// Socket Initialize
                    let socketio = req.app.get('socketio');
                    socketio.emit("checkout_webhook_payment", {
                        success: true,
                        data: shopify_response?.data,
                        store_id: temp_checkout?.store_id,
                        checkout_id: temp_checkout?.checkout_id,
                    });
                }
                break;
            default:
                break;
        }

        return res.send({ success: true, message: "checkout webhook successfully" });
    } catch (error) {
        console.error("checkout_webhook error ---------", error);
        res.send({
            success: false,
            message: error?.message ? error.message : "Something went wrong. Please try again.",
        });
    }
};