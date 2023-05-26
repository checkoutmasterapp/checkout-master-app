const moment = require("moment");

const models = require("../../models");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret = "whsec_8a0f1441a02c418de34865c2684786ccebcefec65abd3c21ebb98b00391f804b";

module.exports.StripeWebhook = async (req, res) => {
    const sig = req.header("stripe-signature");

    try {
        let event = req.body;

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
                let trialEnd = event.data.object;
                // console.log("trial end for the user: ", trialEnd);

                res.status(200).send({ success: true });
                break;

            case "customer.subscription.updated":
                // send update to user that their plan has been updated
                let subscriptionUpdate = event.data.object;
                // console.log("subscription plan has been updated for the user: ", subscriptionUpdate.id);

                res.status(200).send({ success: true });
                break;

            case "customer.subscription.deleted":
                // send update to user that their plan has been updated
                let subscription_deleted = event.data.object;
                // console.log("StripeWebhook customer.subscription.deleted subscription_deleted-------------", subscription_deleted)

                res.status(200).send({ success: true });
                break;

            case "invoice.created":
                // send update to user about payment success for subscription
                let invoice_created = event.data.object;
                // console.log("StripeWebhook invoice.created invoice_created -------------", invoice_created)

                res.status(200).send({ success: true });
                break;

            case "invoice.paid":
                // send update to user about payment success for subscription
                let invoice = event.data.object;
                console.log("StripeWebhook invoice.paid invoice -------------", invoice);

                ///////////////////////////// Get Subsciption Charge Details Start
                let stripe_card_last4, stripe_card_brand, stripe_card_id, stripe_customer_id, exp_month, exp_year;
                if (invoice?.charge) {
                    let charge_detail = await stripe.charges.retrieve(invoice.charge);
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
                        subscription_id: invoice.subscription
                    }
                });
                console.log("StripeWebhook invoice.paid temp_subscription -------------", temp_subscription);

                let request_body = temp_subscription?.request_body;
                let package_detail = temp_subscription?.package_detail;

                // Get Current Store Subscription
                let user_subscription = await models.UserSubscriptions.findOne({
                    where: {
                        user_id: temp_subscription?.id,
                        store_id: temp_subscription?.store_id,
                    }
                });

                // Get Current Store Subscription Billing
                let user_subscription_billings = await models.UserSubscriptionBillings.findOne({
                    where: {
                        user_id: temp_subscription?.id,
                        store_id: temp_subscription?.store_id,
                    },
                    order: [["id", "DESC"]],
                });


                let start_date = moment().format("YYYY-MM-DD");
                let end_date = moment(start_date).add(1, package_detail.billing_cycle).format("YYYY-MM-DD");
                if (user_subscription_billings) {
                    start_date = moment(user_subscription_billings?.end_date).add(1, 'days').format("YYYY-MM-DD");
                    end_date = moment(user_subscription_billings?.end_date).add(1, package_detail.billing_cycle).add(1, 'days').format("YYYY-MM-DD");
                }

                /*** Create User Subscriptions If Not Exist ***/
                if (!user_subscription) {
                    user_subscription = await models.UserSubscriptions.create({
                        user_id: temp_subscription?.user_id,
                        store_id: temp_subscription?.store_id,
                        subscription_package_id: package_detail?.id,
                        billing_cycle: package_detail?.billing_cycle,
                        start_date: start_date,
                        end_date: end_date,
                        created_by: temp_subscription?.user_id,
                    });
                }

                /*** Create User Subscriptions Billing Details ***/
                await models.UserSubscriptionBillingDetails.create({
                    user_id: temp_subscription?.user_id,
                    store_id: temp_subscription?.store_id,
                    user_subscription_id: user_subscription?.id,
                    subscription_package_id: package_detail?.id,
                    billing_company: request_body?.billing_company,
                    billing_first_name: request_body?.billing_first_name,
                    billing_last_name: request_body?.billing_last_name,
                    billing_address: request_body?.billing_address,
                    billing_city: request_body?.billing_city,
                    billing_zip: request_body?.billing_zip,
                    billing_state: request_body?.billing_state,
                    billing_country_code: request_body?.billing_country_code,
                    created_by: temp_subscription?.user_id,
                });

                /*** Create User Subscriptions Card Details ***/
                let user_subscription_card_detail = await models.UserSubscriptionCardDetails.create({
                    user_id: temp_subscription?.user_id,
                    store_id: temp_subscription?.store_id,
                    stripe_customer_id: stripe_customer_id,
                    stripe_card_id: stripe_card_id,
                    stripe_card_last4: stripe_card_last4,
                    exp_month: exp_month,
                    exp_month: exp_month,
                    exp_year: exp_year,
                    stripe_card_brand: stripe_card_brand,
                    created_by: temp_subscription?.user_id,
                });

                /*** Create User Subscription Billings*/
                let user_subscription_billings_create = {
                    user_id: temp_subscription?.user_id,
                    store_id: temp_subscription?.store_id,
                    user_subscription_id: user_subscription?.id,
                    subscription_package_id: package_detail?.id,
                    billing_cycle: package_detail?.billing_cycle,
                    price: invoice.total / 100,
                    start_date: start_date,
                    end_date: end_date,
                    status: "Active",

                    card_detail_id: user_subscription_card_detail?.id,
                    stripe_subscription_id: invoice.subscription,
                    stripe_customer_id: invoice?.customer,
                    stripe_invoice_id: invoice.id,
                    stripe_invoice_number: invoice?.number,
                    stripe_invoice_pdf: invoice?.invoice_pdf,

                    created_by: temp_subscription?.user_id,
                }
                if (user_subscription_billings) {
                    user_subscription_billings_create.status = "Inactive";
                }
                let user_subscription_billing = await models.UserSubscriptionBillings.create(user_subscription_billings_create);

                user_subscription.billing_id = user_subscription_billing?.id;
                user_subscription.save();

                /////////////////////////// Add Forever discount to the subsciption  start
                // Get Forever Discount from Database
                let subscription_discount = await models.SubscriptionDiscount.findOne({
                    where: {
                        name: "Forever Discount",
                    },
                });
                let discount_coupon_id;
                if (subscription_discount) {
                    discount_coupon_id = subscription_discount?.stripe_discount_id
                }
                // Subscription update
                const susbscription_update = await stripe.subscriptions.update(
                    invoice.subscription,
                    {
                        coupon: discount_coupon_id
                    }
                );
                console.log("StripeWebhook invoice.paid susbscription_update -------------", susbscription_update);
                /////////////////////////// Add Forever discount to the subsciption End


                //// Update Billing Details in Store Table
                if (!user_subscription_billings) {
                    await models.Stores.update(
                        {
                            user_subscription_id: user_subscription?.id,
                            updated_by: temp_subscription?.user_id,
                        },
                        {
                            where: {
                                id: temp_subscription?.store_id,
                            },
                        }
                    );
                }

                res.status(200).send({ success: true });
                break;

            default:
                res.status(200).send({ success: true });
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