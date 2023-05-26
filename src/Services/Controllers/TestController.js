"use strict";

const fs = require("fs");
const Sq = require("sequelize");
const moment = require("moment");
const bcrypt = require("bcryptjs");
const request = require("request-promise");

const models = require("../models");
const { SendEmail } = require("../../libs/Helper");

module.exports.test = async (req, res, next) => {
    try {
        let user_password = "Dineshtbi@123";
        let user_password_bcrypt = await bcrypt.hash(user_password, 10);

        return res.json({
            status: true,
            user_password: user_password,
            user_password_bcrypt: user_password_bcrypt,
            message: "URL Working successfully!",
        });
    } catch (error) {
        console.error("test error -------------", error);
        return res.json({
            status: false,
            message: error.message,
        });
    }
};

module.exports.test_mail = async (req, res, next) => {
    let mail_options = {
        subject: `SMTP Test`,
        to: `developerdinesh0@gmail.com`,
        html: `This is the HTML message body <b>in bold!</b>`,
        from: `${process.env.MAIL_FROM_NAME} <${process.env.MAIL_FROM_ADDRESS}>`,
    };

    SendEmail(mail_options)
        .then((info) => {
            console.log("test_mail info ---------------", info);
            res.send({
                status: 200,
                success: true,
                message: `Email sent: ${info.response}`,
            });
        })
        .catch((error) => {
            console.error("test_mail error ---------------", error);
            res.send({
                status: 503,
                success: false,
                error: `Email not sent: ${error.response}`,
            });
        });
};

module.exports.test_store_create = async (req, res, next) => {
    try {
        await models.Stores.create({
            user_id: 1,
            store_name: "testappwithnodejs",
            store_domain: "testappwithnodejs.myshopify.com",
            store_token: "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",
        });
        return res.send({ status: true, message: "Successfully!" });
    } catch (error) {
        console.error("test_store_create error -------------", error);
        return res.send("No record found!!");
    }
};

module.exports.test_shopify_webhook = async (req, res, next) => {
    try {
        const { ShopifyRetrievedWebhooks } = require("../../libs/ShopifyHelper");

        let store_details = await models.Stores.findAll();

        for (let store_detail of store_details) {
            await ShopifyRetrievedWebhooks({
                store_id: store_detail?.id,
                store_domain: store_detail?.store_name,
                access_token: store_detail?.store_token,
            });
        }

        return res.send({ status: true, message: "Successfully!" });
    } catch (error) {
        console.error("test_shopify_webhook error -------------", error?.message);
        return res.json({
            status: false,
            message: error?.message ? error.message : "Something went wrong. Please try again.",
        });
    }
};

module.exports.test_store_currency = async (req, res, next) => {
    try {
        let store_details = await models.Stores.findAll();

        for (let store_detail of store_details) {

            let store_option = {
                json: true,
                method: "GET",
                uri: `https://${store_detail.store_name}.myshopify.com/admin/api/2023-01/shop.json`,
                headers: {
                    "Content-Type": "application/json",
                    "X-Shopify-Access-Token": `${store_detail.store_token}`,
                },
            };
            console.log("test_store_currency store_option---------", store_option);
            await request(store_option).then(async function (store_response) {

                store_detail.store_currency = store_response?.shop?.currency;
                store_detail.money_format = store_response?.shop?.money_format;
                store_detail.save();

            }).catch(function (error) {
                console.error("test_store_currency error -------------", error?.message);
            });
        }

        return res.send({ status: true, message: "Successfully!" });
    } catch (error) {
        console.error("test_store_currency error -------------", error?.message);
        return res.json({
            status: false,
            message: error?.message ? error.message : "Something went wrong. Please try again.",
        });
    }
};

