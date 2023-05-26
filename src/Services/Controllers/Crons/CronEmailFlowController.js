"use strict";

const fs = require("fs");
const Sq = require("sequelize");
const moment = require("moment");
const cron = require("node-cron");

const models = require("../../models");
const { SendEmail } = require("../../../libs/Helper");

//// Every 10 Second - */10 * * * * *
//// Every 1 mint - */10 * * * *
//// Every 3 hours - 0 0 */3 * * *
//// Every 5 hours - 0 0 */5 * * *

/*****************************************
 ***** All registered users that have 0 stores connected
*****************************************/
cron.schedule('*/10 * * * *', async () => {
    console.log("+++++++++++++++++++++++++++++ Cron 0 stores connected")

    try {
        let time_intervals = [
            { sent_time: 1, time_period: "hours" },
            { sent_time: 5, time_period: "hours" },
            { sent_time: 12, time_period: "hours" },
            { sent_time: 24, time_period: "hours" },
            { sent_time: 48, time_period: "hours" },
            { sent_time: 96, time_period: "hours" },
        ];

        let fresh_registrations = await models.Users.findAll({
            where: {
                store_count: 0,
                email_flow_status: { [Sq.Op.lt]: 6 },
                created_at: { [Sq.Op.lt]: moment().add(4, 'days').format() }
            }
        });
        for (let fresh_registration of fresh_registrations) {
            for (let time_interval_key in time_intervals) {

                let time_interval = time_intervals[time_interval_key];
                let time_difference = moment().diff(moment(fresh_registration?.created_at), time_interval?.time_period);
                console.log("fresh_registration time_difference--------", time_difference);

                /////////////////////////////////////////// 1 hour after registration
                if (parseFloat(fresh_registration?.email_flow_status) === 0) {
                    if (parseFloat(time_difference) === 1) {
                        console.log(" ##################### Enter 1 hour after registration ##################### ");

                        await models.RecoveryEmails.create({
                            email_to: fresh_registration?.email,
                            email_subject: `Thank you for your registration`,
                            email_title: `Thank you for your registration. It's time to connect your store.`,
                            email_content: `
                                <p>Once you're ready, follow our <a href="https://checkout-master.notion.site/Steps-needed-to-connect-Checkout-Master-to-your-Shopify-store-20caf64cc8b5422b856dfbc24212ea15">Guide</a> to connect your store to Checkout Master. Don't worry, your free trial will not start until you publish the checkout.</p>

                                <a class="email-a-link" href="${process.env.APP_URL}" target="_blank">Connect now!</a>
                            `
                        })

                        fresh_registration.email_flow_status = 1;
                        fresh_registration.save();
                        break;
                    }
                }

                /////////////////////////////////////////// 5 hours after
                if (parseFloat(fresh_registration?.email_flow_status) === 1) {
                    if (parseFloat(time_difference) === 5) {
                        console.log(" ##################### Enter 5 hour after registration ##################### ");

                        await models.RecoveryEmails.create({
                            email_to: fresh_registration?.email,
                            email_subject: `Connect your store`,
                            email_title: `It's time to connect your store.`,
                            email_content: `
                                <p>Enjoy all the Checkout Master features now. Follow our <a href="https://checkout-master.notion.site/Steps-needed-to-connect-Checkout-Master-to-your-Shopify-store-20caf64cc8b5422b856dfbc24212ea15">Guide</a> to connect your store. Don't worry, your free trial will not start until you publish the checkout.</p>

                                <a class="email-a-link" href="${process.env.APP_URL}" target="_blank">Connect now!</a>
                            `
                        })

                        fresh_registration.email_flow_status = 2;
                        fresh_registration.save();
                        break;
                    }
                }

                /////////////////////////////////////////// 12 hours after
                if (parseFloat(fresh_registration?.email_flow_status) === 2) {
                    if (parseFloat(time_difference) === 12) {
                        console.log(" ##################### Enter 12 hour after registration ##################### ");

                        await models.RecoveryEmails.create({
                            email_to: fresh_registration?.email,
                            email_subject: `Create a Private App in Shopify`,
                            email_title: `Create and connect a Private App in Shopify`,
                            email_content: `
                                <p>"If you haven't started the connection process yet, please do so as it is a necessary step to connect Checkout Master to your store.</p>

                                <p>If you need help, please follow the steps in our <a href="https://checkout-master.notion.site/Steps-needed-to-connect-Checkout-Master-to-your-Shopify-store-20caf64cc8b5422b856dfbc24212ea15">Guide</a>.</p>

                                <a class="email-a-link" href="${process.env.APP_URL}" target="_blank">Connect now!</a>
                            `
                        })

                        fresh_registration.email_flow_status = 3;
                        fresh_registration.save();
                        break;
                    }
                }

                /////////////////////////////////////////// 24 hours after
                if (parseFloat(fresh_registration?.email_flow_status) === 3) {
                    if (parseFloat(time_difference) === 24) {
                        console.log(" ##################### Enter 24 hour after registration ##################### ");

                        await models.RecoveryEmails.create({
                            email_to: fresh_registration?.email,
                            email_subject: `Ready to boost your sales?`,
                            email_title: `Ready to boost your sales? It's time to connect your store.`,
                            email_content: `
                                <p>Connect your store to Checkout Master and boost your sales with the most powerful and optimized checkout for Shopify.</p>

                                <a class="email-a-link" href="${process.env.APP_URL}" target="_blank">Connect now!</a>
                            `
                        })

                        fresh_registration.email_flow_status = 4;
                        fresh_registration.save();
                        break;
                    }
                }

                /////////////////////////////////////////// 48 hours after
                if (parseFloat(fresh_registration?.email_flow_status) === 4) {
                    if (parseFloat(time_difference) === 48) {
                        console.log(" ##################### Enter 48 hour after registration ##################### ");

                        await models.RecoveryEmails.create({
                            email_to: fresh_registration?.email,
                            email_subject: `Reduce abandoned checkouts with one app!`,
                            email_title: `Reduce abandoned checkouts with a one-page fully customized checkout`,
                            email_content: `
                                <p>Connect your store to Checkout Master and reduce abandoned checkouts with a one-page fully customized checkout</p>

                                <a class="email-a-link" href="${process.env.APP_URL}" target="_blank">Connect now!</a>
                            `
                        })

                        fresh_registration.email_flow_status = 5;
                        fresh_registration.save();
                        break;
                    }
                }

                /////////////////////////////////////////// 96 hours after
                if (parseFloat(fresh_registration?.email_flow_status) === 5) {
                    if (parseFloat(time_difference) === 96) {
                        console.log(" ##################### Enter 96 hour after registration ##################### ");

                        await models.RecoveryEmails.create({
                            email_to: fresh_registration?.email,
                            email_subject: `Is somethhing wrong`,
                            email_title: `It's time to connect your store.`,
                            email_content: `
                                <p>It seems you still haven't connected your store. Connect your store now to</p>

                                <a class="email-a-link" href="${process.env.APP_URL}" target="_blank">Connect now!</a>
                            `
                        })

                        fresh_registration.email_flow_status = 6;
                        fresh_registration.save();
                        break;
                    }
                }
            }
        };

        console.log("CronEmailFlowController----------------");
    } catch (error) {
        console.error("CronEmailFlowController cron error---------- ", error);
    }
});

