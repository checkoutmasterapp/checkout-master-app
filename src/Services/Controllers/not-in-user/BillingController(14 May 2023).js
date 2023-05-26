const Sq = require("sequelize");
const moment = require("moment");

const models = require("../models");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

module.exports.billing_details = async (req, res, next) => {
    const { store_id } = req.params;
    const { auth_user, auth_store } = req;

    // Post Action
    if (req.method === "POST") {
        try {
            let request_body = req.body;
            console.log("billing_details request_body----------", request_body);

            //////////////////////////////////// Get Subsccription Package Details
            let package_detail = await models.SubscriptionPackage.findOne({
                where: {
                    id: request_body.subscription_package,
                },
            });
            console.log("billing_details package_detail----------", package_detail);


            let stripe_customer_id;
            //////////////// Create Stripe Customer If not Exist
            if (auth_user?.stripe_customer_id) {
                stripe_customer_id = auth_user?.stripe_customer_id;
            } else {
                let stripe_customers = {
                    email: auth_user.email,
                    name: `${auth_user.first_name} ${auth_user.last_name}`,
                    shipping: {
                        address: {
                            line1: request_body?.billing_address,
                            city: request_body?.billing_city,
                            postal_code: request_body?.billing_zip,
                            country: request_body?.billing_country_code,
                        },
                        name: `${auth_user.first_name} ${auth_user.last_name}`,
                    },
                    address: {
                        line1: request_body?.billing_address,
                        city: request_body?.billing_city,
                        postal_code: request_body?.billing_zip,
                        country: request_body?.billing_country_code,
                    },
                };

                await stripe.customers.create(stripe_customers).then(async function (customer) {
                    stripe_customer_id = customer.id;
                });

                await models.Users.update(
                    { stripe_customer_id: stripe_customer_id },
                    {
                        where: {
                            email: auth_user.email,
                        },
                    }
                );
            }
            console.log("billing_details stripe_customer_id----------", stripe_customer_id);


            //////////////////////////////////// Create Stripe Customer Card
            let stripe_card_id, stripe_card_last4, exp_month, exp_year, stripe_card_brand;
            if (request_body.card_number && request_body.expiry_date && request_body.card_cvv) {
                let expiry_date = request_body?.expiry_date.split("/");
                let card_detail = {
                    card: {
                        number: request_body.card_number,
                        exp_month: expiry_date[0],
                        exp_year: expiry_date[1],
                        cvc: request_body.card_cvv,
                        name: `${auth_user.first_name} ${auth_user.last_name}`,
                    },
                };
                stripe_card_token = await stripe.tokens.create(card_detail);

                stripe_card_id = stripe_card_token?.card?.id;
                stripe_card_brand = stripe_card_token?.card?.brand;
                stripe_card_last4 = stripe_card_token?.card?.last4;
                exp_month = stripe_card_token?.card?.exp_month;
                exp_year = stripe_card_token?.card?.exp_year;

                await stripe.customers.createSource(stripe_customer_id, {
                    source: stripe_card_token?.id,
                });

                //////////////// Make update card as Default card
                await stripe.customers.update(stripe_customer_id, {
                    invoice_settings: {
                        default_payment_method: stripe_card_id,
                    },
                });
            }

            let stripe_subscription = await stripe.subscriptions.create({
                customer: stripe_customer_id,
                items: [
                    {
                        price: package_detail?.stript_object_id,
                    },
                    {
                        price: package_detail?.stripe_metered_price_id,
                    },
                ],
            });

            // Add Temp records in the database
            await models.TempSubscription.create({
                user_id: auth_user?.id,
                store_id: request_body?.store_id,
                request_body: request_body,
                package_detail: package_detail,
                subscription_id: stripe_subscription?.id,
            });

            if (stripe_subscription?.status === "active") {
                redirect_url = `${process.env.APP_URL}/${store_id}/dashboard`;
            } else {
                // Stripe Invoice Paid 
                const pay_invoice = await stripe.invoices.retrieve(stripe_subscription.latest_invoice);
                console.log("billing_details pay_invoice -----------------", pay_invoice);
                redirect_url = pay_invoice?.hosted_invoice_url;
            }

            return res.json({
                status: true,
                redirect_url: redirect_url,
                message: "Subscription created successfully",
            });
        } catch (error) {
            console.error("billing_details error -----------------", error);
            return res.json({
                status: false,
                message: error?.message ? error.message : "Something went wrong. Please try again.",
            });
        }
    }

    try {
        let countries = await models.Countries.findAll();
        countries = countries.sort(function (a, b) {
            return a.country_name < b.country_name ? -1 : a.country_name > b.country_name ? 1 : 0;
        });

        let current_subscriptions = await models.UserSubscriptions.findOne({
            where: { store_id: store_id },
        });

        // Get all subscription package
        let subscription_packages = await models.SubscriptionPackage.findAll({
            where: { is_freetrail: false },
            order: [["id", "ASC"]],
        });

        // Get Current user subscription
        let current_billing_subscription = await models.UserSubscriptionBillings.findOne({
            where: { store_id: store_id },
            order: [["created_at", "DESC"]],
        });

        // Get Billing Details Fill by merchant
        let billing_details = await models.UserSubscriptionBillingDetails.findOne({
            order: [["id", "DESC"]],
            where: {
                store_id: store_id,
                user_id: auth_user?.id,
            },
        });

        // Get all Store card's
        let user_subscription_cards = await models.UserSubscriptionCardDetails.findAll({
            where: {
                store_id: store_id,
                user_id: auth_user?.id,
            }
        });


        // Get all Billing invoice's
        let user_billings_invoices = await models.UserSubscriptions.findOne({
            where: {
                status: true,
                store_id: store_id,
                user_id: auth_user?.id,
            },
            order: [["created_at", "DESC"]],
        });

        res.render("backend/Billing/billing_details", {
            store_id: store_id,
            auth_user: auth_user,
            auth_store: auth_store,
            active_menu: "billing-details",

            countries: countries,
            current_subscriptions: current_subscriptions,
            subscription_packages: subscription_packages,

            billing_details: billing_details,
            current_billing_subscription: current_billing_subscription,
            user_subscription_cards: user_subscription_cards,

            user_billings_invoices: user_billings_invoices || {},
        });
    } catch (error) {
        console.error("billing_details error--------", error);
        res.render("404");
    }
};

