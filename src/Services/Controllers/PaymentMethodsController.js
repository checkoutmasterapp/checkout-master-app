"use strict";

const fs = require('fs');
const moment = require("moment");
const paypal = require("paypal-rest-sdk");

const models = require("../models");
const { PaymentMethods, Stores } = require("../models");

const array_column = (array, column) => {
    return array.map((item) => item[column]);
};

module.exports.payment_methods = async (req, res, next) => {
    const { store_id } = req.params;
    const { auth_user, auth_store } = req;

    if (req.method === "POST") {
        try {
            let request_body = req.body;

            let where_filter = {
                store_id: request_body?.store_id
            };

            let query_object = {
                where: where_filter,
                order: [["id", "DESC"]],
                offset: request_body.start,
                limit: request_body.length,
            };

            let payment_methods = await models.PaymentMethods.findAndCountAll(query_object);

            let client_data = [];
            if (payment_methods.rows) {
                for (let payment_method of payment_methods.rows) {
                    client_data.push({
                        method_name: payment_method?.method_name,
                        processing_mode: "Live Transactions",
                        created_at: moment(payment_method?.created_at).format("YYYY-MM-DD"),
                        action: `
                            <div class="d-flex">
                                <a
                                    href="${process.env.APP_URL}/${payment_method?.store_id}/payment-method/${payment_method?.id}"
                                    class="btn"
                                ><i class="bi bi-pencil-square"></i></a>
                            </div>
                        `,
                    })
                }
            }

            return res.json({
                data: client_data,
                draw: request_body["draw"],
                recordsTotal: payment_methods.count,
                recordsFiltered: payment_methods.count,
            });
        } catch (error) {
            console.error("payment_methods error-----------", error);
            return res.json({
                status: false,
                message: error?.message ? error.message : "Something went wrong. Please try again.",
            });
        }
    }

    res.render("backend/PaymentMethods/payment_methods", {
        store_id: store_id,
        auth_user: auth_user,
        auth_store: auth_store,
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

            // Only one credit card payment method is added at a time
            // let card_method_lists = ["Stripe", "Checkout.com", "Revolut"];
            // let card_method_exist = await PaymentMethods.findOne({
            //     where: {
            //         method_name: card_method_lists,
            //         store_id: request_body?.store_id,
            //     }
            // });
            // if (card_method_exist) {
            //     return res.json({
            //         status: false,
            //         message: "Only one credit card payment method can be added at a time. Please remove the current credit card payment method and try again.",
            //     });
            // }

            if (typeof req.files !== "undefined") {
                if (req?.files["apple_certificate_pem"]) {
                    let apple_certificate_pem = req?.files["apple_certificate_pem"][0];
                    apple_certificate_pem = `${apple_certificate_pem?.destination}/${apple_certificate_pem?.filename}`;
                    request_body.apple_certificate_pem = apple_certificate_pem;
                }

                if (req?.files["apple_certificate_key"]) {
                    let apple_certificate_key = req?.files["apple_certificate_key"][0];
                    apple_certificate_key = `${apple_certificate_key?.destination}/${apple_certificate_key?.filename}`;
                    request_body.apple_certificate_key = apple_certificate_key;
                }
            }

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
            if (
                request_body.method_name !== "Stripe"
                && request_body.method_name !== "Checkout.com"
            ) {
                delete request_body.card_accepted;
            }

            // Check `Checkout.com` Key Valid or Not
            if (request_body.method_name === "Checkout.com") {
                request_body.publishable_key = request_body?.chk_publishable_key;
                request_body.secret = request_body?.chk_secret;
            }

            // Create Payment method
            let payment_method = await PaymentMethods.create(request_body);

            // Update Store Table with Payment Method True
            await Stores.update({ payment_method: true }, {
                where: {
                    id: request_body?.store_id,
                },
            });

            return res.json({
                status: true,
                message: "Payment method added successfully",
                redirect_url: `${process.env.APP_URL}/${request_body?.store_id}/payment-method/${payment_method?.id}`,
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
                message: error?.message ? error.message : "Something went wrong. Please try again.",
            });
        }
    }

    let payment_details = await PaymentMethods.findAll({
        where: {
            store_id: store_id,
            user_id: auth_user.id,
        },
    });
    let select_method_lists = array_column(payment_details, "method_name");

    res.render("backend/PaymentMethods/add_payment_method", {
        store_id: store_id,
        auth_user: auth_user,
        auth_store: auth_store,
        active_menu: "payment-methods",

        payment_method: payment_details,
        select_method_lists: select_method_lists,
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

            if (typeof req.files !== "undefined") {
                if (req?.files["apple_certificate_pem"]) {
                    let apple_certificate_pem = req?.files["apple_certificate_pem"][0];
                    apple_certificate_pem = `${apple_certificate_pem?.destination}/${apple_certificate_pem?.filename}`;
                    request_body.apple_certificate_pem = apple_certificate_pem;
                }

                if (req?.files["apple_certificate_key"]) {
                    let apple_certificate_key = req?.files["apple_certificate_key"][0];
                    apple_certificate_key = `${apple_certificate_key?.destination}/${apple_certificate_key?.filename}`;
                    request_body.apple_certificate_key = apple_certificate_key;
                }
            }

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
            if (request_body.method_name !== "Stripe" && request_body.method_name !== "Checkout.com") {
                delete request_body.card_accepted;
            }

            // Check `Checkout.com` Key Valid or Not
            if (request_body.method_name === "Checkout.com") {
                request_body.publishable_key = request_body?.chk_publishable_key;
                request_body.secret = request_body?.chk_secret;
            }

            // Check `Apple Pay` Key Valid or Not
            if (request_body.method_name === "Apple pay") {
                if (!request_body?.apple_certificate_pem) {
                    delete request_body.apple_certificate_pem;
                }

                if (!request_body?.apple_certificate_key) {
                    delete request_body.apple_certificate_key;
                }
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

    let payment_methods = await PaymentMethods.findAll({
        where: {
            store_id: store_id,
        },
    }).then((response) => {
        return response;
    });

    let last_payment_method = false;
    if (payment_methods.length == 1) {
        last_payment_method = true;
    }

    res.render("backend/PaymentMethods/edit_payment_method", {
        store_id: store_id,
        auth_user: auth_user,
        auth_store: auth_store,
        active_menu: "payment-methods",

        payment_method: payment_method,
        last_payment_method: last_payment_method,
    });
};

module.exports.delete_payment_method = async (req, res, next) => {
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

module.exports.payment_verify = async (req, res, next) => {
    let request_body = req.body;
    try {

        if (request_body?.action === "apple_certificate") {
            let apple_certificate = request_body?.apple_certificate;
            let apple_certificate_file = `${appRoot}/public/.well-known/apple-developer-merchantid-domain-association.txt`;
            fs.writeFileSync(apple_certificate_file, apple_certificate, 'utf8');
        }

        return res.json({
            status: true,
            message: "Payment verify successfully",
        });
    } catch (error) {
        console.error("payment_verify error------------", error);
        return res.json({
            status: false,
            message: error?.message ? error.message : "Something went wrong. Please try again.",
        });
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