/*****************************************
 ***** All registered users that have connected at least 1 store but havent published their checkout yet
*****************************************/
cron.schedule('*/10 * * * *', async () => {
    console.log("+++++++++++++++++++++++++++++ Cron Checkout unpublished");

    try {
        let time_intervals = [
            { sent_time: 1, time_period: "hours" },
            { sent_time: 5, time_period: "hours" },
            { sent_time: 12, time_period: "hours" },
            { sent_time: 24, time_period: "hours" },
            { sent_time: 48, time_period: "hours" },
            { sent_time: 96, time_period: "hours" },
        ];

        let unpublish_stores = await models.Stores.findAll({
            where: {
                store_token: { [Sq.Op.ne]: null },
                customize_checkout_publish: false,
                customize_checkout_publish_email_flow: { [Sq.Op.lt]: 6 },
                created_at: { [Sq.Op.lt]: moment().add(4, 'days').format() }
            },
            include: [
                {
                    model: models.Users,
                },
            ],
        });
        for (let unpublish_store of unpublish_stores) {
            for (let time_interval_key in time_intervals) {

                let time_interval = time_intervals[time_interval_key];
                let time_difference = moment().diff(moment(unpublish_store?.created_at), time_interval?.time_period);
                console.log("unpublish_store time_difference---------", time_difference);

                /////////////////////////////////////////// Instantly after publishing the checkout
                if (parseFloat(unpublish_store?.customize_checkout_publish_email_flow) === 0) {
                    if (parseFloat(time_difference) === 0) {

                        await models.RecoveryEmails.create({
                            email_to: unpublish_store?.user?.email,
                            email_subject: `You can now customize your checkout`,
                            email_title: `Thanks for connecting your store. You can now customize your checkout`,
                            email_content: `
                                <p>Customize your checkout in a couple of easy steps for a better checkout experience for your customers.</p>

                                <a class="email-a-link" href="${process.env.APP_URL}/${unpublish_store?.id}/customize-checkout" target="_blank">Customize your Checkout</a>
                            `
                        })

                        unpublish_store.customize_checkout_publish_email_flow = 1;
                        unpublish_store.save();
                        break;
                    }
                }

                /////////////////////////////////////////// 5 hour after registration
                if (parseFloat(unpublish_store?.customize_checkout_publish_email_flow) === 1) {
                    if (parseFloat(time_difference) === 5) {

                        await models.RecoveryEmails.create({
                            email_to: unpublish_store?.user?.email,
                            email_subject: `Skyrocket your conversion rate`,
                            email_title: `Customize your checkout. Skyrocket your conversion rate.`,
                            email_content: `
                                <p>Are you struggling with abandoned carts on your online store? Create a trusted checkout on your store's domain, add motivators and countdown and make sure your customers complete their purchase. Checkout Master offers easy customization of your checkout to support your branding and ensure your checkout meets customers' needs. Choose from our Library Templates and Skyrocket your conversion rate.</p>

                                <a class="email-a-link" href="${process.env.APP_URL}/${unpublish_store?.id}/customize-checkout" target="_blank">Go to Admin Panel</a>
                            `
                        })

                        unpublish_store.customize_checkout_publish_email_flow = 2;
                        unpublish_store.save();
                        break;
                    }
                }

                /////////////////////////////////////////// 12 hour after registration
                if (parseFloat(unpublish_store?.customize_checkout_publish_email_flow) === 2) {
                    if (parseFloat(time_difference) === 12) {

                        await models.RecoveryEmails.create({
                            email_to: unpublish_store?.user?.email,
                            email_subject: `Boost your revenue with post-purchase upsells`,
                            email_title: `Add post-purchase upsells to your store. Boost your revenue.`,
                            email_content: `
                                <p>Post-purchase upsell feature allows you to offer an upsell to customers after they complete their order. Persuade shoppers to buy more by showing the upsell at just the right time. Since the customer has already added their shipping and payment information, they can buy additional products with one click and get charged automatically.</p>

                                <a class="email-a-link" href="${process.env.APP_URL}/${unpublish_store?.id}/customize-checkout" target="_blank">Boost your revenue</a>
                            `
                        })

                        unpublish_store.customize_checkout_publish_email_flow = 3;
                        unpublish_store.save();
                        break;
                    }
                }

                /////////////////////////////////////////// 24 hour after registration
                if (parseFloat(unpublish_store?.customize_checkout_publish_email_flow) === 3) {
                    if (parseFloat(time_difference) === 24) {

                        await models.RecoveryEmails.create({
                            email_to: unpublish_store?.user?.email,
                            email_subject: `Integrate the most popular payment methods`,
                            email_title: `Offer your customers their preferred method of payment.`,
                            email_content: `
                                <p>Reduce cart abandonment by offering your customers' preferred method of payment. Checkout Master supports the most popular payment methods for your online store like Stripe, Checkout.com, Revolut and ApplePay. And you don't need any plugins to connect it. </p>

                                <a class="email-a-link" href="${process.env.APP_URL}/${unpublish_store?.id}/customize-checkout" target="_blank">Go to Admin Panel</a>
                            `
                        })

                        unpublish_store.customize_checkout_publish_email_flow = 4;
                        unpublish_store.save();
                        break;
                    }
                }

                /////////////////////////////////////////// 48 hour after registration
                if (parseFloat(unpublish_store?.customize_checkout_publish_email_flow) === 4) {
                    if (parseFloat(time_difference) === 48) {

                        await models.RecoveryEmails.create({
                            email_to: unpublish_store?.user?.email,
                            email_subject: `Boost your sales with Checkout Master`,
                            email_title: `Small changes can have a great impact on your sales. Boost your sales with Checkout Master.`,
                            email_content: `
                                <p>Try the Checkout Master features to boost your Shopify store AOV and conversions.</p>

                                <a class="email-a-link" href="${process.env.APP_URL}/${unpublish_store?.id}/customize-checkout" target="_blank">Boost your Sales</a>
                            `
                        })

                        unpublish_store.customize_checkout_publish_email_flow = 5;
                        unpublish_store.save();
                        break;
                    }
                }

                /////////////////////////////////////////// 96 hour after registration
                if (parseFloat(unpublish_store?.customize_checkout_publish_email_flow) === 5) {
                    if (parseFloat(time_difference) === 96) {

                        await models.RecoveryEmails.create({
                            email_to: unpublish_store?.user?.email,
                            email_subject: `Don’t let your customers slip away`,
                            email_title: `Don’t let your customers slip away. Re-engage with them!`,
                            email_content: `
                                <p>Don’t let your customers slip away, re-engage with them! Sending out follow up emails is the best way to remind your customers about yourself. With Checkout Master you can easily set up and customize your Cart Recovery Emails.</p>

                                <a class="email-a-link" href="${process.env.APP_URL}/${unpublish_store?.id}/customize-checkout" target="_blank">Go to Admin Panel</a>
                            `
                        })

                        unpublish_store.customize_checkout_publish_email_flow = 6;
                        unpublish_store.save();
                        break;
                    }
                }
            }
        }
    } catch (error) {
        console.error("CronEmailFlowController cron error---------- ", error);
    }
});

