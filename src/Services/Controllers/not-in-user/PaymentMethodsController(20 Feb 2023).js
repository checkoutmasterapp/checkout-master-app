const { CheckStripeKey } = require("../../libs/StripePaymentHelper");
const { CheckPayPalKey } = require("../../libs/PaypalPaymentHelper");
const { CheckCheckoutKey,CheckoutPaymentValidate } = require("../../libs/CheckoutPaymentHelper");

const paypal = require("paypal-rest-sdk");
const { PaymentMethods, Stores, CreditCards } = require("../models");

const array_column = (array, column) => {
    return array.map((item) => item[column]);
};

module.exports.payment_methods = async (req, res, next) => {
    const { store_id } = req.params;
    const { auth_user, auth_store } = req;

    let payment_methods = await PaymentMethods.findAll({
        where: {
            store_id: store_id,
        },
    }).then((response) => {
        return response;
    });

    res.render("backend/PaymentMethods/payment_methods", {
        store_id: store_id,
        auth_user: auth_user,
        auth_store: auth_store,
        payment_methods: payment_methods,
        active_menu: "payment-methods",
    });
};

module.exports.add_payment_method = async (req, res, next) => {
    const { store_id } = req.params;
    const { auth_user, auth_store } = req;

    let request_body = req.body;
    if (req.method === "POST") {
        try {
            request_body.user_id = auth_user?.id;
            request_body.created_by = auth_user?.id;

            if (request_body?.method_name === "Stripe" && !request_body?.card_accepted) {
                return res.json({
                    status: false,
                    message: "Please select credit card",
                });
            }

            if (request_body?.method_name === "PayPal" && !request_body?.payment_email) {
                return res.json({
                    status: false,
                    message: "Please enter paypal email",
                });
            }

            if (request_body?.method_name === "Payout Master" && !request_body?.access_token) {
                return res.json({
                    status: false,
                    message: "Please enter payout master token",
                });
            }

            if (request_body?.method_name === "Revolut" && !request_body?.revolut_public_id) {
                return res.json({
                    status: false,
                    message: "Please enter Revolut public ID",
                });
            }

            if (request_body?.method_name === "Checkout.com" && !request_body?.chk_publishable_key && !request_body?.chk_secret) {
                return res.json({
                    status: false,
                    message: "Please enter Checkout.com public ID & Secret Key",
                });
            }

            // Check Payment Method already exist ?
            if (
                await PaymentMethods.findOne({
                    where: {
                        store_id: request_body?.store_id,
                        method_name: request_body.method_name,
                    },
                })
            ) {
                return res.json({
                    status: false,
                    message: "Payment Method already exists!",
                });
            }

            // Check Stripe Key Valid or Not
            if (request_body.method_name === "Stripe") {
                // let stripe_response = await CheckStripeKey({
                    // user_id: auth_user?.id,
                    // secret: request_body?.secret,
                    // publishable_key: request_body?.publishable_key,
                // });
                // if (stripe_response == undefined) {
                    // return res.json({
                        // status: false,
                        // message: "Invalid Stripe Secret Key!",
                    // });
                // }
            } else {
                delete request_body.card_accepted;
            }

            // Check `Checkout.com` Key Valid or Not
            if (request_body.method_name === "Checkout.com") {
                request_body.publishable_key = request_body?.chk_publishable_key;
                request_body.secret = request_body?.chk_secret;
                // let checkout_validate = await CheckoutPaymentValidate(request_body);
                // if(!checkout_validate?.token){
                //     return res.json({
                //         status: false,
                //         message: "Invalid Keys!",
                //     });
                // }
                // request_body.id_token = request_body?.chk_id_token;
                // let checkout_response = await CheckCheckoutKey(request_body);
                // console.log("checkout_response", checkout_response)
                // if (checkout_response == undefined || checkout_response == null) {
                //     return res.json({
                //         status: false,
                //         message: "Invalid Keys!",
                //     });
                // }
            }

            // Create Payment method
            await PaymentMethods.create(request_body);

            // Update Store Table with Payment Method True
            await Stores.update(
                {
                    payment_method: true,
                },
                {
                    where: {
                        id: request_body?.store_id,
                    },
                }
            );

            return res.json({
                status: true,
                message: "Payment method added successfully",
                redirect_url: `${process.env.APP_URL}/${request_body?.store_id}/payment-methods`,
            });
        } catch (error) {
            console.error("add_payment_method error ------------", error);
            if (error == "Invalid Publish Key!" || error == `Invalid API Key provided:${request_body.secret}` || error == "Client Authentication failed") {
                return res.json({
                    status: false,
                    message: "Please check your Publish Key or Secret Key.",
                });
            }
            return res.json({
                status: false,
                message: "Something went wrong.Please check your details!",
            });
        }
    }

    let payment_details = await PaymentMethods.findAll({
        where: {
            store_id: store_id,
            user_id: auth_user.id,
        },
    }).then((response) => {
        return response;
    });
    let method_names = array_column(payment_details, "method_name");

    res.render("backend/PaymentMethods/add_payment_method", {
        store_id: store_id,
        auth_user: auth_user,
        auth_store: auth_store,
        method_names: method_names,
        payment_method: payment_details,
        active_menu: "payment-methods",
    });
};

