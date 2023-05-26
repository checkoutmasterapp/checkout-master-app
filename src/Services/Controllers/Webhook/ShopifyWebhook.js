"use strict";

const models = require("../../models");

const { StripeShopifyRefund } = require("../../../libs/StripePaymentHelper");
const { CheckoutShopifyRefund } = require("../../../libs/CheckoutPaymentHelper");
const { RevolutShopifyRefund } = require("../../../libs/RevolutPaymentHelper");

module.exports.shopify_webhook = async (req, res) => {
    const { store_id } = req.params;
    let request_body = req.body;

    try {
        console.log("############################# Shopify webhooked started #############################");
        console.log("shopify_webhook store_id ---------", store_id);
        console.log("shopify_webhook request_body ---------", request_body);

        //////////////////////////////////// Order update Webhook Response
        if (request_body?.financial_status) {
            switch (request_body.financial_status) {
                case "paid":

                    let pending_order = await models.Orders.findOne({
                        where: {
                            shopify_order_id: request_body?.id?.toString()
                        }
                    });
                    if (pending_order) {
                        pending_order.order_type = request_body.financial_status;
                        pending_order.save();
                    }
                    break;
                case "refunded":
                case "partially_refunded":

                    let order_detail = await models.Orders.findOne({
                        where: {
                            shopify_order_id: request_body?.id?.toString()
                        }
                    });

                    if (order_detail && order_detail?.order_type !== "refunded") {

                        let webhook_response;
                        if (order_detail?.payment_method === "Stripe") {
                            webhook_response = await StripeShopifyRefund(request_body, order_detail);
                        }

                        if (order_detail?.payment_method === "Checkout.com") {
                            webhook_response = await CheckoutShopifyRefund(request_body, order_detail);
                        }

                        if (order_detail?.payment_method === "Revolut") {
                            webhook_response = await RevolutShopifyRefund(request_body, order_detail);
                        }

                    }

                    order_detail.order_type = request_body.financial_status;
                    order_detail.save();

                    break;
                default:
                    break;
            }
        }

        //////////////////////////////////// Cart Create/Update Webhook
        if (request_body?.id && request_body?.token && request_body?.line_items) {
            let line_items = request_body?.line_items;

            if (line_items.length > 0 && (!request_body?.customer || !request_body?.email)) {

                let current_user_subscription = await models.UserSubscriptions.findOne({
                    where: {
                        status: true,
                        is_expired: false,
                        store_id:store_id,
                    },
                });

                console.log("!current_user_subscription",!!current_user_subscription)
        
                if(!current_user_subscription){
                    return
                }
    

                //// Get Checkout Details If Exist OR NOT
                let checkout_detail = await models.Checkouts.findOne({
                    where: {
                        shop_id: store_id,
                        cart_token: request_body?.token,
                    },
                    order: [["id", "DESC"]],
                });

                if ((!checkout_detail) || (checkout_detail && checkout_detail?.is_purchase)) {
                    checkout_detail = await models.Checkouts.create({
                        shop_id: store_id,
                        cart_token: request_body?.token,
                    })
                }

                await models.Cart.destroy({
                    where: {
                        checkout_id: checkout_detail.id,
                    },
                });

                let price = 0;
                let cart_items = [];
                for (let line_item of line_items) {
                    price += parseFloat(line_item.price);     
                    cart_items.push({
                        store_id: checkout_detail?.shop_id,
                        cart_token: request_body?.token,
                        checkout_id: checkout_detail?.id,

                        product_id: line_item.product_id,
                        variant_id: line_item.variant_id,
                        title: line_item.title,
                        variant_title: "",
                        description: "",

                        price: parseFloat(line_item.price).toFixed(2),
                        product_weight: line_item.grams,

                        quantity: line_item.quantity,
                    });
                }

                checkout_detail.price = price.toFixed(2);
                checkout_detail.cart_token = request_body?.token;
                checkout_detail.save();
                await models.Cart.bulkCreate(cart_items);
            } else {
                //// Get Checkout Details If Exist OR NOT
                let checkout_detail = await models.Checkouts.findOne({
                    order: [["created_at", "DESC"]],
                    where: {
                        shop_id: store_id,
                        cart_token: request_body?.token,
                    }
                });

                if (checkout_detail && !checkout_detail?.is_purchase) {
                    await models.Cart.destroy({
                        where: {
                            cart_token: request_body?.token,
                            checkout_id: checkout_detail.id,
                        }
                    });
                    
                    await models.AbandonedCheckouts.destroy({
                        where: {
                            cart_token: request_body?.token,
                            checkout_id: checkout_detail.id,
                        }
                    });
    
                    await models.Checkouts.destroy({
                        where: {
                            cart_token: request_body?.token,
                            id: checkout_detail.id,
                        }
                    });
                }
             
            }
        }

        return res.send({ success: true, message: "Shopify webhook successfully" });

    } catch (error) {
        console.error("shopify_webhook error ---------", error);
        return res.send({
            success: false,
            message: error?.message ? error.message : "Something went wrong. Please try again.",
        });
    }
};