/*****************************************
 ***** All registered users that have published at least 1 store checkout
*****************************************/
cron.schedule('*/10 * * * *', async () => {
    console.log("+++++++++++++++++++++++++++++ published at least 1 store checkout");

    try {
        let time_intervals = [
            { sent_time: 12, time_period: "hours" },
            { sent_time: 48, time_period: "hours" },
            { sent_time: 96, time_period: "hours" },
            { sent_time: 144, time_period: "hours" },
        ];

        let first_publish_stores = await models.Users.findAll({
            where: {
                first_store_publish_id: { [Sq.Op.ne]: null },
                first_store_publish_email_flow: { [Sq.Op.lt]: 6 },
                first_store_publish_date: { [Sq.Op.lt]: moment().add(6, 'days').format() }
            },
        });
        for (let first_publish_store of first_publish_stores) {
            for (let time_interval_key in time_intervals) {

                let time_interval = time_intervals[time_interval_key];
                let time_difference = moment().diff(moment(first_publish_store?.first_store_publish_date), time_interval?.time_period);
                console.log("first_publish_store time_difference---------", time_difference);

                /////////////////////////////////////////// Instantly after publishing the checkout
                if (parseFloat(first_publish_store?.first_store_publish_email_flow) === 0) {
                    if (parseFloat(time_difference) === 0) {

                        await models.RecoveryEmails.create({
                            email_to: first_publish_store?.email,
                            email_subject: `Your checkout is now live`,
                            email_title: `Thanks for finishing the setup. Your checkout is now live. Enjoy all the features.`,
                            email_content: `
                                <p>You are on your way to increase your online store conversion rate. Hold on tight and enjoy the ride.</p>

                                <a class="email-a-link" href="${process.env.APP_URL}/${first_publish_store?.first_store_publish_id}/dashboard" target="_blank">Go to Admin Panel</a>
                            `
                        })

                        first_publish_store.first_store_publish_email_flow = 3;
                        first_publish_store.save();
                        break;
                    }
                }

                /////////////////////////////////////////// 48 hour after registration
                if (parseFloat(first_publish_store?.first_store_publish_email_flow) === 4) {
                    if (parseFloat(time_difference) === 48) {

                        await models.RecoveryEmails.create({
                            email_to: first_publish_store?.email,
                            email_subject: `Persuade shoppers to buy more`,
                            email_title: `Persuade shoppers to buy more. Discover the Upsells feature.`,
                            email_content: `
                                <p>Persuade shoppers to buy more by showing the upsell at just the right time. Since the customer has already added their shipping and payment information, they can buy additional products with one click and get charged automatically.</p>

                                <a class="email-a-link" href="${process.env.APP_URL}/${first_publish_store?.first_store_publish_id}/customize-checkout" target="_blank">Go to Admin Panel</a>
                            `
                        })

                        first_publish_store.first_store_publish_email_flow = 5;
                        first_publish_store.save();
                        break;
                    }
                }

                /////////////////////////////////////////// 96 hour after registration
                if (parseFloat(first_publish_store?.first_store_publish_email_flow) === 5) {
                    if (parseFloat(time_difference) === 96) {

                        await models.RecoveryEmails.create({
                            email_to: first_publish_store?.email,
                            email_subject: `Try our Plug & Play templates`,
                            email_title: `Plug & Play templates. Easy to use and respecting your brand identity.`,
                            email_content: `
                                <p>Checkout Master offers Plug & Play templates for your online store. Easy to use and respecting your brand identity. Explore our templates library and chose a checkout that simply works.</p>

                                <a class="email-a-link" href="${process.env.APP_URL}/${first_publish_store?.first_store_publish_id}/customize-checkout" target="_blank">Go to Admin Panel</a>
                            `
                        })

                        first_publish_store.first_store_publish_email_flow = 6;
                        first_publish_store.save();
                        break;
                    }
                }

                /////////////////////////////////////////// 144 hour (6 days after) after registration
                if (parseFloat(first_publish_store?.first_store_publish_email_flow) === 6) {
                    if (parseFloat(time_difference) === 144) {

                        await models.RecoveryEmails.create({
                            email_to: first_publish_store?.email,
                            email_subject: `How is it going so far?`,
                            email_title: `Elevate your conversion rates. Skyrocket your sales.`,
                            email_content: `
                                <p>Checkout Master is used by thousands of online stores to elevate their conversion rates and skyrocket their sales with higher AOV and zero effort. Visit our Help Center to learn about all the features for boosting your sales.</p>

                                <a class="email-a-link" href="${process.env.APP_URL}/${first_publish_store?.first_store_publish_id}/customize-checkout" target="_blank">Go to Admin Panel</a>
                            `
                        })

                        first_publish_store.first_store_publish_email_flow = 7;
                        first_publish_store.save();
                        break;
                    }
                }

            }
        }
    } catch (error) {
        console.error("CronEmailFlowController cron error---------- ", error);
    }
});

