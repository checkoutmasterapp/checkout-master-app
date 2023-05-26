"use strict";

const models = require("../../models");

const { PayoutMasterPaymentWebhook } = require("../../../libs/PayoutPaymentHelper");

module.exports.payout_master_webhook = async (req, res) => {
    let request_query = req.query;
    let request_body = req.body;
    console.log("######################################################")
    console.log("payout_master_webhook req.method---------", req.method)
    console.log("payout_master_webhook request_query ---------", request_query);
    console.log("payout_master_webhook request_body ---------", request_body);

    try {
        /*** Generate Stripe logs in the database ***/
        await models.StripeWebhookLogs.create({
            webhook_type: "payout_master",
            webhook_event: request_body,
        });

        if (request_body?.data) {
            let payoutmaster_response = request_body?.data;
            let shopify_response = await PayoutMasterPaymentWebhook({ payment_id: payoutmaster_response?.id });
            if (shopify_response?.status) {
                console.log("checkout_webhook shopify_response ---------", shopify_response);

                let temp_checkout = shopify_response?.temp_checkout;

                //////////////////////////////////// Socket Initialize
                let socketio = req.app.get('socketio');
                socketio.emit("payoutmaster_webhook_payment", {
                    success: true,
                    data: shopify_response?.data,
                    store_id: temp_checkout?.store_id,
                    checkout_id: temp_checkout?.checkout_id,
                });
            }
        }

        return res.json({
            status: true,
            message: "Payout-master webhook successfully",
        });
    } catch (error) {
        console.log("payout_master_webhook error ---------", error);
        res.send({
            success: false,
            message: error?.message ? error.message : "Something went wrong. Please try again.",
        });
    }
};