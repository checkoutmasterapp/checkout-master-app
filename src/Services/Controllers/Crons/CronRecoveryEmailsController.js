"use strict";

const fs = require("fs");
const Sq = require("sequelize");
const moment = require('moment');
const cron = require("node-cron");

const models = require("../../models");
const { SendEmail } = require("../../../libs/Helper");

const recoveryEmails = async () => {
    try {
        const endTime = moment().utcOffset("+05:30").format();
        const startTime = moment().subtract(10, 'days').utcOffset("+05:30").format();

        // console.log("cronjob recoveryEmails startTime---------", startTime);
        // console.log("cronjob recoveryEmails endTime---------", endTime);

        let checkout_details = await models.Checkouts.findAll({
            where: {
                is_purchase: false,
                customer_id: {
                    [Sq.Op.ne]: null
                },
                created_at: {
                    [Sq.Op.between]: [startTime, endTime]
                },
            }
        });

        if (!checkout_details || !checkout_details.length) {
            return
        }


        checkout_details.forEach(async (checkout) => {
            const { shop_id, id, customer_id, checkout_uuid, created_at } = checkout

            let cart_recovery_data = await models.CartRecoveryEmails.findAll({
                where: {
                    store_id: shop_id,
                },
            });

            if (!cart_recovery_data || !cart_recovery_data.length) {
                return
            }

            cart_recovery_data.forEach(async (cart_recovery) => {
                const { id: cart_recovery_id, cart_recovery_schedule_time, cart_recovery_email_subject: emailSubject, cart_recovery_email_title: emailTitle, cart_recovery_email_body: emailBody, cart_recovery_action_button_title: buttonTiltle, cart_recovery_footer_text: footerText } = cart_recovery

                let cart_performance = await models.CartPerformance.findOne({
                    where: {
                        store_id: shop_id,
                        customer_id: customer_id,
                        checkout_id: id,
                        cart_recovery_id: cart_recovery_id
                    }
                });

                if (cart_performance) {
                    return;
                }


                let timePeriod;
                let sentTime;
                let sentTimeExceed;

                switch (cart_recovery_schedule_time) {
                    case '10_mins':
                        sentTime = 10
                        sentTimeExceed = 60;
                        timePeriod = 'minutes'
                        break;
                    case 'one_hour':
                        sentTime = 1
                        sentTimeExceed = 3;
                        timePeriod = 'hours'
                        break;
                    case 'three_hours':
                        sentTime = 3
                        sentTimeExceed = 5;
                        timePeriod = 'hours'
                        break;
                    case 'five_hours':
                        sentTime = 5
                        sentTimeExceed = 8;
                        timePeriod = 'hours'
                        break;
                    case 'eight_hours':
                        sentTime = 8
                        sentTimeExceed = 12;
                        timePeriod = 'hours'
                        break;
                    case 'tweleve_hours':
                        sentTime = 12
                        sentTimeExceed = 24;
                        timePeriod = 'hours'
                        break;
                    case 'one_day':
                        sentTime = 1
                        sentTimeExceed = 2;
                        timePeriod = 'days'
                        break;
                    case 'two_days':
                        sentTime = 2
                        sentTimeExceed = 3;
                        timePeriod = 'days'
                        break;
                    case 'three_days':
                        sentTime = 3
                        sentTimeExceed = 5;
                        timePeriod = 'days'
                        break;
                    case 'five_days':
                        sentTime = 5
                        sentTimeExceed = 10;
                        timePeriod = 'days'
                    default:
                        break;
                }

                let sentProcess = false;
                let exactMailSentTime = moment(created_at).diff(moment(endTime), timePeriod);
                exactMailSentTime = String(exactMailSentTime).replace("-", "")
                exactMailSentTime = Number(exactMailSentTime)

                if (exactMailSentTime >= sentTime) {
                    sentProcess = true;
                }

                if (exactMailSentTime >= sentTimeExceed) {
                    sentProcess = false;
                }

                if (!sentProcess) {
                    return;
                }

                let customer_detail = await models.Customers.findOne({
                    where: { store_id: shop_id, id: customer_id }
                })
                let cart_data = await models.Cart.findAll({
                    where: {
                        checkout_id: checkout.id,
                    },
                })

                let html_cart = '';
                let store_logo;
                let store_name;
                let store_id;
                let button_color = "#1A1A1A";
                let accent_color = "#012970";

                if (!cart_data || !cart_data.length) {
                    return
                }


                for (let cart of cart_data) {
                    html_cart +=
                        `<div class="email-preview-table">
                    <div class="email-preview-tr">
                        <div class="email-preview-td-img">
                            <img src= ` + cart.image + `
                                height="80">
                        </div>
                        <div class="email-preview-td-text">
                            <div class="pera-degine">
                                <p> ` + cart.title + ` </p>
                                <div class="email-preview-text-size">` + cart.quantity + ` </div>
                            </div>
                        </div>
                    </div>
                </div>`
                }

                let customize_checkout = await models.CustomizeCheckout.findOne({
                    where: {
                        store_id: shop_id,
                    },
                });
                if (customize_checkout) {
                    store_logo = customize_checkout.store_logo;
                    if (customize_checkout.button_color) {
                        button_color = customize_checkout.button_color;
                    }
                    if (customize_checkout.accent_color) {
                        accent_color = customize_checkout.accent_color;
                    }
                }

                let translation = await models.Translations.findOne({
                    where: {
                        store_id: shop_id,
                    },
                });

                let store = await models.Stores.findOne({
                    where: {
                        id: shop_id,
                    },
                });

                if (store) {
                    store_name = store.store_name;
                    store_id = store.id;
                }


                cart_performance = await models.CartPerformance.create({
                    store_id: shop_id,
                    customer_id: customer_id,
                    checkout_id: id,
                    lastSentFor: cart_recovery_schedule_time,
                    cart_recovery_id: cart_recovery_id,
                    sent_time: 1,
                    time_clicked: 0
                });


                let email_parameters = {
                    PRODUCTS: html_cart,
                    STORE_LOGO: store_logo || `${process.env.APP_URL}/assets/img/site-logo.svg`,
                    STORE_NAME: store_name,
                    BUTTON_COLOR: button_color,
                    ACCENT_COLOR: accent_color,
                    CHECKOUT_ID: `${process.env.APP_URL}/${store_id}/cart-recovery-checkout/${checkout_uuid}/${cart_performance?.cart_performance_uuid}`,
                    HOME_URL: `https://${store_name}.myshopify.com`,
                };


                const { default_subjects, cart_recovery_email_title, default_message, default_greeting, default_call_to_action, cart_recovery_footer_text } = translation
                const emailBodyNew = emailBody.replace("{first_name}", `${customer_detail?.first_name}`)
                email_parameters = {
                    ...email_parameters, ...{
                        CART_RECOVERY_EMAIL_SUBJECT: emailSubject || default_subjects || "Your cart is waiting for you!",
                        CART_RECOVERY_EMAIL_TITLE: emailTitle || cart_recovery_email_title || "You've left items in your cart!",
                        CART_RECOVERY_EMAIL_BODY: emailBodyNew || emailBody || default_message || "you added items to your shopping cart and haven't completed your purchase. You can complete it now while they're still available. Your cart is currently waiting for you!",
                        CART_RECOVERY_BUTTON_TEXT: buttonTiltle || default_call_to_action || "Return to my order",
                        CART_RECOVERY_FOOTER_TEXT: footerText || cart_recovery_footer_text || "You are receiving this automatic reminder because you started ordering items on " + store_name,
                        GREETING_MSG: default_greeting || "Hi"
                    }
                }

                let email_template = await fs.readFileSync(`${appRoot}/views/email-templates/CartRecoveryEmailTemplate.html`, "utf8");

                const emailTemplate = email_template.replace(
                    /PRODUCTS|CART_RECOVERY_EMAIL_SUBJECT|CART_RECOVERY_EMAIL_BODY|CART_RECOVERY_EMAIL_TITLE|CART_RECOVERY_BUTTON_TEXT|CART_RECOVERY_FOOTER_TEXT|HOME_URL|STORE_LOGO|STORE_NAME|GREETING_MSG|BUTTON_COLOR|ACCENT_COLOR|CHECKOUT_ID/gi,
                    function (matched) {
                        return email_parameters[matched];
                    }
                );

                let mail_options = {
                    html: emailTemplate,
                    subject: "Welcome to APP!",
                    to: customer_detail?.email,
                    from: `${process.env.MAIL_FROM_NAME} <${process.env.MAIL_FROM_ADDRESS}>`,
                };

                await SendEmail(mail_options).then(async (info) => {
                    console.log("Nodemailer Email sent -------------------- ", info.response);
                })

            })

        })
    } catch (error) {
        console.error(" recoveryEmails cron error---------- ", error);
    }
}