module.exports.checkout_template_update = async (req, res, next) => {
    try {
        let checkout_template = await models.CheckoutTemplates.findOne();
        let customize_checkouts = await models.CustomizeCheckout.findAll();

        for (let customize_checkout of customize_checkouts) {
            if (customize_checkout?.template_code) {
                checkout_template = await models.CheckoutTemplates.findOne({
                    where: {
                        template_code: customize_checkout?.template_code,
                    },
                });
            }

            let template_code = checkout_template?.template_code;

            // Replace constant value with the database variable
            let replace_parametars = {
                font_size: `${checkout_template?.font_size}px`,
                accent_color: checkout_template?.accent_color,
                button_color: checkout_template?.button_color,
                error_color: checkout_template?.error_color,
            };

            let checkout_template_css = await fs.readFileSync(`${appRoot}/public/assets/css/checkout-template/checkout-template-${template_code}-dummy.css`, "utf8");
            checkout_template_css = checkout_template_css.replace(/font_size|accent_color|button_color|error_color/gi, function (matched) {
                return replace_parametars[matched];
            });

            let checkout_template_writeStream = await fs.createWriteStream(`${appRoot}/public/assets/css/store-css/checkout-template-${customize_checkout?.store_id}.css`);
            checkout_template_writeStream.write(checkout_template_css);
            checkout_template_writeStream.end();

            let checkout_thankyou_css = await fs.readFileSync(`${appRoot}/public/assets/css/checkout-template/checkout-thankyou-${template_code}-dummy.css`, "utf8");
            checkout_thankyou_css = checkout_thankyou_css.replace(/font_size|accent_color|button_color|error_color/gi, function (matched) {
                return replace_parametars[matched];
            });

            let checkout_thankyou_writeStream = await fs.createWriteStream(`${appRoot}/public/assets/css/store-css/checkout-thankyou-${customize_checkout?.store_id}.css`);
            checkout_thankyou_writeStream.write(checkout_thankyou_css);
            checkout_thankyou_writeStream.end();

            customize_checkout.font_size = checkout_template?.font_size;
            customize_checkout.accent_color = checkout_template?.accent_color;
            customize_checkout.button_color = checkout_template?.button_color;
            customize_checkout.error_color = checkout_template?.error_color;

            customize_checkout.template_id = checkout_template.id;
            customize_checkout.template_code = checkout_template.template_code;
            customize_checkout.save();
        }

        return res.json({
            status: true,
            message: "Checkout template update",
        });
    } catch (error) {
        console.error("checkout_template_update error -------------", error);
        return res.json({
            status: false,
            message: error.message,
        });
    }
};

const { ChangeLanguage } = require("../../libs/Helper");
module.exports.checkout_tarnslation_update = async (req, res, next) => {
    try {
        let translations = await models.Translations.findAll();
        for (let translation of translations) {
            let translation_lang = await ChangeLanguage((translation?.translation_language).toLowerCase());

            translation.contact_information = translation_lang.contact_information;
            translation.save();
        }

        return res.json({
            status: true,
            message: "Checkout tarnslation update",
        });
    } catch (error) {
        console.error("checkout_tarnslation_update error -------------", error);
        return res.json({
            status: false,
            message: error.message,
        });
    }
};

module.exports.test_checkout_digital = async (req, res, next) => {
    const { version } = req.params;

    res.render(`Test/CheckoutTemplates/checkout-digital`, {
        version: version,
        body_class: `checkout-template-d1`,
    });
};

module.exports.test_checkout_template = async (req, res, next) => {
    const { version } = req.params;

    res.render(`Test/CheckoutTemplates/checkout-template`, {
        version: version,
        body_class: `checkout-template-${version}`,
    });
};

module.exports.test_checkout_thankyou = async (req, res, next) => {
    const { version } = req.params;

    res.render(`Test/CheckoutTemplates/checkout-thankyou`, {
        version: version,
        body_class: `checkout-thankyou-${version}`,
    });
};

module.exports.test_landing_page = async (req, res, next) => {
    res.render(`Test/test_landing_page`);
};

///// Paypal Test Code Start
const paypal = require("paypal-rest-sdk");
module.exports.test_paypal = async (req, res, next) => {
    try {
        return res.render("Test/test_paypal");

        paypal.configure({
            mode: process.env.PAYPAL_MODE, // sandbox or live
            client_id: process.env.PAYPAL_CLIENT_ID,
            client_secret: process.env.PAYPAL_SECRET_ID,
        });

        let auth_url = paypal.openIdConnect.authorizeUrl({
            scope: "openid email profile",
            redirect_uri: `${process.env.APP_URL}/test/paypal/callback`,
        });
        return res.redirect(auth_url);
    } catch (error) {
        console.error("test_subscription error -------------", error);
        return res.send("No record found!!");
    }
};