/*****************************************
 ***** Send Recovery Email's
*****************************************/
cron.schedule('*/10 * * * *', async () => {
    try {

        let recovery_emails = await models.RecoveryEmails.findAll({
            order: [['created_at', 'ASC']],
        });
        for (let recovery_email of recovery_emails) {

            let email_parametars = {
                HOME_URL: `${process.env.APP_URL}`,
                email_title: recovery_email?.email_title,
                email_content: recovery_email?.email_content,
            };
            let email_template_html = await fs.readFileSync(`${appRoot}/views/email-templates/EmailFlowTemplate.html`, "utf8");
            email_template_html = email_template_html.replace(/HOME_URL|email_title|email_content/gi, function (matched) {
                return email_parametars[matched];
            });

            let mail_options = {
                to: recovery_email?.email_to,
                html: email_template_html,
                subject: recovery_email?.email_subject,
                from: `${process.env.MAIL_FROM_NAME} <${process.env.MAIL_FROM_ADDRESS}>`,
            };
            SendEmail(mail_options).then((info) => {
                console.log("CronEmailFlowController Nodemailer Email sent -------------------- ", info);
            }).catch((error) => {
                console.log("CronEmailFlowController Nodemailer error ---------- ", error);
            });

            //////////////////////////////////// Delete Revords From RecoveryEmails Table
            await models.RecoveryEmails.destroy({
                where: {
                    id: recovery_email?.id,
                },
            });
        }

    } catch (error) {
        console.error("CronEmailFlowController cron error---------- ", error);
    }
});
