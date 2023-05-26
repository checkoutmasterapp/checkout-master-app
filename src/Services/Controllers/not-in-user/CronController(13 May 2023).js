"use strict";

const Sq = require("sequelize");
const moment = require("moment");
const cron = require("node-cron");

const models = require("../../models");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

//// Every 10 Second - */10 * * * * *
//// Every 1 mint - */1 * * * *
//// Every 3 hours - 0 0 */3 * * *
//// Every 5 hours - 0 0 */5 * * *

/*****************************************
 ***** Check User Subscriptions Exipres
*****************************************/
cron.schedule('*/10 * * * * *', async () => {
    let default_timezone = moment.tz.guess();
    let time = moment();
    console.log("Check User Subscriptions time---------", time);
    console.log("Check User Subscriptions default_timezone---------", default_timezone);

    console.log("############################# Check User Subscriptions Exipres");
    try {
        let current_subscriptions = await models.UserSubscriptions.findAll({
            where: {
                end_date: { [Sq.Op.lte]: moment().toDate() },
            },
            order: [['created_at', 'DESC']],
        });
        console.log("Check User Subscriptions current_subscriptions---------", current_subscriptions);
        // for (let current_subscription of current_subscriptions) {
        //     current_subscription.is_expired = true;

        //     if (current_subscription?.status === true) {
        //         let subscription_type = "new";
        //         let next_subscription = await models.UserSubscriptionBillings.findOne({
        //             where: {
        //                 status: "Pending",
        //                 store_id: current_subscription?.store_id,
        //             }
        //         });

        //         if (!next_subscription) {
        //             subscription_type = "existing";
        //             next_subscription = await models.UserSubscriptionBillings.findOne({
        //                 where: {
        //                     status: "Active",
        //                     store_id: current_subscription?.store_id,
        //                 },
        //                 order: [['created_at', 'DESC']],
        //             });
        //         }

        //         if (next_subscription) {
        //             const user = await models.Users.findOne({
        //                 where: {
        //                     id: current_subscription?.user_id,
        //                 },
        //             });

        //             if (!user) {
        //                 return
        //             }

        //             if (!user?.stripe_customer_id) {
        //                 return
        //             }

        //             let subscription_package = await models.SubscriptionPackage.findOne({
        //                 where: {
        //                     is_freetrail: false,
        //                     id: next_subscription.subscription_package_id,
        //                 },
        //             });
        //             if (subscription_package) {
        //                 let { price, billing_cycle, revenue_amount, revenue_type } = subscription_package;

        //                 const endTime = moment().toDate();
        //                 const startTime = moment().subtract(1, billing_cycle).toDate()
        //                 const revenue_checkouts = await models.Checkouts.findAll({
        //                     where: {
        //                         is_purchase: true,
        //                         revenue_charge: false,
        //                         shop_id: current_subscription?.store_id,
        //                     },
        //                 });

        //                 let store_revenue = 0;
        //                 if (revenue_checkouts && revenue_checkouts.length) {
        //                     revenue_checkouts.forEach(async (checkout) => {
        //                         let purchaseAmount = parseFloat(checkout?.price)
        //                         store_revenue += purchaseAmount;
        //                     })
        //                 }

        //                 if (revenue_amount && revenue_type && revenue_type === 'percentage') {
        //                     store_revenue = (parseFloat(store_revenue) * parseFloat(revenue_amount)) / 100
        //                     price = parseFloat(price) + parseFloat(store_revenue);
        //                 }

        //                 let { stripe_customer_id } = user
        //                 let stripe_charge_response = await stripe.charges.create({
        //                     currency: "usd",
        //                     amount: parseFloat(price.toFixed(2)) * 100,
        //                     customer: stripe_customer_id,
        //                 });


        //                 if (stripe_charge_response?.status === "succeeded") {
        //                     let start_date = moment().format("YYYY-MM-DD");
        //                     let end_date = moment(start_date).add(1, subscription_package.billing_cycle).format("YYYY-MM-DD");

        //                     current_subscription.status = true;
        //                     current_subscription.is_expired = false;
        //                     current_subscription.end_date = end_date;
        //                     current_subscription.billing_cycle = subscription_package.billing_cycle;

        //                     if (subscription_type === "new") {
        //                         next_subscription.price = price.toFixed(2);
        //                         next_subscription.revenue_amount = store_revenue.toFixed(2);
        //                         next_subscription.stripe_invoice_id = stripe_charge_response?.receipt_url;

        //                         next_subscription.start_date = start_date;
        //                         next_subscription.end_date = end_date;

        //                         next_subscription.status = "Active";
        //                         next_subscription.save();
        //                     } else {

        //                         const today = moment().format("DD-MM-YYYY")
        //                         let stripe_invoice_number = `${subscription_package?.id}-${user?.id}-${today}`;

        //                         await models.UserSubscriptionBillings.create({
        //                             user_id: next_subscription?.user_id,
        //                             store_id: next_subscription?.store_id,
        //                             subscription_package_id: subscription_package?.id,
        //                             billing_cycle: next_subscription?.billing_cycle,

        //                             price: price.toFixed(2),
        //                             revenue_amount: store_revenue.toFixed(2),
        //                             start_date: start_date,
        //                             end_date: end_date,

        //                             card_detail_id: next_subscription?.card_detail_id,
        //                             stripe_customer_id: stripe_customer_id,
        //                             stripe_invoice_number: stripe_invoice_number,
        //                             stripe_invoice_id: stripe_charge_response?.receipt_url,
        //                             status: "Active"
        //                         });
        //                     }

        //                     for (let revenue_checkout of revenue_checkouts) {
        //                         revenue_checkout.revenue_charge = true;
        //                         revenue_checkout.save();
        //                     }

        //                     current_subscription.subscription_package_id = subscription_package?.id;
        //                 }
        //             }
        //         }
        //     }

        //     current_subscription.save();
        // }
    } catch (error) {
        console.error("CronController error-------", error);
    }
});

/*****************************************
 ***** Pending Custom Domain Verification
*****************************************/
// cron.schedule("0 0 */5 * * *", async () => {
//     try {

//         let custom_domains = await models.CustomDomain.findAll({
//             where: {
//                 verification_status: "pending"
//             },
//         });
//         if (custom_domains) {
//             custom_domains.forEach(async (custom_domain) => {

//                 let store_custom_domain = custom_domain?.custom_domain;
//                 store_custom_domain = `https://${store_custom_domain}`;

//                 let request_options = { method: "GET", url: store_custom_domain };
//                 await request(request_options, function (error, response) {
//                     console.log("=============================================");
//                     console.log("custom_domain error ---------", error?.message);
//                     console.log("custom_domain response ---------", response?.statusCode);
//                     if (response?.statusCode === 200) {
//                         custom_domain.verification_status = "success";
//                         custom_domain.save();
//                     }
//                 });
//             })
//         }

//     } catch (error) {
//         console.error("custom_domain verification error----------", error);
//     }
// });