module.exports.test_paypal_callback = async (req, res, next) => {
    let request_query = req.query;
    try {
        console.log("test_paypal_callback request_query-------------", request_query);

        paypal.configure({
            mode: process.env.PAYPAL_MODE, // sandbox or live
            client_id: process.env.PAYPAL_CLIENT_ID,
            client_secret: process.env.PAYPAL_SECRET_ID,
        });

        // Exchange the authorization code for a token
        paypal.openIdConnect.tokeninfo.create(request_query?.code, function (error, tokeninfo) {
            if (error) {
                console.error("test_paypal_callback error-------------", error);
                return res.send(error.response);
            } else {
                req.session.paypa_access_token = tokeninfo?.access_token;
                console.log("test_paypal_callback tokeninfo-------------", tokeninfo);

                // return res.send(tokeninfo);
                // return res.redirect("/test-paypal-payment");
            }
        });
    } catch (error) {
        console.error("test_paypal_callback error -------------", error);
        return res.send("No record found!!");
    }
};

module.exports.test_paypal_payment = async (req, res, next) => {
    try {
        let paypa_access_token = req.session.paypa_access_token;
        console.log("test_paypal_payment paypa_access_token-------------", paypa_access_token);

        paypal.configure({
            mode: "sandbox", // or 'live' for production
            headers: {
                Authorization: `Bearer ${paypa_access_token}`,
            },
        });

        let create_payment_json = {
            intent: "sale",
            payer: {
                payment_method: "paypal",
            },
            redirect_urls: {
                return_url: `${process.env.APP_URL}/test-paypal-success`,
                cancel_url: `${process.env.APP_URL}/test-paypal-cancel`,
            },
            transactions: [
                {
                    item_list: {
                        items: [
                            {
                                name: "item",
                                sku: "item",
                                price: "1.00",
                                currency: "USD",
                                quantity: 1,
                            },
                        ],
                    },
                    amount: {
                        currency: "USD",
                        total: "1.00",
                    },
                    description: "This is the payment description.",
                },
            ],
        };

        let paypal_payment_link;
        await paypal.payment.create(create_payment_json, async (error, payment) => {
            if (error) {
                console.error("test_paypal_payment error -------------", error);
            } else {
                console.log("test_paypal_payment payment -------------", payment);
                for (var i = 0; i < payment.links.length; i++) {
                    if (payment.links[i].rel === "approval_url") {
                        paypal_payment_link = payment.links[i].href;
                        console.log("Payment approval URL:----------", paypal_payment_link);
                        return res.redirect(paypal_payment_link);
                    }
                }
            }
        });
    } catch (error) {
        console.error("test_paypal_payment error -------------", error);
        return res.send("No record found!!");
    }
};

module.exports.test_paypal_success = async (req, res, next) => {
    let request_query = req.query;
    try {
        console.log("test_paypal_success request_query---------------", request_query);
        return res.send({
            status: true,
            message: "Paypal Payment Success",
        });
    } catch (error) {
        console.error("test_paypal_success error -------------", error);
        return res.send("No record found!!");
    }
};

module.exports.test_paypal_cancel = async (req, res, next) => {
    let request_query = req.query;
    try {
        console.log("test_paypal_cancel request_query---------------", request_query);
        return res.send({
            status: true,
            message: "Paypal Payment Error",
        });
    } catch (error) {
        console.error("test_paypal_cancel error -------------", error);
        return res.send("No record found!!");
    }
};
///// Paypal Test Code End

///// Stripe Test Code Start
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
module.exports.stripe_price = async (req, res, next) => {
    try {
        const light_product = await stripe.products.create({
            name: "Light plan",
        });
        console.log("stripe_price light_product-----", light_product);

        const light_flat_price = await stripe.prices.create({
            product: light_product?.id,
            unit_amount: parseFloat(9.99) * 100,
            currency: "usd",
            recurring: {
                interval: "week",
            },
        });
        console.log("stripe_price light_flat_price-----", light_flat_price);

        const light_metered_price = await stripe.prices.create({
            nickname: "Light plan Metered Plan",
            product: light_product?.id,
            unit_amount: parseFloat(1.5) * 100,
            currency: "usd",
            recurring: {
                interval: "week",
                usage_type: "metered",
            },
        });
        console.log("stripe_price light_metered_price-----", light_metered_price);

        return res.json({ status: true, message: "Checkout tarnslation update" });
    } catch (error) {
        console.error("stripe_price error -------------", error);
        return res.json({
            status: false,
            message: error.message,
        });
    }
};

