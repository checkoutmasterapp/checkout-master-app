const moment = require("moment");
const bcrypt = require("bcryptjs");
const paypal = require("paypal-rest-sdk");

const models = require("../models");
const { SendEmail } = require("../../libs/Helper");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

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

module.exports.test_create_subscription_plan = async (req, res, next) => {
    try {
        /*** Create Stripe Product ***/
        let subscription_product = await stripe.products
            .create({
                name: "Standard",
                description: "Testing the package with description",
            })
            .then(function (response) {
                return response;
            });

        /*** Create Stripe Subscription ***/
        let stripe_subscription_package = await stripe.prices
            .create({
                currency: "usd",
                unit_amount: 195 * 100,
                nickname: "Standard",
                recurring: { interval: "month" },
                product: subscription_product?.id,
            })
            .then(function (response) {
                return response;
            });
        console.log("test_subscription stripe_subscription_package -------------", stripe_subscription_package);

        /*** Create Stripe Discount ***/
        let stripe_discount = await stripe.coupons.create({
            currency: "usd",
            amount_off: 146 * 100,
            duration: "forever",
            name: "Forever Discount",
        });
        console.log("test_subscription stripe_discount -------------", stripe_discount);

        return res.send({
            status: true,
            message: "Stripe subscription created successfully",
        });
    } catch (error) {
        console.error("test_create_subscription_plan error -------------", error);
        return res.send({
            status: false,
            message: "Something went wrong. Please try again",
        });
    }
};

module.exports.test_paypal = async (req, res, next) => {
    try {
        return res.render("backend/Test/test_paypal");

        paypal.configure({
            mode: process.env.PAYPAL_MODE, // sandbox or live
            client_id: process.env.PAYPAL_CLIENT_ID,
            client_secret: process.env.PAYPAL_SECRET_ID,
        });

        let auth_url = paypal.openIdConnect.authorizeUrl({
            scope: "openid email profile",
            redirect_uri: `${process.env.APP_URL}/test-paypal-webhook`,
        });
        return res.redirect(auth_url);

        return res.send({
            status: true,
            message: "Subscription created successfully!",
        });
    } catch (error) {
        console.error("test_subscription error -------------", error);
        return res.send("No record found!!");
    }
};

module.exports.test_paypal_webhook = async (req, res, next) => {
    let request_query = req.query;
    try {
        paypal.configure({
            mode: process.env.PAYPAL_MODE, // sandbox or live
            client_id: process.env.PAYPAL_CLIENT_ID,
            client_secret: process.env.PAYPAL_SECRET_ID,
        });

        // Exchange the authorization code for a token
        paypal.openIdConnect.tokeninfo.create(request_query?.code, function (error, tokeninfo) {
            if (error) {
                console.error("test_paypal_webhook error-------------", error);
                return res.send(error.response);
            } else {
                req.session.paypa_access_token = tokeninfo?.access_token;
                console.log("test_paypal_webhook tokeninfo-------------", tokeninfo);

                // return res.send(tokeninfo);
                // return res.redirect("/test-paypal-payment");
            }
        });
    } catch (error) {
        console.error("test_paypal_webhook error -------------", error);
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


module.exports.test_stripe = async (req, res, next) => {
    let request_body = req.query;

    try {
        ////////////////////////////////////////////// Create Stripe Subscitption //////////////////////////////////////////////
        /*** Create Stripe Product ***/
        let subscription_product = await stripe.products
            .create({
                name: request_body.package_name,
                description: request_body.description,
            })
            .then(function (response) {
                return response;
            });

        /*** Create Stripe Subscription ***/
        let stripe_subscription_package = await stripe.prices
            .create({
                currency: "usd",
                product: subscription_product?.id,
                unit_amount: 49 * 100,
                nickname: request_body.package_name,
                recurring: {
                    interval: request_body.billing_cycle,
                },
            })
            .then(function (response) {
                return response;
            });
        let stripe_subscitption_package_id = stripe_subscription_package?.id;

        ////////////////////////////////////////////// Create Stripe Customer //////////////////////////////////////////////
        let stripe_customer_id;
        let stripe_customers = {
            email: request_body.email,
            name: `${request_body.first_name} ${request_body.last_name}`,
        };
        await stripe.customers.create(stripe_customers).then(async function (customer) {
            stripe_customer_id = customer.id;
        });

        ////////////////////////////////////////////// Create Stripe Customer Card //////////////////////////////////////////////
        let card_detail = {
            card: {
                name: request_body.card_holdername,
                number: request_body.card_number,
                exp_month: request_body.exp_month,
                exp_year: request_body.exp_year,
                cvc: request_body.card_cvv,
            },
        };
        await stripe.tokens.create(card_detail).then(async (token) => {
            let stripe_token = token.id;

            await stripe.customers
                .createSource(stripe_customer_id, { source: stripe_token })
                .then(async function (secret_key) {
                    stripe_card_id = secret_key.id;
                })
                .catch((error) => {
                    res.json({
                        error: error,
                        status: false,
                        message: "Something went wrong. Please try again",
                    });
                });
        });

        ////////////////////////////////////////////// Stripe Create Subscription //////////////////////////////////////////////
        let start_date = moment().add(1, "month").startOf("day");
        console.error("test_stripe start_date -------------", start_date);

        let billing_cycle_anchor = start_date.unix();
        let stripe_subscription = await stripe.subscriptionSchedules.create({
            customer: stripe_customer_id,
            items: [
                {
                    price: stripe_subscitption_package_id,
                },
            ],
            start_date: billing_cycle_anchor,
        });
        console.error("test_stripe stripe_subscription -------------", stripe_subscription);

        /*** Stripe Deduct Static Charge ***/
        // let stripe_charge = await stripe.charges.create({
        //     currency: "usd",
        //     amount: 195 * 100,
        //     customer: stripe_customer_id,
        //     description: `New Subscription start for - ${stripe_subscription?.id}`,
        // });
        // console.error("test_stripe stripe_charge -------------", stripe_charge);

        return res.send({
            status: true,
            message: "Stripe payment done successfully",
        });
    } catch (error) {
        console.error("test_stripe error -------------", error);
        return res.send({
            status: false,
            error: error?.message,
            message: "Something went wrong!Please try again.",
        });
    }
};

module.exports.test_checkout_template = async (req, res, next) => {
    const { version } = req.params;

    res.render(`Test/CheckoutTemplates/checkout-template`, {
        version: version,
        body_class: `checkout-template-${version}`
    });
};

module.exports.test_checkout_thankyou = async (req, res, next) => {
    const { version } = req.params;

    res.render(`Test/CheckoutTemplates/checkout-thankyou`, {
        version: version,
        body_class: `checkout-thankyou-${version}`
    });
};