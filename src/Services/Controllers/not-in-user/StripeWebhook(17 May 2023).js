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
                console.log("subscription plan has been updated for the user:::::::::::::::: ", subscriptionUpdate);
                console.log("subscription plan has been updated for the user: ", subscriptionUpdate.id);

                res.status(200).send({ success: true });
                break;

            case "customer.subscription.deleted":
                // send update to user that their plan has been updated
                let subscription_deleted = event.data.object;
                // console.log("StripeWebhook customer.subscription.deleted subscription_deleted-------------", subscription_deleted)
                // if(subscription_deleted){
                //     // Get Current Store Subscription Billing
                //     let user_subscription_billings = await models.UserSubscriptionBillings.findOne({
                //         where: { stripe_subscription_id: subscription_deleted.id }
                //     });

                //     if(user_subscription_billings){
                //         await models.UserSubscriptionBillings.update({
                //             status: "Inactive",
                //         }, {
                //             where: {
                //                 stripe_invoice_id: invoice.id,
                //                 stripe_subscription_id: subscription.stripe_subscription_id
                //             }
                //         });
                //     }
                //     res.status(200).send({ success: true });
                // }
                break;

            case "invoice.created":
                // send update to user about payment success for subscription
                let invoice_created = event.data.object;
                // console.log("StripeWebhook invoice.created invoice_created -------------", invoice_created)

                res.status(200).send({ success: true });
                break;

            // case "invoice.payment_succeeded":
            //     let invoice_created = event.data.object;
            //     // console.log("StripeWebhook invoice.created invoice_created -------------", invoice_created)

            //     res.status(200).send({ success: true });
            //     break;
            case "invoice.paid":
                // send update to user about payment success for subscription
                let invoice = event.data.object;
                console.log("StripeWebhook invoice.paid invoice -------------", invoice);

                let temp_subscription = await models.TempSubscription.findOne({
                    where: {
                        subscription_id: invoice.subscription
                    }
                });
                console.log("StripeWebhook invoice.paid temp_subscription -------------", temp_subscription);

                
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
                }else{
                    // for future subscription handle *dheeraj

                    //////////////////////////////////// Create User Subscriptions Billing Details
                    await models.UserSubscriptionBillingDetails.create({
                        user_id: temp_subscription?.user_id,
                        store_id: request_body?.store_id,
                        subscription_package_id: subscription_package?.id,
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

                    //////////////////////////////////// Create User Subscription Billings
                    let subscription_billings = {
                        user_id: temp_subscription?.user_id,
                        store_id: temp_subscription?.store_id,
                        user_subscription_id: current_user_subscription?.id,
                        subscription_package_id: subscription_package?.id,
                        billing_cycle: subscription_package?.billing_cycle,
                        price: invoice.total / 100,
                        start_date: start_date,
                        end_date: end_date,
                        status: 'Pending',

                        // card_detail_id: user_subscription_card_detail?.id,
                        stripe_subscription_id: invoice.subscription,
                        stripe_customer_id: invoice?.customer,
                        stripe_invoice_id: invoice.id,
                        stripe_invoice_number: invoice?.number,
                        stripe_invoice_pdf: invoice?.invoice_pdf,

                        created_by: temp_subscription?.user_id,
                    }
                    let user_subscription_billing = await models.UserSubscriptionBillings.create(subscription_billings);
                    console.log("StripeWebhook invoice.paid subscription_billings -------------", subscription_billings);

                    current_user_subscription.status = true;
                    current_user_subscription.is_expired = false;
                    current_user_subscription.save();

                    console.log("process stop because no charge");
                    res.status(200).send({ success: true });
                    break;
                }

                if (temp_subscription) {
                    let request_body = temp_subscription?.request_body;
                    let package_detail = temp_subscription?.package_detail;

                    //////////////////////////////////// Get Current Store Subscription
                    let current_user_subscription = await models.UserSubscriptions.findOne({
                        where: { store_id: temp_subscription?.store_id },
                    });

                    // Get Current Store Subscription Billing
                    let user_subscription_billings = await models.UserSubscriptionBillings.findOne({
                        order: [["id", "DESC"]],
                        where: { store_id: temp_subscription?.store_id },
                    });
                    
                    //////////////////////////////////// Get Subsccription Package Details
                    let subscription_package = await models.SubscriptionPackage.findOne({
                        where: {
                            id: request_body.subscription_package,
                        },
                    });

                    //////////////////////////////////// Stripe Create Subscription
                    let start_date = moment().format("YYYY-MM-DD");
                    let end_date = moment(start_date).add(1, subscription_package.billing_cycle).format("YYYY-MM-DD");
                    if (
                        current_user_subscription
                        && (current_user_subscription?.status === true || current_user_subscription?.is_expired === false)
                    ) {
                        start_date = moment(current_user_subscription?.end_date).add(1, "days").format("YYYY-MM-DD");
                        end_date = moment(current_user_subscription?.end_date).add(1, subscription_package.billing_cycle).add(1, "days").format("YYYY-MM-DD");
                    }
                    

                    console.log("StripeWebhook invoice.paid start_date -------------", start_date);
                    console.log("StripeWebhook invoice.paid end_date -------------", end_date);

                    //////////////////////////////////// Create User Subscriptions Billing Details
                    await models.UserSubscriptionBillingDetails.create({
                        user_id: temp_subscription?.user_id,
                        store_id: request_body?.store_id,
                        subscription_package_id: subscription_package?.id,
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

                    //////////////////////////////////// Create User Subscriptions Card Details
                    // let user_subscription_card_detail = await models.UserSubscriptionCardDetails.create({
                    //     user_id: temp_subscription?.user_id,
                    //     store_id: temp_subscription?.store_id,
                    //     stripe_customer_id: stripe_customer_id,
                    //     stripe_card_id: stripe_card_id,
                    //     stripe_card_last4: stripe_card_last4,
                    //     exp_month: exp_month,
                    //     exp_month: exp_month,
                    //     exp_year: exp_year,
                    //     stripe_card_brand: stripe_card_brand,
                    //     created_by: temp_subscription?.user_id,
                    // });

                    //////////////////////////////////// Get User Subscriptions Card Details *dheeraj
                    let user_subscription_card_detail = await models.UserSubscriptionCardDetails.findOne({
                        where: {
                            stripe_card_id: stripe_card_id
                        },
                    });

                    //////////////////////////////////// Create User Subscription Billings
                    let subscription_billings = {
                        user_id: temp_subscription?.user_id,
                        store_id: temp_subscription?.store_id,
                        user_subscription_id: current_user_subscription?.id,
                        subscription_package_id: subscription_package?.id,
                        billing_cycle: subscription_package?.billing_cycle,
                        price: invoice.total / 100,
                        start_date: start_date,
                        end_date: end_date,
                        status: 'Active',

                        card_detail_id: user_subscription_card_detail?.id,
                        stripe_subscription_id: invoice.subscription,
                        stripe_customer_id: invoice?.customer,
                        stripe_invoice_id: invoice.id,
                        stripe_invoice_number: invoice?.number,
                        stripe_invoice_pdf: invoice?.invoice_pdf,

                        created_by: temp_subscription?.user_id,
                    }
                    let user_subscription_billing = await models.UserSubscriptionBillings.create(subscription_billings);
                    console.log("StripeWebhook invoice.paid subscription_billings -------------", subscription_billings);

                    current_user_subscription.status = true;
                    current_user_subscription.is_expired = false;
                    current_user_subscription.end_date = end_date;
                    current_user_subscription.subscription_package_id = subscription_package?.id;
                    current_user_subscription.billing_id = user_subscription_billing?.id;
                    current_user_subscription.billing_cycle = user_subscription_billing?.billing_cycle;
                    current_user_subscription.save();

                    // Delete Temp Checkout data
                    await models.TempSubscription.destroy({
                        where: {
                            id: temp_subscription?.id
                        }
                    });
                }else{

                    // Get Current Store Subscription Billing
                    let subscription = await models.UserSubscriptionBillings.findOne({
                        where: { 
                            stripe_subscription_id: invoice.subscription,
                        },
                    });

                    //////////////////////////////////// Get Current Store Subscription
                    let current_user_subscription = await models.UserSubscriptions.findOne({
                        where: { store_id: subscription?.store_id },
                    });
                    
                    console.log('subscription ::::::::::::::::', subscription)
                    if(subscription.status == "Pending"){
                        console.log('subscription.status  :::::::::::::::', subscription.status )
                       
                        //////////////////////////////////// Get User Subscriptions Card Details *dheeraj
                        let user_subscription_card_detail = await models.UserSubscriptionCardDetails.findOne({
                            where: {
                                stripe_card_id: stripe_card_id
                            },
                        });
                        current_user_subscription.status = true;
                        current_user_subscription.is_expired = false;
                        current_user_subscription.end_date = end_date;
                        current_user_subscription.subscription_package_id = subscription_package?.id;
                        current_user_subscription.billing_id = subscription?.id;
                        current_user_subscription.billing_cycle = subscription?.billing_cycle;

                        await models.UserSubscriptionBillings.update({
                            status: "Active",
                            price: invoice.total / 100,
                            start_date: start_date,
                            end_date: end_date,
                            stripe_invoice_id: invoice.id,
                            stripe_invoice_number: invoice?.number,
                            stripe_invoice_pdf: invoice?.invoice_pdf,
                            card_detail_id: user_subscription_card_detail?.id,
                        }, {
                            where: {
                                stripe_subscription_id: invoice.subscription
                            }
                        });

                        current_user_subscription.save();

                    }else if(subscription.status == "Active"){
                        //////////////////////////////////// Create User Subscriptions Billing Details
                        await models.UserSubscriptionBillingDetails.create({
                            user_id: subscription?.user_id,
                            store_id: subscription?.store_id,
                            subscription_package_id: subscription?.subscription_package_id,
                            billing_company: subscription?.billing_company,
                            billing_first_name: subscription?.billing_first_name,
                            billing_last_name: subscription?.billing_last_name,
                            billing_address: subscription?.billing_address,
                            billing_city: subscription?.billing_city,
                            billing_zip: subscription?.billing_zip,
                            billing_state: subscription?.billing_state,
                            billing_country_code: subscription?.billing_country_code,
                            user_subscription_id: current_user_subscription?.id,
                        });

                        //////////////////////////////////// Get User Subscriptions Card Details *dheeraj
                        let user_subscription_card_detail = await models.UserSubscriptionCardDetails.findOne({
                            where: {
                                stripe_card_id: stripe_card_id
                            },
                        });

                        //////////////////////////////////// Create User Subscription Billings
                        let subscription_billings = {
                            user_id: subscription?.user_id,
                            store_id: subscription?.store_id,
                            user_subscription_id: current_user_subscription?.id,
                            subscription_package_id: subscription?.subscription_package_id,
                            billing_cycle: subscription?.billing_cycle,
                            price: invoice.total / 100,
                            start_date: start_date,
                            end_date: end_date,
                            status: 'Active',

                            card_detail_id: user_subscription_card_detail?.id,
                            stripe_subscription_id: invoice.subscription,
                            stripe_customer_id: invoice?.customer,
                            stripe_invoice_id: invoice.id,
                            stripe_invoice_number: invoice?.number,
                            stripe_invoice_pdf: invoice?.invoice_pdf,

                            created_by: subscription?.user_id,
                        }
                        let user_subscription_billing = await models.UserSubscriptionBillings.create(subscription_billings);
                        console.log("StripeWebhook invoice.paid subscription_billings -------------", subscription_billings);

                        current_user_subscription.status = true;
                        current_user_subscription.is_expired = false;
                        current_user_subscription.end_date = end_date;
                        current_user_subscription.subscription_package_id = subscription?.subscription_package_id;
                        current_user_subscription.billing_id = user_subscription_billing?.id;
                        current_user_subscription.billing_cycle = user_subscription_billing?.billing_cycle;
                        current_user_subscription.save();

                    }

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