const recoveryEmails2 = async () => {
    // console.log("############################# recoveryEmails2");
    try {
        const endTime = moment().format();
        const startTime = moment().subtract(10, 'days').format();

        let abandoned_checkouts = await models.AbandonedCheckouts.findAll({
            where: {
                updated_at: {
                    [Sq.Op.between]: [startTime, endTime]
                },
            }
        });

        if (!abandoned_checkouts || !abandoned_checkouts.length) {
            return
        }

        abandoned_checkouts.forEach(async (abandoned_checkout) => {
            if (!abandoned_checkout) {
                return
            }

            let checkout = await models.Checkouts.findOne({
                where: {
                    id: abandoned_checkout?.checkout_id,
                    shop_id: abandoned_checkout?.shop_id,
                },
            })

            if (!checkout) {
                return
            }

            if (checkout && checkout?.is_purchase) {
                return
            }

            const { updated_at } = abandoned_checkout

            const { shop_id, id, checkout_uuid, } = checkout

            let cart_recovery_data = await models.CartRecoveryEmails.findAll({
                where: {
                    store_id: shop_id,
                },
            });

            if (!cart_recovery_data || !cart_recovery_data.length) {
                return
            }

            cart_recovery_data.forEach(async (cart_recovery) => {
                const { id: cart_recovery_id, cart_recovery_schedule_time, cart_recovery_email_subject: emailSubject, cart_recovery_email_title: emailTitle, cart_recovery_email_body: emailBody, cart_recovery_action_button_title: buttonTiltle, cart_recovery_footer_text: footerText } = cart_recovery

                let cart_performance = await models.CartPerformance.findOne({
                    where: {
                        store_id: shop_id,
                        checkout_id: id,
                        cart_recovery_id: cart_recovery_id
                    }
                });

                if (cart_performance) {
                    return;
                }


                let timePeriod;
                let sentTime;
                let sentTimeExceed;

                switch (cart_recovery_schedule_time) {
                    case '10_mins':
                        sentTime = 10
                        sentTimeExceed = 60;
                        timePeriod = 'minutes'
                        break;
                    case 'one_hour':
                        sentTime = 1
                        sentTimeExceed = 3;
                        timePeriod = 'hours'
                        break;
                    case 'three_hours':
                        sentTime = 3
                        sentTimeExceed = 5;
                        timePeriod = 'hours'
                        break;
                    case 'five_hours':
                        sentTime = 5
                        sentTimeExceed = 8;
                        timePeriod = 'hours'
                        break;
                    case 'eight_hours':
                        sentTime = 8
                        sentTimeExceed = 12;
                        timePeriod = 'hours'
                        break;
                    case 'tweleve_hours':
                        sentTime = 12
                        sentTimeExceed = 24;
                        timePeriod = 'hours'
                        break;
                    case 'one_day':
                        sentTime = 1
                        sentTimeExceed = 2;
                        timePeriod = 'days'
                        break;
                    case 'two_days':
                        sentTime = 2
                        sentTimeExceed = 3;
                        timePeriod = 'days'
                        break;
                    case 'three_days':
                        sentTime = 3
                        sentTimeExceed = 5;
                        timePeriod = 'days'
                        break;
                    case 'five_days':
                        sentTime = 5
                        sentTimeExceed = 10;
                        timePeriod = 'days'
                    default:
                        break;
                }

                let sentProcess = false;
                let exactMailSentTime = moment(updated_at).diff(moment(endTime), timePeriod);
                exactMailSentTime = String(exactMailSentTime).replace("-", "")
                exactMailSentTime = Number(exactMailSentTime)

                if (exactMailSentTime >= sentTime) {
                    sentProcess = true;
                }

                if (exactMailSentTime >= sentTimeExceed) {
                    sentProcess = false;
                }

                if (!sentProcess) {
                    return;
                }

                let customer_detail = {
                    email: abandoned_checkout?.email,
                    first_name: abandoned_checkout?.first_name,
                    last_name: abandoned_checkout?.last_name
                }
                let cart_data = await models.Cart.findAll({
                    where: {
                        checkout_id: checkout.id,
                    },
                })

                let html_cart = '';
                let store_logo;
                let store_name;
                let store_id;
                let button_color = "#1A1A1A";
                let accent_color = "#012970";

                if (!cart_data || !cart_data.length) {
                    return
                }


                for (let cart of cart_data) {
                    html_cart +=
                        `<div class="email-preview-table">
                    <div class="email-preview-tr">
                        <div class="email-preview-td-img">
                            <img src= ` + cart.image + `
                                height="80">
                        </div>
                        <div class="email-preview-td-text">
                            <div class="pera-degine">
                                <p> ` + cart.title + ` </p>
                                <div class="email-preview-text-size">` + cart.quantity + ` </div>
                            </div>
                        </div>
                    </div>
                </div>`
                }

                let customize_checkout = await models.CustomizeCheckout.findOne({
                    where: {
                        store_id: shop_id,
                    },
                });
                if (customize_checkout) {
                    store_logo = customize_checkout.store_logo;
                    if (customize_checkout.button_color) {
                        button_color = customize_checkout.button_color;
                    }
                    if (customize_checkout.accent_color) {
                        accent_color = customize_checkout.accent_color;
                    }
                }

                let translation = await models.Translations.findOne({
                    where: {
                        store_id: shop_id,
                    },
                });

                let store = await models.Stores.findOne({
                    where: {
                        id: shop_id,
                    },
                });

                if (store) {
                    store_name = store.store_name;
                    store_id = store.id;
                }


                cart_performance = await models.CartPerformance.create({
                    store_id: shop_id,
                    checkout_id: id,
                    lastSentFor: cart_recovery_schedule_time,
                    cart_recovery_id: cart_recovery_id,
                    sent_time: 1,
                    time_clicked: 0
                });


                let email_parameters = {
                    PRODUCTS: html_cart,
                    STORE_LOGO: store_logo || `${process.env.APP_URL}/assets/img/site-logo.svg`,
                    STORE_NAME: store_name,
                    BUTTON_COLOR: button_color,
                    ACCENT_COLOR: accent_color,
                    CHECKOUT_ID: `${process.env.APP_URL}/${store_id}/cart-recovery-checkout/${checkout_uuid}/${cart_performance?.cart_performance_uuid}`,
                    HOME_URL: `https://${store_name}.myshopify.com`,
                };


                const { default_subjects, cart_title, default_message, default_greeting, default_call_to_action } = translation
                const emailBodyNew = emailBody.replace("{first_name}", `${customer_detail?.first_name}`)
                email_parameters = {
                    ...email_parameters, ...{
                        CART_RECOVERY_EMAIL_SUBJECT: emailSubject || default_subjects || "Your cart is waiting for you!",
                        CART_RECOVERY_EMAIL_TITLE: emailTitle || cart_title || "You've left items in your cart!",
                        CART_RECOVERY_EMAIL_BODY: emailBodyNew || emailBody,
                        CART_RECOVERY_BUTTON_TEXT: buttonTiltle || default_call_to_action || "Return to my order",
                        CART_RECOVERY_FOOTER_TEXT: footerText,
                        // GREETING_MSG: default_greeting || "Hi"
                    }
                }

                let email_template = await fs.readFileSync(`${appRoot}/views/email-templates/CartRecoveryEmailTemplate.html`, "utf8");

                const emailTemplate = email_template.replace(
                    /PRODUCTS|CART_RECOVERY_EMAIL_SUBJECT|CART_RECOVERY_EMAIL_BODY|CART_RECOVERY_EMAIL_TITLE|CART_RECOVERY_BUTTON_TEXT|CART_RECOVERY_FOOTER_TEXT|HOME_URL|STORE_LOGO|STORE_NAME|GREETING_MSG|BUTTON_COLOR|ACCENT_COLOR|CHECKOUT_ID/gi,
                    function (matched) {
                        return email_parameters[matched];
                    }
                );

                let mail_options = {
                    html: emailTemplate,
                    subject: emailSubject,
                    to: customer_detail?.email,
                    from: `${store_name} <${process.env.MAIL_FROM_ADDRESS}>`,
                };

                await SendEmail(mail_options).then(async (info) => {
                    console.log("Nodemailer Email sent -------------------- ", info.response);
                }).catch((error) => {
                    console.error(" Nodemailer cron error---------- ", error);
                })

            })

        })
    } catch (error) {
        console.error(" recoveryEmails cron error---------- ", error);
    }
}

// Cart recovery cron
cron.schedule('*/30 * * * * *', async () => {
    await recoveryEmails2()
});