const CheckStoreBillingAndRenew = async (store_id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let current_subscription = await models.UserSubscriptions.findOne({
                where: {
                    status: true,
                    store_id: store_id,
                    end_date: { [Sq.Op.lte]: moment().toDate() },
                },
                order: [["created_at", "DESC"]],
            });

            if (current_subscription) {
                let next_subscription = await models.UserSubscriptionBillings.findOne({
                    where: {
                        status: "Pending",
                        store_id: current_subscription?.store_id,
                    },
                });
                if (next_subscription) {
                    const user = await models.Users.findOne({
                        where: {
                            id: current_subscription?.user_id,
                        },
                    });

                    if (!user) {
                        return;
                    }

                    if (!user?.stripe_customer_id) {
                        return;
                    }

                    let subscription_package = await models.SubscriptionPackage.findOne({
                        where: {
                            id: next_subscription.subscription_package_id,
                        },
                    });
                    let { price, billing_cycle, revenue_amount, revenue_type } = subscription_package;

                    const revenue_checkouts = await models.Checkouts.findAll({
                        where: {
                            is_purchase: true,
                            revenue_charge: false,
                            shop_id: current_subscription?.store_id,
                        },
                    });

                    let store_revenue = 0;
                    if (revenue_checkouts && revenue_checkouts.length) {
                        revenue_checkouts.forEach(async (checkout) => {
                            let purchaseAmount = parseFloat(checkout?.price);
                            store_revenue += purchaseAmount;
                        });
                    }

                    if (revenue_amount && revenue_type && revenue_type === "percentage") {
                        store_revenue = (parseFloat(store_revenue) * parseFloat(revenue_amount)) / 100;
                        price = parseFloat(price) + parseFloat(store_revenue);
                    }

                    let { stripe_customer_id } = user;

                    let stripe_charge_response = await stripe.charges.create({
                        currency: "usd",
                        amount: parseFloat(price.toFixed(2)) * 100,
                        customer: stripe_customer_id,
                    });

                    if (stripe_charge_response?.status === "succeeded") {
                        let start_date = moment().format("YYYY-MM-DD");
                        let end_date = moment(start_date).add(1, subscription_package.billing_cycle).format("YYYY-MM-DD");

                        current_subscription.is_expired = false;
                        current_subscription.end_date = end_date;
                        current_subscription.billing_cycle = subscription_package.billing_cycle;

                        next_subscription.price = price.toFixed(2);
                        next_subscription.revenue_amount = store_revenue.toFixed(2);
                        next_subscription.status = "Active";
                        next_subscription.save();
                    }

                    for (let revenue_checkout of revenue_checkouts) {
                        revenue_checkout.revenue_charge = true;
                        revenue_checkout.save();
                    }

                    current_subscription.subscription_package_id = subscription_package?.id;
                }

                current_subscription.status = true;
                current_subscription.save();
            }

            resolve({
                status: true,
                message: "Billing Renew Successfully",
            });
        } catch (error) {
            console.error("CheckStoreBillingAndRenew error -----------------", error);
            reject({
                status: false,
                message: error?.message ? error.message : "Something went wrong. Please try again.",
            });
        }
    });
};

