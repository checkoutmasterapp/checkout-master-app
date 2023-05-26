const moment = require("moment");

const models = require("../../models");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret = "whsec_8a0f1441a02c418de34865c2684786ccebcefec65abd3c21ebb98b00391f804b";

module.exports.StripeWebhook = async (req, res) => {
    const sig = req.header("stripe-signature");

    try {
        let event = req.body;
        console.log("StripeWebhook event.type -------------", event.type);

        /*** Generate Stripe logs in the database ***/
        await models.StripeWebhookLogs.create({
            webhook_type: event.type,
            webhook_event: event,
            webhook_object: event?.data?.object,
        });

        switch (event.type) {
            // update planExpireDate of user when stripe renewed someone's subscription
            case "customer.subscription.trial_will_end":
                // send email to user about trial end;
                let subscription_trialend = event.data.object;
                // console.log("StripeWebhook subscription_trialend -------------", subscription_trialend);

                res.status(200).send({ success: true });
                break;

            case "customer.subscription.created":
                // send update to user that their plan has been updated
                let subscription_create = event.data.object;
                console.log("StripeWebhook subscription_create -------------", subscription_create);

                ///////////////////////////// Get Subsciption Charge Details Start
                const subscription_invoice = await stripe.invoices.retrieve(subscription_create.latest_invoice);

                let stripe_card_last4, stripe_card_brand, stripe_card_id, stripe_customer_id, exp_month, exp_year;
                if (subscription_invoice?.charge) {
                    let charge_detail = await stripe.charges.retrieve(subscription_invoice.charge);
                    stripe_card_id = charge_detail?.payment_method;
                    stripe_customer_id = charge_detail?.customer;
                    if (charge_detail?.payment_method_details?.card) {
                        let card_detail = charge_detail?.payment_method_details?.card;

                        stripe_card_last4 = card_detail?.last4;
                        exp_month = card_detail?.exp_month;
                        exp_year = card_detail?.exp_year;
                        stripe_card_brand = card_detail?.brand;
                    }
                }

                let temp_subscription = await models.TempSubscription.findOne({
                    where: {
                        subscription_id: subscription_create.id
                    }
                });
                let request_body = temp_subscription?.request_body;
                let package_detail = temp_subscription?.package_detail;

                if (temp_subscription) {

                    //////////////////////////////////// Get Current Store Subscription
                    let current_user_subscription = await models.UserSubscriptions.findOne({
                        where: { user_id: temp_subscription?.user_id },
                    });

                    var current_period_end = new Date(subscription_create.current_period_end * 1000);
                    var current_period_start = new Date(subscription_create.current_period_start * 1000);
                    console.log("StripeWebhook current_period_end -------------", current_period_end);
                    console.log("StripeWebhook current_period_start -------------", current_period_start);

                    //////////////////////////////////// Create User Subscriptions Billing Details
                    await models.UserSubscriptionBillingDetails.create({
                        user_id: temp_subscription?.user_id,
                        store_id: request_body?.store_id,
                        subscription_package_id: package_detail?.id,
                        billing_company: request_body?.billing_company,
                        billing_first_name: request_body?.billing_first_name,
                        billing_last_name: request_body?.billing_last_name,
                        billing_address: request_body?.billing_address,
                        billing_city: request_body?.billing_city,
                        billing_zip: request_body?.billing_zip,
                        billing_state: request_body?.billing_state,
                        billing_country_code: request_body?.billing_country_code,
                        user_subscription_id: current_user_subscription?.id,
                    });

                    //////////////////////////////////// Get User Subscriptions Card Details *dheeraj
                    let user_subscription_card_detail;
                    if (stripe_card_id) {
                        user_subscription_card_detail = await models.UserSubscriptionCardDetails.findOne({
                            where: {
                                stripe_card_id: stripe_card_id
                            },
                        });
                    }

                    let subscription_billing_status = "Pending";
                    if (subscription_create?.status === "active") {
                        subscription_billing_status = "Active";
                    }

                    if (subscription_create?.status === "incomplete") {
                        subscription_billing_status = "incomplete";
                    }

                    //////////////////////////////////// Create User Subscription Billings
                    let subscription_billings = {
                        user_id: temp_subscription?.user_id,
                        store_id: temp_subscription?.store_id,
                        user_subscription_id: current_user_subscription?.id,
                        subscription_package_id: package_detail?.id,
                        billing_cycle: package_detail?.billing_cycle,
                        price: subscription_invoice.total / 100,
                        start_date: current_period_start,
                        end_date: current_period_end,
                        status: subscription_billing_status,

                        card_detail_id: user_subscription_card_detail?.id,
                        stripe_subscription_id: subscription_invoice.subscription,
                        stripe_customer_id: subscription_invoice?.customer,
                        stripe_invoice_id: subscription_invoice.id,
                        stripe_invoice_number: subscription_invoice?.number,
                        stripe_invoice_pdf: subscription_invoice?.invoice_pdf,

                        created_by: temp_subscription?.user_id,
                    }

                    let current_user_subscription_billing = await models.UserSubscriptionBillings.create(subscription_billings);

                    if (subscription_create?.status === "active") {
                        //////////////////////////////////// Update User subscription Data
                        current_user_subscription.status = true;
                        current_user_subscription.is_expired = false;
                        current_user_subscription.end_date = current_user_subscription_billing?.end_date;
                        current_user_subscription.subscription_package_id = current_user_subscription_billing?.subscription_package_id;
                        current_user_subscription.billing_id = current_user_subscription_billing?.id;
                        current_user_subscription.billing_cycle = current_user_subscription_billing?.billing_cycle;
                        current_user_subscription.save();
                    }

                    //////////////////////////////////// Delete Temp Checkout data
                    await models.TempSubscription.destroy({
                        where: {
                            id: temp_subscription?.id,
                        },
                    });
                }


                res.status(200).send({ success: true });
                break;

            case "customer.subscription.updated":
                // send update to user that their plan has been updated
                let subscription_update = event.data.object;
                // console.log("StripeWebhook subscription_update -------------", subscription_update);


                res.status(200).send({ success: true });
                break;

            case "customer.subscription.deleted":
                // send update to user that their plan has been updated
                let subscription_deleted = event.data.object;
                // console.log("StripeWebhook subscription_deleted -------------", subscription_deleted);

                res.status(200).send({ success: true });
                break;

            case "invoice.paid":
                // send update to user about payment success for subscription
                let invoice_paid = event.data.object;
                console.log("StripeWebhook invoice_paid -------------", invoice_paid);

                // Get Current Store Subscription Billing
                let current_user_subscription_billing = await models.UserSubscriptionBillings.findOne({
                    where: {
                        stripe_subscription_id: invoice_paid?.subscription,
                    },
                });
                if (current_user_subscription_billing) {

                    //////////////////////////////////// Get Current Store Subscription
                    let current_user_subscription = await models.UserSubscriptions.findOne({
                        where: { user_id: current_user_subscription_billing?.user_id },
                    });

                    //////////////////////////////////// Update User subscription billing Data
                    current_user_subscription_billing.status = "Active";
                    current_user_subscription_billing.stripe_subscription_id = invoice_paid?.subscription;
                    current_user_subscription_billing.stripe_customer_id = invoice_paid?.customer;
                    current_user_subscription_billing.stripe_invoice_id = invoice_paid?.id;
                    current_user_subscription_billing.stripe_invoice_number = invoice_paid?.number;
                    current_user_subscription_billing.stripe_invoice_pdf = invoice_paid?.invoice_pdf;
                    current_user_subscription_billing.save();

                    //////////////////////////////////// Update User subscription Data
                    current_user_subscription.status = true;
                    current_user_subscription.is_expired = false;
                    current_user_subscription.end_date = current_user_subscription_billing?.end_date;
                    current_user_subscription.subscription_package_id = current_user_subscription_billing?.subscription_package_id;
                    current_user_subscription.billing_id = current_user_subscription_billing?.id;
                    current_user_subscription.billing_cycle = current_user_subscription_billing?.billing_cycle;
                    current_user_subscription.save();

                    //////////////////////////////////// Socket Initialize
                    let socketio = req.app.get("socketio");
                    socketio.emit("stripe_subscription_emit", {
                        success: true,
                        user_id: current_user_subscription?.user_id,
                    });
                }

                res.status(200).send({ success: true });
                break;

            default:
                res.status(200).send({ success: true });
                break;
        }
    } catch (error) {
        console.log("StripeWebhook error-----------", error);
        res.send({
            success: false,
            error: error.message,
            message: "stripe webhook error"
        });
    }
};