module.exports.stripe_customer = async (req, res, next) => {
    try {
        ////////////////////////////////////////////// Create Stripe Customer
        let stripe_customer_id;
        let stripe_customers = {
            email: "dinesh.chandel@gmail.com",
            name: `Dinesh Chandel`,
        };
        await stripe.customers.create(stripe_customers).then(async function (customer) {
            stripe_customer_id = customer.id;
        });

        let card_detail = {
            card: {
                number: "4242424242424242",
                exp_month: "01",
                exp_year: "2024",
                cvc: "122",
            },
        };
        await stripe.tokens.create(card_detail).then(async (token) => {
            let stripe_token = token.id;

            await stripe.customers.createSource(stripe_customer_id, {
                source: stripe_token,
            });
        });

        return res.json({ status: true, message: "Checkout tarnslation update" });
    } catch (error) {
        console.error("stripe_customer error -------------", error);
        return res.json({
            status: false,
            message: error.message,
        });
    }
};

module.exports.stripe_subscription = async (req, res, next) => {
    try {
        let start_date = moment().add(5, "days");
        start_date = start_date.unix();
        console.log("stripe_subscription start_date -------------", start_date);

        const subscription = await stripe.subscriptions.create({
            customer: "cus_Nt4ClFpiYll8p7",
            items: [
                {
                    price: "price_1N7I48G3TgT7c7M08y6qYVzy",
                    quantity: 1,
                },
                {
                    price: "price_1N7I49G3TgT7c7M0fvoMd6Nn",
                },
            ],
            billing_cycle_anchor: start_date,
        });
        console.log("stripe_subscription subscription -------------", subscription);

        return res.json({ status: true, message: "Checkout tarnslation update" });
    } catch (error) {
        console.error("stripe_subscription error -------------", error);
        return res.json({
            status: false,
            message: error?.message ? error.message : "Something went wrong. Please try again.",
        });
    }
};

module.exports.stripe_subscription_update = async (req, res, next) => {
    try {
        const subscription = await stripe.subscriptions.update("sub_1NAoweGIFj7tn9efkDrtIk1k", {
            billing_thresholds: {
                amount_gte: parseFloat(57) * 100,
                reset_billing_cycle_anchor: true,
            },
        });
        console.log("stripe_subscription_update subscription -------------", subscription);

        return res.json({ status: true, message: "Checkout tarnslation update" });
    } catch (error) {
        console.error("stripe_subscription_update error -------------", error);
        return res.json({
            status: false,
            message: error?.message ? error.message : "Something went wrong. Please try again.",
        });
    }
};

module.exports.stripe_subscription_get = async (req, res, next) => {
    try {
        const subscription = await stripe.subscriptions.retrieve(
            'sub_1N7YDeG3TgT7c7M09PG2eX8t'
        );
        console.log("stripe_subscription_get subscription -------------", subscription);

        return res.json({ status: true, message: "Checkout tarnslation get" });
    } catch (error) {
        console.error("stripe_subscription_update error -------------", error);
        return res.json({
            status: false,
            message: error?.message ? error.message : "Something went wrong. Please try again.",
        });
    }
};

module.exports.stripe_upcoming_invoice_items = async (req, res, next) => {
    try {


        const invoice_detail = await stripe.invoices.retrieve("in_1NBBRHGIFj7tn9efaFvyBq4H");
        console.log("stripe_upcoming_invoice_items invoice_detail -------------", invoice_detail);



        return res.json({
            status: true,
            invoice_detail: invoice_detail,
            message: "Checkout tarnslation get"
        });
    } catch (error) {
        console.error("stripe_upcoming_invoice_items error -------------", error);
        return res.json({
            status: false,
            message: error?.message ? error.message : "Something went wrong. Please try again.",
        });
    }
};

module.exports.test_update_store_count = async (req, res, next) => {
    try {

        let user_details = await models.Users.findAll();
        for (let user_detail of user_details) {

            let store_count = await models.Stores.count({
                where: {
                    user_id: user_detail?.id,
                },
            });

            user_detail.store_count = store_count;

            let first_store = await models.Stores.findOne({
                where: {
                    user_id: user_detail?.id,
                },
            });
            user_detail.first_store_publish_id = first_store?.id;

            user_detail.save();
        }

        return res.json({ status: true, message: "Store Count update!!" });
    } catch (error) {
        console.error("test_update_store_count error -------------", error);
        return res.json({
            status: false,
            message: error?.message ? error.message : "Something went wrong. Please try again.",
        });
    }
};
///// Stripe Test Code End