module.exports.unsubscribe_billing = async (req, res, next) => {
    try {
        const { store_id } = req.body
        // Get Current user subscription
        let current_user_subscription = await models.UserSubscriptions.findOne({
            where: {
                store_id: store_id,
            },
        });

        if (!current_user_subscription) {
            return res.json({
                status: false,
                message: "No active subscription find",
            });
        }

        if (current_user_subscription) {
            current_user_subscription.status = false;
            current_user_subscription.save()
        }

        // Get Current user subscription billing
        await models.UserSubscriptionBillings.update({
            status: "Inactive"
        }, {
            where: {
                store_id: store_id,
                status: "Pending"
            }
        });

        return res.json({
            status: true,
            message: "Unsubsribe  successfully",
        });

    } catch (error) {
        return res.json({
            status: false,
            message: error?.message || "Something went wrong. Please try again.",
        });
    }
}

module.exports.invoice_listing = async (req, res, next) => {
    const { store_id } = req.params;
    const { auth_user, auth_store } = req;

    if (req.method === "POST") {
        try {
            let request_body = req.body;
            let where_filter = {
                store_id: request_body?.store_id
            };

            let query_object = {
                distinct: true,
                where: where_filter,
                order: [["id", "ASC"]],
                offset: request_body.start,
                limit: request_body.length,
            };

            let user_billings_invoices = await models.UserSubscriptionBillings.findAndCountAll(query_object);

            let client_data = [];
            if (user_billings_invoices.rows) {
                for (let user_billings_invoice of user_billings_invoices.rows) {

                    let invoice_status = "Paid";
                    if (user_billings_invoice?.status === "Pending") {
                        invoice_status = "Await"
                    }
                    if (user_billings_invoice?.status === "Inactive") {
                        invoice_status = "Inactive"
                    }

                    client_data.push({
                        invoice: `
						<i class="bi bi-file-earmark-richtext"></i>
						${user_billings_invoice.stripe_invoice_number}
					`,
                        paid: moment(user_billings_invoice.created_at).format('DD-MM-YYYY'),
                        status: invoice_status,
                        amount: user_billings_invoice.price,
                        view: `
						<a class="btn" href="${process.env.APP_URL}/${request_body?.store_id}/invoice-details/${user_billings_invoice.user_subscription_billing_uuid}">
							<i class="bi bi-eye-fill"></i>
							<i class="bi bi-chevron-right"></i>
						</a>
					`
                    })
                }
            }
            return res.json({
                data: client_data,
                draw: request_body["draw"],
                recordsTotal: user_billings_invoices.count,
                recordsFiltered: user_billings_invoices.count,
            });
        } catch (error) {
            console.error("invoice_listing error -----------------", error);
            return res.json({
                status: false,
                message: error?.message ? error.message : "Something went wrong. Please try again.",
            });
        }
    }

    try {
        res.render("backend/Billing/invoice_listing", {
            store_id: store_id,
            auth_user: auth_user,
            auth_store: auth_store,
            active_menu: "billing-details",

            moment: moment,
        });
    } catch (error) {
        console.error("invoice_listing error--------", error)
        res.render("404");
    }
};

module.exports.invoice_details = async (req, res, next) => {
    const { auth_user, auth_store } = req;
    const { store_id, invoice_id } = req.params;

    try {
        let user_billings_invoices = await models.UserSubscriptionBillings.findOne({
            where: {
                user_subscription_billing_uuid: invoice_id,
            }
        });

        let user_detail;
        let subscription_package;
        if (user_billings_invoices) {
            subscription_package = await models.SubscriptionPackage.findOne({
                where: {
                    id: user_billings_invoices?.subscription_package_id,
                }
            });

            user_detail = await models.Users.findOne({
                where: {
                    id: user_billings_invoices?.user_id,
                }
            });
        }

        let invoice_status = "Paid";
        if (user_billings_invoices?.status === "Pending") {
            invoice_status = "Await"
        }
        if (user_billings_invoices?.status === "Inactive") {
            invoice_status = "Inactive"
        }

        res.render("backend/Billing/invoice_details", {
            store_id: store_id,
            auth_user: auth_user,
            auth_store: auth_store,
            active_menu: "billing-details",

            moment: moment,
            user_detail: user_detail,
            invoice_status: invoice_status,
            subscription_package: subscription_package,
            user_billings_invoices: user_billings_invoices,
        });
    } catch (error) {
        console.error("invoice_details error--------", error)
        res.render("404");
    }
};