//payment live transactions
module.exports.edit_payment_method = async (req, res, next) => {
    const { store_id, id } = req.params;
    const { auth_user, auth_store } = req;

    let request_body = req.body;
    if (req.method === "POST") {
        try {
            request_body.user_id = auth_user?.id;
            request_body.updated_by = auth_user?.id;

            if (request_body?.method_name === "Stripe" && !request_body?.card_accepted) {
                return res.json({
                    status: false,
                    message: "Please select credit card",
                });
            }

            if (request_body?.method_name === "PayPal" && !request_body?.payment_email) {
                return res.json({
                    status: false,
                    message: "Please enter paypal email",
                });
            }

            if (request_body?.method_name === "Payout Master" && !request_body?.access_token) {
                return res.json({
                    status: false,
                    message: "Please enter payout master token",
                });
            }
            if (request_body?.method_name === "Revolut" && !request_body?.revolut_public_id) {
                return res.json({
                    status: false,
                    message: "Please enter Revolut public ID",
                });
            }
            if (request_body?.method_name === "Checkout.com" && !request_body?.chk_publishable_key && !request_body?.chk_secret) {
                return res.json({
                    status: false,
                    message: "Please enter Checkout.com public ID & Secret Key",
                });
            }

            // Check Stripe Key Valid or Not
            if (request_body.method_name === "Stripe") {
                // let stripe_response = await CheckStripeKey({
                    // user_id: auth_user?.id,
                    // secret: request_body?.secret,
                    // publishable_key: request_body?.publishable_key,
                // });
                // if (stripe_response == undefined) {
                    // return res.json({
                        // status: false,
                        // message: "Invalid Stripe Secret Key!",
                    // });
                // }
            } else {
                delete request_body.card_accepted;
            }

            // Check `Checkout.com` Key Valid or Not
            if (request_body.method_name === "Checkout.com") {
                request_body.publishable_key = request_body?.chk_publishable_key;
                request_body.secret = request_body?.chk_secret;
                // let checkout_validate = await CheckoutPaymentValidate(request_body);
                // if(!checkout_validate?.token){
                //     return res.json({
                //         status: false,
                //         message: "Invalid Keys!",
                //     });
                // }
                // request_body.id_token = request_body?.chk_id_token;
                // let checkout_response = await CheckCheckoutKey(request_body);
                // if (checkout_response == undefined || checkout_response == null) {
                //     return res.json({
                //         status: false,
                //         message: "Invalid Keys!",
                //     });
                // }
            }

            // Update Payment method
            await PaymentMethods.update(request_body, {
                where: {
                    id: id,
                },
            });

            return res.json({
                status: true,
                message: "Payment method data updated",
                redirect_url: `${process.env.APP_URL}/${request_body?.store_id}/payment-methods`,
            });
        } catch (error) {
            console.error("add_payment_method error ------------", error);
            if (error == "Invalid Publish Key!" || error == `Invalid API Key provided:${request_body.secret}` || error == "Client Authentication failed") {
                return res.json({
                    status: false,
                    message: "Please check your Publish Key or Secret Key.",
                });
            }
            return res.json({
                status: false,
                message: "Something went wrong.Please check your details!",
            });
        }
    }

    let payment_method = await PaymentMethods.findOne({
        where: {
            id: id,
        },
    }).then((response) => {
        return response;
    });

    res.render("backend/PaymentMethods/edit_payment_method", {
        store_id: store_id,
        auth_user: auth_user,
        auth_store: auth_store,
        active_menu: "payment-methods",

        payment_method: payment_method,
    });
};

module.exports.delete_payment_method = async (req, res, next) => {
    const { store_id } = req.params;

    if (req.method === "POST") {
        let request_body = req.body;
        try {
            await PaymentMethods.destroy({
                where: {
                    id: request_body?.payment_method_id,
                },
            });
            return res.json({
                status: true,
                message: "Payment Method deleted successfully",
                redirect_url: `${process.env.APP_URL}/${request_body?.store_id}/payment-methods`,
            });
        } catch (error) {
            console.error("delete_shipping_rate error------------", error);
            return res.json({
                status: false,
                message: "Something went wrong!Please try again.",
            });
        }
    }
};

module.exports.paypal_webhook = async (req, res, next) => {
    const { auth_user, auth_store } = req;
    let request_query = req.query;

    paypal.configure({
        mode: process.env.PAYPAL_MODE, // sandbox or live
        client_id: process.env.PAYPAL_CLIENT_ID,
        client_secret: process.env.PAYPAL_SECRET_ID,
    });

    let payment_method = await PaymentMethods.findOne({
        where: {
            method_name: "PayPal",
            user_id: auth_user?.id,
            store_id: auth_store?.id,
        },
    });

    try {
        // Exchange the authorization code for a token
        paypal.openIdConnect.tokeninfo.create(request_query?.code, async (error, token_info) => {
            console.error("paypal_webhook paypal.openIdConnect.tokeninfo error-------------", error);
            console.error("paypal_webhook paypal.openIdConnect.tokeninfo token_info-------------", token_info);
            if (error) {
                req.flash("error", "Something went wrong. Please try again");
                return res.redirect(`${process.env.APP_URL}/${auth_store?.id}/payment-method/${payment_method?.id}`);
            } else {
                await PaymentMethods.update({
                    refresh_token: token_info?.refresh_token,
                    id_token: token_info?.id_token,
                    access_token: token_info?.access_token,
                }, {
                    where: {
                        id: payment_method?.id,
                    },
                });
                return res.redirect(`${process.env.APP_URL}/${auth_store?.id}/payment-method/${payment_method?.id}`);
            }
        });
    } catch (error) {
        console.error("paypal_webhook error -------------", error);
        req.flash("error", "Something went wrong. Please try again");
        // return res.redirect(`${process.env.APP_URL}/${auth_store?.id}/payment-methods`);
        return res.redirect(`${process.env.APP_URL}/${auth_store?.id}/payment-method/${payment_method?.id}`);
    }
};