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
cron.schedule('*/10 * * * *', async () => {
    console.log("############################# Check User Subscriptions Exipres");

    let default_timezone = moment.tz.guess();
    let time = moment();
    console.log("Check User Subscriptions time---------", time);
    console.log("Check User Subscriptions default_timezone---------", default_timezone);

    try {

        let current_subscriptions = await models.UserSubscriptions.findAll({
            order: [['created_at', 'DESC']],
            where: {
                is_expired: false,
                end_date: { [Sq.Op.lte]: moment().toDate() }
            },
        });
        for (let current_subscription of current_subscriptions) {
            current_subscription.is_expired = true;
            current_subscription.save();

            /////////////////////////////////////////// after free trial if not paid
            if (current_subscription?.subscription_package_id === 1) {

                let user_detail = await models.Users.findOne({
                    where: {
                        id: current_subscription?.user_id
                    }
                });

                await models.RecoveryEmails.create({
                    email_to: user_detail?.email,
                    email_subject: `We're sad you didn't give us a chance`,
                    email_title: `We're sad you didn't give us a chance. We have so much to offer.`,
                    email_content: `
                        <p>Please let us know what influenced your decision. Drop us an email with a list of features crucial to your business. We will notify you once we configure them.</p>
    
                        <p><a href="mailto:support@checkout-master.com">Drop us an email</a></p>
                    `
                });
            }

        }

    } catch (error) {
        console.error("CronController error-------", error);
    }
});

/*****************************************
 ***** Check Custom Domina SSL Certificate Validation
*****************************************/
var https = require('https');
cron.schedule('*/10 * * * *', async () => {
    console.log("############################# Check Custom Domina SSL Certificate Validation");
    try {

        let custom_domains = await models.CustomDomain.findAll({
            where: {
                verification_status: "pending",
            },
        });
        for (let custom_domain of custom_domains) {

            var https_options = {
                host: custom_domain?.custom_domain,
                method: 'get',
                path: '/'
            };
            console.log("CronController check_domain_ssl https_options--------", https_options);

            var request = https.request(https_options, function (res) {
                if (res.statusCode === 200) {
                    console.log("custom_domain valid");

                    custom_domain.verification_status = "success";
                    custom_domain.save();
                }

                res.on('data', function (d) {
                    process.stdout.write(d);
                });
            });

            request.on('error', function (error) {
                console.log("CronController check_domain_ssl error--------", error.message);
            });

            request.end();
        }

    } catch (error) {
        console.error("CronController check_domain_ssl error-------", error);
    }
});