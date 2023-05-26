var cron = require("node-cron");
const { Op } = require("sequelize");
const { UserSubscriptions, UserSubscriptionBillings, Cart, CartRecoveryEmails, Users, Translations, CustomizeCheckout, Stores, Checkouts, Orders } = require("../models");
const moment = require("moment");
const fs = require("fs");
const { SendEmail } = require("../../libs/Helper");

global.processCron = false;

let now = new Date();

function AddMinutesToDate(date, minutes) {
    return new Date(date.getTime() + minutes * 60000);
}
// cron.schedule('0 0 0 * * *', async () => { // runs at midnight
cron.schedule("0 0 */5 * * *", async () => {
    // runs every 5 hour

    if (!processCron) {
        processCron = true;
        // find expired billings
        await UserSubscriptionBillings.findAll({
            where: {
                status: "Active",
                end_date: {
                    [Op.lte]: moment().toDate(),
                },
            },
        }).then(async (response) => {
            if (response) {
                try {
                    for (let billing_data of response) {
                        // update inactive
                        await UserSubscriptionBillings.update(
                            {
                                status: "Inactive",
                            },
                            {
                                where: {
                                    id: billing_data?.id,
                                },
                            }
                        );
                        // find another billing if exists with same subscription id
                        let subscription_billing = await UserSubscriptionBillings.findOne({
                            where: {
                                status: "Inactive",
                                user_subscription_id: billing_data?.user_subscription_id,
                                end_date: {
                                    [Op.gte]: moment().toDate(),
                                },
                            },
                        });
                        if (subscription_billing) {
                            subscription_billing.status = "Active";
                            subscription_billing.save();
                            // update user subscription with billing details
                            await UserSubscriptions.update(
                                {
                                    billing_id: subscription_billing?.id,
                                    subscription_package_id: subscription_billing?.subscription_package_id,
                                    billing_cycle: subscription_billing?.billing_cycle,
                                    start_date: subscription_billing?.start_date,
                                    end_date: subscription_billing?.end_date,
                                },
                                {
                                    where: {
                                        id: billing_data?.id,
                                    },
                                }
                            );
                        }
                    }
                    console.log("successfully updated " + response?.length + " billing(s)");
                } catch (err) {
                    console.log("cron schedule error -------------", err);
                }
            }
        });

        processCron = false;
    }
});

cron.schedule("*/10 * * * * *", async () => {
    // runs every 10 mins
    if (!processCron) {
        processCron = true;
    }
    await Orders.findAll({
        is_purchased: false,
    }).then(async (order_response) => {
        if (order_response) {
            try {
                let cart_data = await Cart.findAll({
                    where: {
                        created_at: {
                            [Op.gt]: AddMinutesToDate(now, 10),
                        },
                    },
                });
                if (cart_data.length > 0) {
                    let html_cart;
                    let checkout;
                    let store_logo;
                    let store_name;
                    let greeting_msg;
                    let button_color = "#1A1A1A";
                    let accent_color = "#012970";
                    let checkout_id;
                    let store_id;

                    for (let cart of cart_data) {
                        html_cart +=
                            `
                        <table class="email-preview-table">
                            <tbody>
                                <tr class="email-preview-tr">
                                    <td class="email-preview-td-img">
                                        <img src = ` +
                            cart.image +
                            ` height="80">
                                    </td>
                                    <td class="email-preview-td-text">
                                        <div> ` +
                            cart.title +
                            `
                                            <div class="email-preview-text-size"> ` +
                            cart.quantity +
                            `</div>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>`;

                        checkout = await Checkouts.findAll({
                            where: {
                                id: cart.checkout_id,
                                is_purchase: false,
                            },
                        });
                    }
                    html_cart = html_cart.replace(/(undefined)/, "");

                    if (checkout.length > 0) {
                        for (let checkout_data of checkout) {
                            checkout_id = checkout_data.checkout_uuid;
                            let data = await CartRecoveryEmails.findOne({
                                where: {
                                    cart_recovery_schedule_time: "10_mins",
                                    store_id: checkout_data.shop_id,
                                },
                            });

                            if (data != null) {
                                let customize_checkout = await CustomizeCheckout.findOne({
                                    where: {
                                        store_id: checkout_data.shop_id,
                                    },
                                });
                                if (customize_checkout != null) {
                                    store_logo = customize_checkout.store_logo;
                                    if (customize_checkout.button_color != "") {
                                        button_color = customize_checkout.button_color;
                                    }
                                    if (customize_checkout.accent_color != "") {
                                        accent_color = customize_checkout.accent_color;
                                    }
                                }
                                let store = await Stores.findOne({
                                    where: {
                                        id: checkout_data.shop_id,
                                    },
                                });
                                if (store != null) {
                                    store_name = store.store_name;
                                    store_id = store.id;
                                }
                                let translation = await Translations.findOne({
                                    where: {
                                        store_id: checkout_data.shop_id,
                                    },
                                });
                                if (translation != null) {
                                    greeting_msg = translation.default_greeting;
                                    if (data.cart_recovery_email_title == "") {
                                        data.cart_recovery_email_title = translation.cart_recovery_email_title;
                                    }
                                    if (data.cart_recovery_email_subject == "") {
                                        data.cart_recovery_email_subject = translation.default_subjects;
                                    }
                                    if (data.cart_recovery_email_body == "") {
                                        data.cart_recovery_email_body = translation.default_message;
                                    }
                                    if (data.cart_recovery_action_button_title == "") {
                                        data.cart_recovery_action_button_title = translation.default_call_to_action;
                                    }
                                    if (data.cart_recovery_footer_text == "") {
                                        data.cart_recovery_footer_text = translation.cart_recovery_footer_text;
                                    }
                                } else {
                                    greeting_msg = "Hi";
                                    if (data.cart_recovery_email_title == "") {
                                        data.cart_recovery_email_title = "You've left items in your cart!";
                                    }
                                    if (data.cart_recovery_email_subject == "") {
                                        data.cart_recovery_email_subject = "Your cart is waiting for you!";
                                    }
                                    if (data.cart_recovery_email_body == "") {
                                        data.cart_recovery_email_body =
                                            "you added items to your shopping cart and haven't completed your purchase. You can complete it now while they're still available. Your cart is currently waiting for you!";
                                    }
                                    if (data.cart_recovery_action_button_title == "") {
                                        data.cart_recovery_action_button_title = "Return to my order";
                                    }
                                    if (data.cart_recovery_footer_text == "") {
                                        data.cart_recovery_footer_text = "You are receiving this automatic reminder because you started ordering items on " + store_name;
                                    }
                                }
                                await Users.findOne({
                                    where: {
                                        id: data.user_id,
                                    },
                                }).then(async (user) => {
                                    /*** System Email start ***/

                                    let email_parameters = {
                                        PRODUCTS: html_cart,
                                        CART_RECOVERY_EMAIL_SUBJECT: data.cart_recovery_email_subject,
                                        CART_RECOVERY_EMAIL_TITLE: data.cart_recovery_email_title,
                                        CART_RECOVERY_EMAIL_BODY: data.cart_recovery_email_body,
                                        CART_RECOVERY_BUTTON_TEXT: data.cart_recovery_action_button_title,
                                        CART_RECOVERY_FOOTER_TEXT: data.cart_recovery_footer_text,
                                        STORE_LOGO: store_logo || `${process.env.APP_URL}/assets/img/site-logo.svg`,
                                        STORE_NAME: store_name,
                                        GREETING_MSG: greeting_msg,
                                        BUTTON_COLOR: button_color,
                                        ACCENT_COLOR: accent_color,
                                        CHECKOUT_ID: `${process.env.APP_URL}/${store_id}/check-out/${checkout_id}`,
                                        HOME_URL: `${process.env.APP_URL}`,
                                    };

                                    let email_template = await fs.readFileSync(`${appRoot}/views/email-templates/CartRecoveryEmailTemplate.html`, "utf8");
                                    email_template = email_template.replace(
                                        /PRODUCTS|CART_RECOVERY_EMAIL_SUBJECT|CART_RECOVERY_EMAIL_BODY|CART_RECOVERY_EMAIL_TITLE|CART_RECOVERY_BUTTON_TEXT|CART_RECOVERY_FOOTER_TEXT|HOME_URL|STORE_LOGO|STORE_NAME|GREETING_MSG|BUTTON_COLOR|ACCENT_COLOR|CHECKOUT_ID/gi,
                                        function (matched) {
                                            return email_parameters[matched];
                                        }
                                    );

                                    let mail_options = {
                                        html: email_template,
                                        subject: "Welcome to APP!",
                                        to: user?.email,
                                        from: `${process.env.MAIL_FROM_NAME} <${process.env.MAIL_FROM_ADDRESS}>`,
                                    };
                                    await SendEmail(mail_options)
                                        .then(async (info) => {
                                            console.log("Nodemailer Email sent -------------------- ", info.response);
                                            try {
                                                let cart_recovery = await CartRecoveryEmails.findOne({
                                                    where: { store_id: data.store_id },
                                                });
                                                if (cart_recovery != null) {
                                                    let cart_recovery_data = await CartRecoveryEmails.update(
                                                        { time_sent: cart_recovery.time_sent + 1 },
                                                        {
                                                            where: { store_id: data.store_id },
                                                        }
                                                    );
                                                    console.log("-----------------updated", cart_recovery_data);
                                                }
                                            } catch (error) {
                                                console.log("err ---------- ", error);
                                            }
                                        })
                                        .catch((error) => {
                                            console.log("Nodemailer error ---------- ", error);
                                        });
                                });
                            }
                        }
                    }
                }
            } catch (err) {
                console.log("-------error-----:", err);
            }
        } //if
    });

    processCron = false;
});

cron.schedule("*/59 * * * * *", async () => {
    // runs every 1 hr

    if (!processCron) {
        processCron = true;
    }
    await Orders.findAll({
        is_purchased: false,
    }).then(async (order_response) => {
        if (order_response) {
            try {
                let cart_data = await Cart.findAll({
                    where: {
                        created_at: {
                            [Op.gt]: moment(now).add(1, "h").toDate(),
                        },
                    },
                });
                if (cart_data.length > 0) {
                    let html_cart;
                    let checkout;
                    let store_logo;
                    let store_name;
                    let greeting_msg;
                    let button_color = "#1A1A1A";
                    let accent_color = "#012970";
                    let checkout_id;
                    let store_id;

                    for (let cart of cart_data) {
                        html_cart +=
                            `
                        <table class="email-preview-table">
                            <tbody>
                                <tr class="email-preview-tr">
                                    <td class="email-preview-td-img">
                                        <img src = ` +
                            cart.image +
                            ` height="80">
                                    </td>
                                    <td class="email-preview-td-text">
                                        <div> ` +
                            cart.title +
                            `
                                            <div class="email-preview-text-size"> ` +
                            cart.quantity +
                            `</div>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>`;

                        checkout = await Checkouts.findAll({
                            where: {
                                id: cart.checkout_id,
                                is_purchase: false,
                            },
                        });
                    }
                    html_cart = html_cart.replace(/(undefined)/, "");

                    if (checkout.length > 0) {
                        for (let checkout_data of checkout) {
                            checkout_id = checkout_data.checkout_uuid;
                            let data = await CartRecoveryEmails.findOne({
                                where: {
                                    cart_recovery_schedule_time: "one_hour",
                                    store_id: checkout_data.shop_id,
                                },
                            });

                            if (data != null) {
                                let customize_checkout = await CustomizeCheckout.findOne({
                                    where: {
                                        store_id: checkout_data.shop_id,
                                    },
                                });
                                if (customize_checkout != null) {
                                    store_logo = customize_checkout.store_logo;
                                    if (customize_checkout.button_color != "") {
                                        button_color = customize_checkout.button_color;
                                    }
                                    if (customize_checkout.accent_color != "") {
                                        accent_color = customize_checkout.accent_color;
                                    }
                                }
                                let store = await Stores.findOne({
                                    where: {
                                        id: checkout_data.shop_id,
                                    },
                                });
                                if (store != null) {
                                    store_name = store.store_name;
                                    store_id = store.id;
                                }
                                let translation = await Translations.findOne({
                                    where: {
                                        store_id: checkout_data.shop_id,
                                    },
                                });
                                if (translation != null) {
                                    greeting_msg = translation.default_greeting;
                                    if (data.cart_recovery_email_title == "") {
                                        data.cart_recovery_email_title = translation.cart_recovery_email_title;
                                    }
                                    if (data.cart_recovery_email_subject == "") {
                                        data.cart_recovery_email_subject = translation.default_subjects;
                                    }
                                    if (data.cart_recovery_email_body == "") {
                                        data.cart_recovery_email_body = translation.default_message;
                                    }
                                    if (data.cart_recovery_action_button_title == "") {
                                        data.cart_recovery_action_button_title = translation.default_call_to_action;
                                    }
                                    if (data.cart_recovery_footer_text == "") {
                                        data.cart_recovery_footer_text = translation.cart_recovery_footer_text;
                                    }
                                } else {
                                    greeting_msg = "Hi";
                                    if (data.cart_recovery_email_title == "") {
                                        data.cart_recovery_email_title = "You've left items in your cart!";
                                    }
                                    if (data.cart_recovery_email_subject == "") {
                                        data.cart_recovery_email_subject = "Your cart is waiting for you!";
                                    }
                                    if (data.cart_recovery_email_body == "") {
                                        data.cart_recovery_email_body =
                                            "you added items to your shopping cart and haven't completed your purchase. You can complete it now while they're still available. Your cart is currently waiting for you!";
                                    }
                                    if (data.cart_recovery_action_button_title == "") {
                                        data.cart_recovery_action_button_title = "Return to my order";
                                    }
                                    if (data.cart_recovery_footer_text == "") {
                                        data.cart_recovery_footer_text = "You are receiving this automatic reminder because you started ordering items on " + store_name;
                                    }
                                }
                                await Users.findOne({
                                    where: {
                                        id: data.user_id,
                                    },
                                }).then(async (user) => {
                                    /*** System Email start ***/

                                    let email_parameters = {
                                        PRODUCTS: html_cart,
                                        CART_RECOVERY_EMAIL_SUBJECT: data.cart_recovery_email_subject,
                                        CART_RECOVERY_EMAIL_TITLE: data.cart_recovery_email_title,
                                        CART_RECOVERY_EMAIL_BODY: data.cart_recovery_email_body,
                                        CART_RECOVERY_BUTTON_TEXT: data.cart_recovery_action_button_title,
                                        CART_RECOVERY_FOOTER_TEXT: data.cart_recovery_footer_text,
                                        STORE_LOGO: store_logo || `${process.env.APP_URL}/assets/img/site-logo.svg`,
                                        STORE_NAME: store_name,
                                        GREETING_MSG: greeting_msg,
                                        BUTTON_COLOR: button_color,
                                        ACCENT_COLOR: accent_color,
                                        CHECKOUT_ID: `${process.env.APP_URL}/${store_id}/check-out/${checkout_id}`,
                                        HOME_URL: `${process.env.APP_URL}`,
                                    };

                                    let email_template = await fs.readFileSync(`${appRoot}/views/email-templates/CartRecoveryEmailTemplate.html`, "utf8");
                                    email_template = email_template.replace(
                                        /PRODUCTS|CART_RECOVERY_EMAIL_SUBJECT|CART_RECOVERY_EMAIL_BODY|CART_RECOVERY_EMAIL_TITLE|CART_RECOVERY_BUTTON_TEXT|CART_RECOVERY_FOOTER_TEXT|HOME_URL|STORE_LOGO|STORE_NAME|GREETING_MSG|BUTTON_COLOR|ACCENT_COLOR|CHECKOUT_ID/gi,
                                        function (matched) {
                                            return email_parameters[matched];
                                        }
                                    );

                                    let mail_options = {
                                        html: email_template,
                                        subject: "Welcome to APP!",
                                        to: user?.email,
                                        from: `${process.env.MAIL_FROM_NAME} <${process.env.MAIL_FROM_ADDRESS}>`,
                                    };
                                    await SendEmail(mail_options)
                                        .then(async (info) => {
                                            console.log("Nodemailer Email sent -------------------- ", info.response);
                                            try {
                                                let cart_recovery = await CartRecoveryEmails.findOne({
                                                    where: { store_id: data.store_id },
                                                });
                                                if (cart_recovery != null) {
                                                    let cart_recovery_data = await CartRecoveryEmails.update(
                                                        { time_sent: cart_recovery.time_sent + 1 },
                                                        {
                                                            where: { store_id: data.store_id },
                                                        }
                                                    );
                                                    console.log("-----------------updated", cart_recovery_data);
                                                }
                                            } catch (error) {
                                                console.log("err ---------- ", error);
                                            }
                                        })
                                        .catch((error) => {
                                            console.log("Nodemailer error ---------- ", error);
                                        });
                                });
                            }
                        }
                    }
                }
            } catch (err) {
                console.log("-------error-----:", err);
            }
        } //if
    });

    processCron = false;
});

cron.schedule("0 0 */3 * * *", async () => {
    // runs every 3 hrs

    if (!processCron) {
        processCron = true;
    }
    await Orders.findAll({
        is_purchased: false,
    }).then(async (order_response) => {
        if (order_response) {
            try {
                let cart_data = await Cart.findAll({
                    where: {
                        created_at: {
                            [Op.gt]: moment(now).add(3, "h").toDate(),
                        },
                    },
                });
                if (cart_data.length > 0) {
                    let html_cart;
                    let checkout;
                    let store_logo;
                    let store_name;
                    let greeting_msg;
                    let button_color = "#1A1A1A";
                    let accent_color = "#012970";
                    let checkout_id;
                    let store_id;

                    for (let cart of cart_data) {
                        html_cart +=
                            `
                        <table class="email-preview-table">
                            <tbody>
                                <tr class="email-preview-tr">
                                    <td class="email-preview-td-img">
                                        <img src = ` +
                            cart.image +
                            ` height="80">
                                    </td>
                                    <td class="email-preview-td-text">
                                        <div> ` +
                            cart.title +
                            `
                                            <div class="email-preview-text-size"> ` +
                            cart.quantity +
                            `</div>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>`;

                        checkout = await Checkouts.findAll({
                            where: {
                                id: cart.checkout_id,
                                is_purchase: false,
                            },
                        });
                    }
                    html_cart = html_cart.replace(/(undefined)/, "");

                    if (checkout.length > 0) {
                        for (let checkout_data of checkout) {
                            checkout_id = checkout_data.checkout_uuid;
                            let data = await CartRecoveryEmails.findOne({
                                where: {
                                    cart_recovery_schedule_time: "three_hours",
                                    store_id: checkout_data.shop_id,
                                },
                            });

                            if (data != null) {
                                let customize_checkout = await CustomizeCheckout.findOne({
                                    where: {
                                        store_id: checkout_data.shop_id,
                                    },
                                });
                                if (customize_checkout != null) {
                                    store_logo = customize_checkout.store_logo;
                                    if (customize_checkout.button_color != "") {
                                        button_color = customize_checkout.button_color;
                                    }
                                    if (customize_checkout.accent_color != "") {
                                        accent_color = customize_checkout.accent_color;
                                    }
                                }
                                let store = await Stores.findOne({
                                    where: {
                                        id: checkout_data.shop_id,
                                    },
                                });
                                if (store != null) {
                                    store_name = store.store_name;
                                    store_id = store.id;
                                }
                                let translation = await Translations.findOne({
                                    where: {
                                        store_id: checkout_data.shop_id,
                                    },
                                });
                                if (translation != null) {
                                    greeting_msg = translation.default_greeting;
                                    if (data.cart_recovery_email_title == "") {
                                        data.cart_recovery_email_title = translation.cart_recovery_email_title;
                                    }
                                    if (data.cart_recovery_email_subject == "") {
                                        data.cart_recovery_email_subject = translation.default_subjects;
                                    }
                                    if (data.cart_recovery_email_body == "") {
                                        data.cart_recovery_email_body = translation.default_message;
                                    }
                                    if (data.cart_recovery_action_button_title == "") {
                                        data.cart_recovery_action_button_title = translation.default_call_to_action;
                                    }
                                    if (data.cart_recovery_footer_text == "") {
                                        data.cart_recovery_footer_text = translation.cart_recovery_footer_text;
                                    }
                                } else {
                                    greeting_msg = "Hi";
                                    if (data.cart_recovery_email_title == "") {
                                        data.cart_recovery_email_title = "You've left items in your cart!";
                                    }
                                    if (data.cart_recovery_email_subject == "") {
                                        data.cart_recovery_email_subject = "Your cart is waiting for you!";
                                    }
                                    if (data.cart_recovery_email_body == "") {
                                        data.cart_recovery_email_body =
                                            "you added items to your shopping cart and haven't completed your purchase. You can complete it now while they're still available. Your cart is currently waiting for you!";
                                    }
                                    if (data.cart_recovery_action_button_title == "") {
                                        data.cart_recovery_action_button_title = "Return to my order";
                                    }
                                    if (data.cart_recovery_footer_text == "") {
                                        data.cart_recovery_footer_text = "You are receiving this automatic reminder because you started ordering items on " + store_name;
                                    }
                                }
                                await Users.findOne({
                                    where: {
                                        id: data.user_id,
                                    },
                                }).then(async (user) => {
                                    /*** System Email start ***/

                                    let email_parameters = {
                                        PRODUCTS: html_cart,
                                        CART_RECOVERY_EMAIL_SUBJECT: data.cart_recovery_email_subject,
                                        CART_RECOVERY_EMAIL_TITLE: data.cart_recovery_email_title,
                                        CART_RECOVERY_EMAIL_BODY: data.cart_recovery_email_body,
                                        CART_RECOVERY_BUTTON_TEXT: data.cart_recovery_action_button_title,
                                        CART_RECOVERY_FOOTER_TEXT: data.cart_recovery_footer_text,
                                        STORE_LOGO: store_logo || `${process.env.APP_URL}/assets/img/site-logo.svg`,
                                        STORE_NAME: store_name,
                                        GREETING_MSG: greeting_msg,
                                        BUTTON_COLOR: button_color,
                                        ACCENT_COLOR: accent_color,
                                        CHECKOUT_ID: `${process.env.APP_URL}/${store_id}/check-out/${checkout_id}`,
                                        HOME_URL: `${process.env.APP_URL}`,
                                    };

                                    let email_template = await fs.readFileSync(`${appRoot}/views/email-templates/CartRecoveryEmailTemplate.html`, "utf8");
                                    email_template = email_template.replace(
                                        /PRODUCTS|CART_RECOVERY_EMAIL_SUBJECT|CART_RECOVERY_EMAIL_BODY|CART_RECOVERY_EMAIL_TITLE|CART_RECOVERY_BUTTON_TEXT|CART_RECOVERY_FOOTER_TEXT|HOME_URL|STORE_LOGO|STORE_NAME|GREETING_MSG|BUTTON_COLOR|ACCENT_COLOR|CHECKOUT_ID/gi,
                                        function (matched) {
                                            return email_parameters[matched];
                                        }
                                    );

                                    let mail_options = {
                                        html: email_template,
                                        subject: "Welcome to APP!",
                                        to: user?.email,
                                        from: `${process.env.MAIL_FROM_NAME} <${process.env.MAIL_FROM_ADDRESS}>`,
                                    };
                                    await SendEmail(mail_options)
                                        .then(async (info) => {
                                            console.log("Nodemailer Email sent -------------------- ", info.response);
                                            try {
                                                let cart_recovery = await CartRecoveryEmails.findOne({
                                                    where: { store_id: data.store_id },
                                                });
                                                if (cart_recovery != null) {
                                                    let cart_recovery_data = await CartRecoveryEmails.update(
                                                        { time_sent: cart_recovery.time_sent + 1 },
                                                        {
                                                            where: { store_id: data.store_id },
                                                        }
                                                    );
                                                    console.log("-----------------updated", cart_recovery_data);
                                                }
                                            } catch (error) {
                                                console.log("err ---------- ", error);
                                            }
                                        })
                                        .catch((error) => {
                                            console.log("Nodemailer error ---------- ", error);
                                        });
                                });
                            }
                        }
                    }
                }
            } catch (err) {
                console.log("-------error-----:", err);
            }
        } //if
    });
});

cron.schedule("0 0 */5 * * *", async () => {
    // runs every 5 hrs

    if (!processCron) {
        processCron = true;
    }
    await Orders.findAll({
        is_purchased: false,
    }).then(async (order_response) => {
        if (order_response) {
            try {
                let cart_data = await Cart.findAll({
                    where: {
                        created_at: {
                            [Op.gt]: moment(now).add(5, "h").toDate(),
                        },
                    },
                });
                if (cart_data.length > 0) {
                    let html_cart;
                    let checkout;
                    let store_logo;
                    let store_name;
                    let greeting_msg;
                    let button_color = "#1A1A1A";
                    let accent_color = "#012970";
                    let checkout_id;
                    let store_id;

                    for (let cart of cart_data) {
                        html_cart +=
                            `
                        <table class="email-preview-table">
                            <tbody>
                                <tr class="email-preview-tr">
                                    <td class="email-preview-td-img">
                                        <img src = ` +
                            cart.image +
                            ` height="80">
                                    </td>
                                    <td class="email-preview-td-text">
                                        <div> ` +
                            cart.title +
                            `
                                            <div class="email-preview-text-size"> ` +
                            cart.quantity +
                            `</div>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>`;

                        checkout = await Checkouts.findAll({
                            where: {
                                id: cart.checkout_id,
                                is_purchase: false,
                            },
                        });
                    }
                    html_cart = html_cart.replace(/(undefined)/, "");

                    if (checkout.length > 0) {
                        for (let checkout_data of checkout) {
                            checkout_id = checkout_data.checkout_uuid;
                            let data = await CartRecoveryEmails.findOne({
                                where: {
                                    cart_recovery_schedule_time: "five_hours",
                                    store_id: checkout_data.shop_id,
                                },
                            });

                            if (data != null) {
                                let customize_checkout = await CustomizeCheckout.findOne({
                                    where: {
                                        store_id: checkout_data.shop_id,
                                    },
                                });
                                if (customize_checkout != null) {
                                    store_logo = customize_checkout.store_logo;
                                    if (customize_checkout.button_color != "") {
                                        button_color = customize_checkout.button_color;
                                    }
                                    if (customize_checkout.accent_color != "") {
                                        accent_color = customize_checkout.accent_color;
                                    }
                                }
                                let store = await Stores.findOne({
                                    where: {
                                        id: checkout_data.shop_id,
                                    },
                                });
                                if (store != null) {
                                    store_name = store.store_name;
                                    store_id = store.id;
                                }
                                let translation = await Translations.findOne({
                                    where: {
                                        store_id: checkout_data.shop_id,
                                    },
                                });
                                if (translation != null) {
                                    greeting_msg = translation.default_greeting;
                                    if (data.cart_recovery_email_title == "") {
                                        data.cart_recovery_email_title = translation.cart_recovery_email_title;
                                    }
                                    if (data.cart_recovery_email_subject == "") {
                                        data.cart_recovery_email_subject = translation.default_subjects;
                                    }
                                    if (data.cart_recovery_email_body == "") {
                                        data.cart_recovery_email_body = translation.default_message;
                                    }
                                    if (data.cart_recovery_action_button_title == "") {
                                        data.cart_recovery_action_button_title = translation.default_call_to_action;
                                    }
                                    if (data.cart_recovery_footer_text == "") {
                                        data.cart_recovery_footer_text = translation.cart_recovery_footer_text;
                                    }
                                } else {
                                    greeting_msg = "Hi";
                                    if (data.cart_recovery_email_title == "") {
                                        data.cart_recovery_email_title = "You've left items in your cart!";
                                    }
                                    if (data.cart_recovery_email_subject == "") {
                                        data.cart_recovery_email_subject = "Your cart is waiting for you!";
                                    }
                                    if (data.cart_recovery_email_body == "") {
                                        data.cart_recovery_email_body =
                                            "you added items to your shopping cart and haven't completed your purchase. You can complete it now while they're still available. Your cart is currently waiting for you!";
                                    }
                                    if (data.cart_recovery_action_button_title == "") {
                                        data.cart_recovery_action_button_title = "Return to my order";
                                    }
                                    if (data.cart_recovery_footer_text == "") {
                                        data.cart_recovery_footer_text = "You are receiving this automatic reminder because you started ordering items on " + store_name;
                                    }
                                }
                                await Users.findOne({
                                    where: {
                                        id: data.user_id,
                                    },
                                }).then(async (user) => {
                                    /*** System Email start ***/

                                    let email_parameters = {
                                        PRODUCTS: html_cart,
                                        CART_RECOVERY_EMAIL_SUBJECT: data.cart_recovery_email_subject,
                                        CART_RECOVERY_EMAIL_TITLE: data.cart_recovery_email_title,
                                        CART_RECOVERY_EMAIL_BODY: data.cart_recovery_email_body,
                                        CART_RECOVERY_BUTTON_TEXT: data.cart_recovery_action_button_title,
                                        CART_RECOVERY_FOOTER_TEXT: data.cart_recovery_footer_text,
                                        STORE_LOGO: store_logo || `${process.env.APP_URL}/assets/img/site-logo.svg`,
                                        STORE_NAME: store_name,
                                        GREETING_MSG: greeting_msg,
                                        BUTTON_COLOR: button_color,
                                        ACCENT_COLOR: accent_color,
                                        CHECKOUT_ID: `${process.env.APP_URL}/${store_id}/check-out/${checkout_id}`,
                                        HOME_URL: `${process.env.APP_URL}`,
                                    };

                                    let email_template = await fs.readFileSync(`${appRoot}/views/email-templates/CartRecoveryEmailTemplate.html`, "utf8");
                                    email_template = email_template.replace(
                                        /PRODUCTS|CART_RECOVERY_EMAIL_SUBJECT|CART_RECOVERY_EMAIL_BODY|CART_RECOVERY_EMAIL_TITLE|CART_RECOVERY_BUTTON_TEXT|CART_RECOVERY_FOOTER_TEXT|HOME_URL|STORE_LOGO|STORE_NAME|GREETING_MSG|BUTTON_COLOR|ACCENT_COLOR|CHECKOUT_ID/gi,
                                        function (matched) {
                                            return email_parameters[matched];
                                        }
                                    );

                                    let mail_options = {
                                        html: email_template,
                                        subject: "Welcome to APP!",
                                        to: user?.email,
                                        from: `${process.env.MAIL_FROM_NAME} <${process.env.MAIL_FROM_ADDRESS}>`,
                                    };
                                    await SendEmail(mail_options)
                                        .then(async (info) => {
                                            console.log("Nodemailer Email sent -------------------- ", info.response);
                                            try {
                                                let cart_recovery = await CartRecoveryEmails.findOne({
                                                    where: { store_id: data.store_id },
                                                });
                                                if (cart_recovery != null) {
                                                    let cart_recovery_data = await CartRecoveryEmails.update(
                                                        { time_sent: cart_recovery.time_sent + 1 },
                                                        {
                                                            where: { store_id: data.store_id },
                                                        }
                                                    );
                                                    console.log("-----------------updated", cart_recovery_data);
                                                }
                                            } catch (error) {
                                                console.log("err ---------- ", error);
                                            }
                                        })
                                        .catch((error) => {
                                            console.log("Nodemailer error ---------- ", error);
                                        });
                                });
                            }
                        }
                    }
                }
            } catch (err) {
                console.log("-------error-----:", err);
            }
        } //if
    });
});

cron.schedule("0 0 */8 * * *", async () => {
    // runs every 8 hrs

    if (!processCron) {
        processCron = true;
    }
    await Orders.findAll({
        is_purchased: false,
    }).then(async (order_response) => {
        if (order_response) {
            try {
                let cart_data = await Cart.findAll({
                    where: {
                        created_at: {
                            [Op.gt]: moment(now).add(8, "h").toDate(),
                        },
                    },
                });
                if (cart_data.length > 0) {
                    let html_cart;
                    let checkout;
                    let store_logo;
                    let store_name;
                    let greeting_msg;
                    let button_color = "#1A1A1A";
                    let accent_color = "#012970";
                    let checkout_id;
                    let store_id;

                    for (let cart of cart_data) {
                        html_cart +=
                            `
                        <table class="email-preview-table">
                            <tbody>
                                <tr class="email-preview-tr">
                                    <td class="email-preview-td-img">
                                        <img src = ` +
                            cart.image +
                            ` height="80">
                                    </td>
                                    <td class="email-preview-td-text">
                                        <div> ` +
                            cart.title +
                            `
                                            <div class="email-preview-text-size"> ` +
                            cart.quantity +
                            `</div>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>`;

                        checkout = await Checkouts.findAll({
                            where: {
                                id: cart.checkout_id,
                                is_purchase: false,
                            },
                        });
                    }
                    html_cart = html_cart.replace(/(undefined)/, "");

                    if (checkout.length > 0) {
                        for (let checkout_data of checkout) {
                            checkout_id = checkout_data.checkout_uuid;
                            let data = await CartRecoveryEmails.findOne({
                                where: {
                                    cart_recovery_schedule_time: "eight_hours",
                                    store_id: checkout_data.shop_id,
                                },
                            });

                            if (data != null) {
                                let customize_checkout = await CustomizeCheckout.findOne({
                                    where: {
                                        store_id: checkout_data.shop_id,
                                    },
                                });
                                if (customize_checkout != null) {
                                    store_logo = customize_checkout.store_logo;
                                    if (customize_checkout.button_color != "") {
                                        button_color = customize_checkout.button_color;
                                    }
                                    if (customize_checkout.accent_color != "") {
                                        accent_color = customize_checkout.accent_color;
                                    }
                                }
                                let store = await Stores.findOne({
                                    where: {
                                        id: checkout_data.shop_id,
                                    },
                                });
                                if (store != null) {
                                    store_name = store.store_name;
                                    store_id = store.id;
                                }
                                let translation = await Translations.findOne({
                                    where: {
                                        store_id: checkout_data.shop_id,
                                    },
                                });
                                if (translation != null) {
                                    greeting_msg = translation.default_greeting;
                                    if (data.cart_recovery_email_title == "") {
                                        data.cart_recovery_email_title = translation.cart_recovery_email_title;
                                    }
                                    if (data.cart_recovery_email_subject == "") {
                                        data.cart_recovery_email_subject = translation.default_subjects;
                                    }
                                    if (data.cart_recovery_email_body == "") {
                                        data.cart_recovery_email_body = translation.default_message;
                                    }
                                    if (data.cart_recovery_action_button_title == "") {
                                        data.cart_recovery_action_button_title = translation.default_call_to_action;
                                    }
                                    if (data.cart_recovery_footer_text == "") {
                                        data.cart_recovery_footer_text = translation.cart_recovery_footer_text;
                                    }
                                } else {
                                    greeting_msg = "Hi";
                                    if (data.cart_recovery_email_title == "") {
                                        data.cart_recovery_email_title = "You've left items in your cart!";
                                    }
                                    if (data.cart_recovery_email_subject == "") {
                                        data.cart_recovery_email_subject = "Your cart is waiting for you!";
                                    }
                                    if (data.cart_recovery_email_body == "") {
                                        data.cart_recovery_email_body =
                                            "you added items to your shopping cart and haven't completed your purchase. You can complete it now while they're still available. Your cart is currently waiting for you!";
                                    }
                                    if (data.cart_recovery_action_button_title == "") {
                                        data.cart_recovery_action_button_title = "Return to my order";
                                    }
                                    if (data.cart_recovery_footer_text == "") {
                                        data.cart_recovery_footer_text = "You are receiving this automatic reminder because you started ordering items on " + store_name;
                                    }
                                }
                                await Users.findOne({
                                    where: {
                                        id: data.user_id,
                                    },
                                }).then(async (user) => {
                                    /*** System Email start ***/

                                    let email_parameters = {
                                        PRODUCTS: html_cart,
                                        CART_RECOVERY_EMAIL_SUBJECT: data.cart_recovery_email_subject,
                                        CART_RECOVERY_EMAIL_TITLE: data.cart_recovery_email_title,
                                        CART_RECOVERY_EMAIL_BODY: data.cart_recovery_email_body,
                                        CART_RECOVERY_BUTTON_TEXT: data.cart_recovery_action_button_title,
                                        CART_RECOVERY_FOOTER_TEXT: data.cart_recovery_footer_text,
                                        STORE_LOGO: store_logo || `${process.env.APP_URL}/assets/img/site-logo.svg`,
                                        STORE_NAME: store_name,
                                        GREETING_MSG: greeting_msg,
                                        BUTTON_COLOR: button_color,
                                        ACCENT_COLOR: accent_color,
                                        CHECKOUT_ID: `${process.env.APP_URL}/${store_id}/check-out/${checkout_id}`,
                                        HOME_URL: `${process.env.APP_URL}`,
                                    };

                                    let email_template = await fs.readFileSync(`${appRoot}/views/email-templates/CartRecoveryEmailTemplate.html`, "utf8");
                                    email_template = email_template.replace(
                                        /PRODUCTS|CART_RECOVERY_EMAIL_SUBJECT|CART_RECOVERY_EMAIL_BODY|CART_RECOVERY_EMAIL_TITLE|CART_RECOVERY_BUTTON_TEXT|CART_RECOVERY_FOOTER_TEXT|HOME_URL|STORE_LOGO|STORE_NAME|GREETING_MSG|BUTTON_COLOR|ACCENT_COLOR|CHECKOUT_ID/gi,
                                        function (matched) {
                                            return email_parameters[matched];
                                        }
                                    );

                                    let mail_options = {
                                        html: email_template,
                                        subject: "Welcome to APP!",
                                        to: user?.email,
                                        from: `${process.env.MAIL_FROM_NAME} <${process.env.MAIL_FROM_ADDRESS}>`,
                                    };
                                    await SendEmail(mail_options)
                                        .then(async (info) => {
                                            console.log("Nodemailer Email sent -------------------- ", info.response);
                                            try {
                                                let cart_recovery = await CartRecoveryEmails.findOne({
                                                    where: { store_id: data.store_id },
                                                });
                                                if (cart_recovery != null) {
                                                    let cart_recovery_data = await CartRecoveryEmails.update(
                                                        { time_sent: cart_recovery.time_sent + 1 },
                                                        {
                                                            where: { store_id: data.store_id },
                                                        }
                                                    );
                                                    console.log("-----------------updated", cart_recovery_data);
                                                }
                                            } catch (error) {
                                                console.log("err ---------- ", error);
                                            }
                                        })
                                        .catch((error) => {
                                            console.log("Nodemailer error ---------- ", error);
                                        });
                                });
                            }
                        }
                    }
                }
            } catch (err) {
                console.log("-------error-----:", err);
            }
        } //if
    });
});

cron.schedule("0 0 */12 * * *", async () => {
    // runs every 12 hrs

    if (!processCron) {
        processCron = true;
    }
    await Orders.findAll({
        is_purchased: false,
    }).then(async (order_response) => {
        if (order_response) {
            try {
                let cart_data = await Cart.findAll({
                    where: {
                        created_at: {
                            [Op.gt]: moment(now).add(12, "h").toDate(),
                        },
                    },
                });
                if (cart_data.length > 0) {
                    let html_cart;
                    let checkout;
                    let store_logo;
                    let store_name;
                    let greeting_msg;
                    let button_color = "#1A1A1A";
                    let accent_color = "#012970";
                    let checkout_id;
                    let store_id;

                    for (let cart of cart_data) {
                        html_cart +=
                            `
                        <table class="email-preview-table">
                            <tbody>
                                <tr class="email-preview-tr">
                                    <td class="email-preview-td-img">
                                        <img src = ` +
                            cart.image +
                            ` height="80">
                                    </td>
                                    <td class="email-preview-td-text">
                                        <div> ` +
                            cart.title +
                            `
                                            <div class="email-preview-text-size"> ` +
                            cart.quantity +
                            `</div>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>`;

                        checkout = await Checkouts.findAll({
                            where: {
                                id: cart.checkout_id,
                                is_purchase: false,
                            },
                        });
                    }
                    html_cart = html_cart.replace(/(undefined)/, "");

                    if (checkout.length > 0) {
                        for (let checkout_data of checkout) {
                            checkout_id = checkout_data.checkout_uuid;
                            let data = await CartRecoveryEmails.findOne({
                                where: {
                                    cart_recovery_schedule_time: "tweleve_hours",
                                    store_id: checkout_data.shop_id,
                                },
                            });

                            if (data != null) {
                                let customize_checkout = await CustomizeCheckout.findOne({
                                    where: {
                                        store_id: checkout_data.shop_id,
                                    },
                                });
                                if (customize_checkout != null) {
                                    store_logo = customize_checkout.store_logo;
                                    if (customize_checkout.button_color != "") {
                                        button_color = customize_checkout.button_color;
                                    }
                                    if (customize_checkout.accent_color != "") {
                                        accent_color = customize_checkout.accent_color;
                                    }
                                }
                                let store = await Stores.findOne({
                                    where: {
                                        id: checkout_data.shop_id,
                                    },
                                });
                                if (store != null) {
                                    store_name = store.store_name;
                                    store_id = store.id;
                                }
                                let translation = await Translations.findOne({
                                    where: {
                                        store_id: checkout_data.shop_id,
                                    },
                                });
                                if (translation != null) {
                                    greeting_msg = translation.default_greeting;
                                    if (data.cart_recovery_email_title == "") {
                                        data.cart_recovery_email_title = translation.cart_recovery_email_title;
                                    }
                                    if (data.cart_recovery_email_subject == "") {
                                        data.cart_recovery_email_subject = translation.default_subjects;
                                    }
                                    if (data.cart_recovery_email_body == "") {
                                        data.cart_recovery_email_body = translation.default_message;
                                    }
                                    if (data.cart_recovery_action_button_title == "") {
                                        data.cart_recovery_action_button_title = translation.default_call_to_action;
                                    }
                                    if (data.cart_recovery_footer_text == "") {
                                        data.cart_recovery_footer_text = translation.cart_recovery_footer_text;
                                    }
                                } else {
                                    greeting_msg = "Hi";
                                    if (data.cart_recovery_email_title == "") {
                                        data.cart_recovery_email_title = "You've left items in your cart!";
                                    }
                                    if (data.cart_recovery_email_subject == "") {
                                        data.cart_recovery_email_subject = "Your cart is waiting for you!";
                                    }
                                    if (data.cart_recovery_email_body == "") {
                                        data.cart_recovery_email_body =
                                            "you added items to your shopping cart and haven't completed your purchase. You can complete it now while they're still available. Your cart is currently waiting for you!";
                                    }
                                    if (data.cart_recovery_action_button_title == "") {
                                        data.cart_recovery_action_button_title = "Return to my order";
                                    }
                                    if (data.cart_recovery_footer_text == "") {
                                        data.cart_recovery_footer_text = "You are receiving this automatic reminder because you started ordering items on " + store_name;
                                    }
                                }
                                await Users.findOne({
                                    where: {
                                        id: data.user_id,
                                    },
                                }).then(async (user) => {
                                    /*** System Email start ***/

                                    let email_parameters = {
                                        PRODUCTS: html_cart,
                                        CART_RECOVERY_EMAIL_SUBJECT: data.cart_recovery_email_subject,
                                        CART_RECOVERY_EMAIL_TITLE: data.cart_recovery_email_title,
                                        CART_RECOVERY_EMAIL_BODY: data.cart_recovery_email_body,
                                        CART_RECOVERY_BUTTON_TEXT: data.cart_recovery_action_button_title,
                                        CART_RECOVERY_FOOTER_TEXT: data.cart_recovery_footer_text,
                                        STORE_LOGO: store_logo || `${process.env.APP_URL}/assets/img/site-logo.svg`,
                                        STORE_NAME: store_name,
                                        GREETING_MSG: greeting_msg,
                                        BUTTON_COLOR: button_color,
                                        ACCENT_COLOR: accent_color,
                                        CHECKOUT_ID: `${process.env.APP_URL}/${store_id}/check-out/${checkout_id}`,
                                        HOME_URL: `${process.env.APP_URL}`,
                                    };

                                    let email_template = await fs.readFileSync(`${appRoot}/views/email-templates/CartRecoveryEmailTemplate.html`, "utf8");
                                    email_template = email_template.replace(
                                        /PRODUCTS|CART_RECOVERY_EMAIL_SUBJECT|CART_RECOVERY_EMAIL_BODY|CART_RECOVERY_EMAIL_TITLE|CART_RECOVERY_BUTTON_TEXT|CART_RECOVERY_FOOTER_TEXT|HOME_URL|STORE_LOGO|STORE_NAME|GREETING_MSG|BUTTON_COLOR|ACCENT_COLOR|CHECKOUT_ID/gi,
                                        function (matched) {
                                            return email_parameters[matched];
                                        }
                                    );

                                    let mail_options = {
                                        html: email_template,
                                        subject: "Welcome to APP!",
                                        to: user?.email,
                                        from: `${process.env.MAIL_FROM_NAME} <${process.env.MAIL_FROM_ADDRESS}>`,
                                    };
                                    await SendEmail(mail_options)
                                        .then(async (info) => {
                                            console.log("Nodemailer Email sent -------------------- ", info.response);
                                            try {
                                                let cart_recovery = await CartRecoveryEmails.findOne({
                                                    where: { store_id: data.store_id },
                                                });
                                                if (cart_recovery != null) {
                                                    let cart_recovery_data = await CartRecoveryEmails.update(
                                                        { time_sent: cart_recovery.time_sent + 1 },
                                                        {
                                                            where: { store_id: data.store_id },
                                                        }
                                                    );
                                                    console.log("-----------------updated", cart_recovery_data);
                                                }
                                            } catch (error) {
                                                console.log("err ---------- ", error);
                                            }
                                        })
                                        .catch((error) => {
                                            console.log("Nodemailer error ---------- ", error);
                                        });
                                });
                            }
                        }
                    }
                }
            } catch (err) {
                console.log("-------error-----:", err);
            }
        } //if
    });
});

cron.schedule("0 0 0 * * *", async () => {
    // runs every day

    if (!processCron) {
        processCron = true;
    }
    await Orders.findAll({
        is_purchased: false,
    }).then(async (order_response) => {
        if (order_response) {
            try {
                let cart_data = await Cart.findAll({
                    where: {
                        created_at: {
                            [Op.gt]: moment(now).add(1, "d").toDate(),
                        },
                    },
                });
                if (cart_data.length > 0) {
                    let html_cart;
                    let checkout;
                    let store_logo;
                    let store_name;
                    let greeting_msg;
                    let button_color = "#1A1A1A";
                    let accent_color = "#012970";
                    let checkout_id;
                    let store_id;

                    for (let cart of cart_data) {
                        html_cart +=
                            `
                        <table class="email-preview-table">
                            <tbody>
                                <tr class="email-preview-tr">
                                    <td class="email-preview-td-img">
                                        <img src = ` +
                            cart.image +
                            ` height="80">
                                    </td>
                                    <td class="email-preview-td-text">
                                        <div> ` +
                            cart.title +
                            `
                                            <div class="email-preview-text-size"> ` +
                            cart.quantity +
                            `</div>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>`;

                        checkout = await Checkouts.findAll({
                            where: {
                                id: cart.checkout_id,
                                is_purchase: false,
                            },
                        });
                    }
                    html_cart = html_cart.replace(/(undefined)/, "");

                    if (checkout.length > 0) {
                        for (let checkout_data of checkout) {
                            checkout_id = checkout_data.checkout_uuid;
                            let data = await CartRecoveryEmails.findOne({
                                where: {
                                    cart_recovery_schedule_time: "one_day",
                                    store_id: checkout_data.shop_id,
                                },
                            });

                            if (data != null) {
                                let customize_checkout = await CustomizeCheckout.findOne({
                                    where: {
                                        store_id: checkout_data.shop_id,
                                    },
                                });
                                if (customize_checkout != null) {
                                    store_logo = customize_checkout.store_logo;
                                    if (customize_checkout.button_color != "") {
                                        button_color = customize_checkout.button_color;
                                    }
                                    if (customize_checkout.accent_color != "") {
                                        accent_color = customize_checkout.accent_color;
                                    }
                                }
                                let store = await Stores.findOne({
                                    where: {
                                        id: checkout_data.shop_id,
                                    },
                                });
                                if (store != null) {
                                    store_name = store.store_name;
                                    store_id = store.id;
                                }
                                let translation = await Translations.findOne({
                                    where: {
                                        store_id: checkout_data.shop_id,
                                    },
                                });
                                if (translation != null) {
                                    greeting_msg = translation.default_greeting;
                                    if (data.cart_recovery_email_title == "") {
                                        data.cart_recovery_email_title = translation.cart_recovery_email_title;
                                    }
                                    if (data.cart_recovery_email_subject == "") {
                                        data.cart_recovery_email_subject = translation.default_subjects;
                                    }
                                    if (data.cart_recovery_email_body == "") {
                                        data.cart_recovery_email_body = translation.default_message;
                                    }
                                    if (data.cart_recovery_action_button_title == "") {
                                        data.cart_recovery_action_button_title = translation.default_call_to_action;
                                    }
                                    if (data.cart_recovery_footer_text == "") {
                                        data.cart_recovery_footer_text = translation.cart_recovery_footer_text;
                                    }
                                } else {
                                    greeting_msg = "Hi";
                                    if (data.cart_recovery_email_title == "") {
                                        data.cart_recovery_email_title = "You've left items in your cart!";
                                    }
                                    if (data.cart_recovery_email_subject == "") {
                                        data.cart_recovery_email_subject = "Your cart is waiting for you!";
                                    }
                                    if (data.cart_recovery_email_body == "") {
                                        data.cart_recovery_email_body =
                                            "you added items to your shopping cart and haven't completed your purchase. You can complete it now while they're still available. Your cart is currently waiting for you!";
                                    }
                                    if (data.cart_recovery_action_button_title == "") {
                                        data.cart_recovery_action_button_title = "Return to my order";
                                    }
                                    if (data.cart_recovery_footer_text == "") {
                                        data.cart_recovery_footer_text = "You are receiving this automatic reminder because you started ordering items on " + store_name;
                                    }
                                }
                                await Users.findOne({
                                    where: {
                                        id: data.user_id,
                                    },
                                }).then(async (user) => {
                                    /*** System Email start ***/

                                    let email_parameters = {
                                        PRODUCTS: html_cart,
                                        CART_RECOVERY_EMAIL_SUBJECT: data.cart_recovery_email_subject,
                                        CART_RECOVERY_EMAIL_TITLE: data.cart_recovery_email_title,
                                        CART_RECOVERY_EMAIL_BODY: data.cart_recovery_email_body,
                                        CART_RECOVERY_BUTTON_TEXT: data.cart_recovery_action_button_title,
                                        CART_RECOVERY_FOOTER_TEXT: data.cart_recovery_footer_text,
                                        STORE_LOGO: store_logo || `${process.env.APP_URL}/assets/img/site-logo.svg`,
                                        STORE_NAME: store_name,
                                        GREETING_MSG: greeting_msg,
                                        BUTTON_COLOR: button_color,
                                        ACCENT_COLOR: accent_color,
                                        CHECKOUT_ID: `${process.env.APP_URL}/${store_id}/check-out/${checkout_id}`,
                                        HOME_URL: `${process.env.APP_URL}`,
                                    };

                                    let email_template = await fs.readFileSync(`${appRoot}/views/email-templates/CartRecoveryEmailTemplate.html`, "utf8");
                                    email_template = email_template.replace(
                                        /PRODUCTS|CART_RECOVERY_EMAIL_SUBJECT|CART_RECOVERY_EMAIL_BODY|CART_RECOVERY_EMAIL_TITLE|CART_RECOVERY_BUTTON_TEXT|CART_RECOVERY_FOOTER_TEXT|HOME_URL|STORE_LOGO|STORE_NAME|GREETING_MSG|BUTTON_COLOR|ACCENT_COLOR|CHECKOUT_ID/gi,
                                        function (matched) {
                                            return email_parameters[matched];
                                        }
                                    );

                                    let mail_options = {
                                        html: email_template,
                                        subject: "Welcome to APP!",
                                        to: user?.email,
                                        from: `${process.env.MAIL_FROM_NAME} <${process.env.MAIL_FROM_ADDRESS}>`,
                                    };
                                    await SendEmail(mail_options)
                                        .then(async (info) => {
                                            console.log("Nodemailer Email sent -------------------- ", info.response);
                                            try {
                                                let cart_recovery = await CartRecoveryEmails.findOne({
                                                    where: { store_id: data.store_id },
                                                });
                                                if (cart_recovery != null) {
                                                    let cart_recovery_data = await CartRecoveryEmails.update(
                                                        { time_sent: cart_recovery.time_sent + 1 },
                                                        {
                                                            where: { store_id: data.store_id },
                                                        }
                                                    );
                                                    console.log("-----------------updated", cart_recovery_data);
                                                }
                                            } catch (error) {
                                                console.log("err ---------- ", error);
                                            }
                                        })
                                        .catch((error) => {
                                            console.log("Nodemailer error ---------- ", error);
                                        });
                                });
                            }
                        }
                    }
                }
            } catch (err) {
                console.log("-------error-----:", err);
            }
        } //if
    });
});

cron.schedule("0 0 */2 * * *", async () => {
    // runs every 2 day

    if (!processCron) {
        processCron = true;
    }
    await Orders.findAll({
        is_purchased: false,
    }).then(async (order_response) => {
        if (order_response) {
            try {
                let cart_data = await Cart.findAll({
                    where: {
                        created_at: {
                            [Op.gt]: moment(now).add(2, "d").toDate(),
                        },
                    },
                });
                if (cart_data.length > 0) {
                    let html_cart;
                    let checkout;
                    let store_logo;
                    let store_name;
                    let greeting_msg;
                    let button_color = "#1A1A1A";
                    let accent_color = "#012970";
                    let checkout_id;
                    let store_id;

                    for (let cart of cart_data) {
                        html_cart +=
                            `
                        <table class="email-preview-table">
                            <tbody>
                                <tr class="email-preview-tr">
                                    <td class="email-preview-td-img">
                                        <img src = ` +
                            cart.image +
                            ` height="80">
                                    </td>
                                    <td class="email-preview-td-text">
                                        <div> ` +
                            cart.title +
                            `
                                            <div class="email-preview-text-size"> ` +
                            cart.quantity +
                            `</div>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>`;

                        checkout = await Checkouts.findAll({
                            where: {
                                id: cart.checkout_id,
                                is_purchase: false,
                            },
                        });
                    }
                    html_cart = html_cart.replace(/(undefined)/, "");

                    if (checkout.length > 0) {
                        for (let checkout_data of checkout) {
                            checkout_id = checkout_data.checkout_uuid;
                            let data = await CartRecoveryEmails.findOne({
                                where: {
                                    cart_recovery_schedule_time: "two_days",
                                    store_id: checkout_data.shop_id,
                                },
                            });

                            if (data != null) {
                                let customize_checkout = await CustomizeCheckout.findOne({
                                    where: {
                                        store_id: checkout_data.shop_id,
                                    },
                                });
                                if (customize_checkout != null) {
                                    store_logo = customize_checkout.store_logo;
                                    if (customize_checkout.button_color != "") {
                                        button_color = customize_checkout.button_color;
                                    }
                                    if (customize_checkout.accent_color != "") {
                                        accent_color = customize_checkout.accent_color;
                                    }
                                }
                                let store = await Stores.findOne({
                                    where: {
                                        id: checkout_data.shop_id,
                                    },
                                });
                                if (store != null) {
                                    store_name = store.store_name;
                                    store_id = store.id;
                                }
                                let translation = await Translations.findOne({
                                    where: {
                                        store_id: checkout_data.shop_id,
                                    },
                                });
                                if (translation != null) {
                                    greeting_msg = translation.default_greeting;
                                    if (data.cart_recovery_email_title == "") {
                                        data.cart_recovery_email_title = translation.cart_recovery_email_title;
                                    }
                                    if (data.cart_recovery_email_subject == "") {
                                        data.cart_recovery_email_subject = translation.default_subjects;
                                    }
                                    if (data.cart_recovery_email_body == "") {
                                        data.cart_recovery_email_body = translation.default_message;
                                    }
                                    if (data.cart_recovery_action_button_title == "") {
                                        data.cart_recovery_action_button_title = translation.default_call_to_action;
                                    }
                                    if (data.cart_recovery_footer_text == "") {
                                        data.cart_recovery_footer_text = translation.cart_recovery_footer_text;
                                    }
                                } else {
                                    greeting_msg = "Hi";
                                    if (data.cart_recovery_email_title == "") {
                                        data.cart_recovery_email_title = "You've left items in your cart!";
                                    }
                                    if (data.cart_recovery_email_subject == "") {
                                        data.cart_recovery_email_subject = "Your cart is waiting for you!";
                                    }
                                    if (data.cart_recovery_email_body == "") {
                                        data.cart_recovery_email_body =
                                            "you added items to your shopping cart and haven't completed your purchase. You can complete it now while they're still available. Your cart is currently waiting for you!";
                                    }
                                    if (data.cart_recovery_action_button_title == "") {
                                        data.cart_recovery_action_button_title = "Return to my order";
                                    }
                                    if (data.cart_recovery_footer_text == "") {
                                        data.cart_recovery_footer_text = "You are receiving this automatic reminder because you started ordering items on " + store_name;
                                    }
                                }
                                await Users.findOne({
                                    where: {
                                        id: data.user_id,
                                    },
                                }).then(async (user) => {
                                    /*** System Email start ***/

                                    let email_parameters = {
                                        PRODUCTS: html_cart,
                                        CART_RECOVERY_EMAIL_SUBJECT: data.cart_recovery_email_subject,
                                        CART_RECOVERY_EMAIL_TITLE: data.cart_recovery_email_title,
                                        CART_RECOVERY_EMAIL_BODY: data.cart_recovery_email_body,
                                        CART_RECOVERY_BUTTON_TEXT: data.cart_recovery_action_button_title,
                                        CART_RECOVERY_FOOTER_TEXT: data.cart_recovery_footer_text,
                                        STORE_LOGO: store_logo || `${process.env.APP_URL}/assets/img/site-logo.svg`,
                                        STORE_NAME: store_name,
                                        GREETING_MSG: greeting_msg,
                                        BUTTON_COLOR: button_color,
                                        ACCENT_COLOR: accent_color,
                                        CHECKOUT_ID: `${process.env.APP_URL}/${store_id}/check-out/${checkout_id}`,
                                        HOME_URL: `${process.env.APP_URL}`,
                                    };

                                    let email_template = await fs.readFileSync(`${appRoot}/views/email-templates/CartRecoveryEmailTemplate.html`, "utf8");
                                    email_template = email_template.replace(
                                        /PRODUCTS|CART_RECOVERY_EMAIL_SUBJECT|CART_RECOVERY_EMAIL_BODY|CART_RECOVERY_EMAIL_TITLE|CART_RECOVERY_BUTTON_TEXT|CART_RECOVERY_FOOTER_TEXT|HOME_URL|STORE_LOGO|STORE_NAME|GREETING_MSG|BUTTON_COLOR|ACCENT_COLOR|CHECKOUT_ID/gi,
                                        function (matched) {
                                            return email_parameters[matched];
                                        }
                                    );

                                    let mail_options = {
                                        html: email_template,
                                        subject: "Welcome to APP!",
                                        to: user?.email,
                                        from: `${process.env.MAIL_FROM_NAME} <${process.env.MAIL_FROM_ADDRESS}>`,
                                    };
                                    await SendEmail(mail_options)
                                        .then(async (info) => {
                                            console.log("Nodemailer Email sent -------------------- ", info.response);
                                            try {
                                                let cart_recovery = await CartRecoveryEmails.findOne({
                                                    where: { store_id: data.store_id },
                                                });
                                                if (cart_recovery != null) {
                                                    let cart_recovery_data = await CartRecoveryEmails.update(
                                                        { time_sent: cart_recovery.time_sent + 1 },
                                                        {
                                                            where: { store_id: data.store_id },
                                                        }
                                                    );
                                                    console.log("-----------------updated", cart_recovery_data);
                                                }
                                            } catch (error) {
                                                console.log("err ---------- ", error);
                                            }
                                        })
                                        .catch((error) => {
                                            console.log("Nodemailer error ---------- ", error);
                                        });
                                });
                            }
                        }
                    }
                }
            } catch (err) {
                console.log("-------error-----:", err);
            }
        } //if
    });
});

cron.schedule("0 0 */3 * * *", async () => {
    // runs every 3 day

    if (!processCron) {
        processCron = true;
    }
    await Orders.findAll({
        is_purchased: false,
    }).then(async (order_response) => {
        if (order_response) {
            try {
                let cart_data = await Cart.findAll({
                    where: {
                        created_at: {
                            [Op.gt]: moment(now).add(3, "d").toDate(),
                        },
                    },
                });
                if (cart_data.length > 0) {
                    let html_cart;
                    let checkout;
                    let store_logo;
                    let store_name;
                    let greeting_msg;
                    let button_color = "#1A1A1A";
                    let accent_color = "#012970";
                    let checkout_id;
                    let store_id;

                    for (let cart of cart_data) {
                        html_cart +=
                            `
                        <table class="email-preview-table">
                            <tbody>
                                <tr class="email-preview-tr">
                                    <td class="email-preview-td-img">
                                        <img src = ` +
                            cart.image +
                            ` height="80">
                                    </td>
                                    <td class="email-preview-td-text">
                                        <div> ` +
                            cart.title +
                            `
                                            <div class="email-preview-text-size"> ` +
                            cart.quantity +
                            `</div>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>`;

                        checkout = await Checkouts.findAll({
                            where: {
                                id: cart.checkout_id,
                                is_purchase: false,
                            },
                        });
                    }
                    html_cart = html_cart.replace(/(undefined)/, "");

                    if (checkout.length > 0) {
                        for (let checkout_data of checkout) {
                            checkout_id = checkout_data.checkout_uuid;
                            let data = await CartRecoveryEmails.findOne({
                                where: {
                                    cart_recovery_schedule_time: "three_days",
                                    store_id: checkout_data.shop_id,
                                },
                            });

                            if (data != null) {
                                let customize_checkout = await CustomizeCheckout.findOne({
                                    where: {
                                        store_id: checkout_data.shop_id,
                                    },
                                });
                                if (customize_checkout != null) {
                                    store_logo = customize_checkout.store_logo;
                                    if (customize_checkout.button_color != "") {
                                        button_color = customize_checkout.button_color;
                                    }
                                    if (customize_checkout.accent_color != "") {
                                        accent_color = customize_checkout.accent_color;
                                    }
                                }
                                let store = await Stores.findOne({
                                    where: {
                                        id: checkout_data.shop_id,
                                    },
                                });
                                if (store != null) {
                                    store_name = store.store_name;
                                    store_id = store.id;
                                }
                                let translation = await Translations.findOne({
                                    where: {
                                        store_id: checkout_data.shop_id,
                                    },
                                });
                                if (translation != null) {
                                    greeting_msg = translation.default_greeting;
                                    if (data.cart_recovery_email_title == "") {
                                        data.cart_recovery_email_title = translation.cart_recovery_email_title;
                                    }
                                    if (data.cart_recovery_email_subject == "") {
                                        data.cart_recovery_email_subject = translation.default_subjects;
                                    }
                                    if (data.cart_recovery_email_body == "") {
                                        data.cart_recovery_email_body = translation.default_message;
                                    }
                                    if (data.cart_recovery_action_button_title == "") {
                                        data.cart_recovery_action_button_title = translation.default_call_to_action;
                                    }
                                    if (data.cart_recovery_footer_text == "") {
                                        data.cart_recovery_footer_text = translation.cart_recovery_footer_text;
                                    }
                                } else {
                                    greeting_msg = "Hi";
                                    if (data.cart_recovery_email_title == "") {
                                        data.cart_recovery_email_title = "You've left items in your cart!";
                                    }
                                    if (data.cart_recovery_email_subject == "") {
                                        data.cart_recovery_email_subject = "Your cart is waiting for you!";
                                    }
                                    if (data.cart_recovery_email_body == "") {
                                        data.cart_recovery_email_body =
                                            "you added items to your shopping cart and haven't completed your purchase. You can complete it now while they're still available. Your cart is currently waiting for you!";
                                    }
                                    if (data.cart_recovery_action_button_title == "") {
                                        data.cart_recovery_action_button_title = "Return to my order";
                                    }
                                    if (data.cart_recovery_footer_text == "") {
                                        data.cart_recovery_footer_text = "You are receiving this automatic reminder because you started ordering items on " + store_name;
                                    }
                                }
                                await Users.findOne({
                                    where: {
                                        id: data.user_id,
                                    },
                                }).then(async (user) => {
                                    /*** System Email start ***/

                                    let email_parameters = {
                                        PRODUCTS: html_cart,
                                        CART_RECOVERY_EMAIL_SUBJECT: data.cart_recovery_email_subject,
                                        CART_RECOVERY_EMAIL_TITLE: data.cart_recovery_email_title,
                                        CART_RECOVERY_EMAIL_BODY: data.cart_recovery_email_body,
                                        CART_RECOVERY_BUTTON_TEXT: data.cart_recovery_action_button_title,
                                        CART_RECOVERY_FOOTER_TEXT: data.cart_recovery_footer_text,
                                        STORE_LOGO: store_logo || `${process.env.APP_URL}/assets/img/site-logo.svg`,
                                        STORE_NAME: store_name,
                                        GREETING_MSG: greeting_msg,
                                        BUTTON_COLOR: button_color,
                                        ACCENT_COLOR: accent_color,
                                        CHECKOUT_ID: `${process.env.APP_URL}/${store_id}/check-out/${checkout_id}`,
                                        HOME_URL: `${process.env.APP_URL}`,
                                    };

                                    let email_template = await fs.readFileSync(`${appRoot}/views/email-templates/CartRecoveryEmailTemplate.html`, "utf8");
                                    email_template = email_template.replace(
                                        /PRODUCTS|CART_RECOVERY_EMAIL_SUBJECT|CART_RECOVERY_EMAIL_BODY|CART_RECOVERY_EMAIL_TITLE|CART_RECOVERY_BUTTON_TEXT|CART_RECOVERY_FOOTER_TEXT|HOME_URL|STORE_LOGO|STORE_NAME|GREETING_MSG|BUTTON_COLOR|ACCENT_COLOR|CHECKOUT_ID/gi,
                                        function (matched) {
                                            return email_parameters[matched];
                                        }
                                    );

                                    let mail_options = {
                                        html: email_template,
                                        subject: "Welcome to APP!",
                                        to: user?.email,
                                        from: `${process.env.MAIL_FROM_NAME} <${process.env.MAIL_FROM_ADDRESS}>`,
                                    };
                                    await SendEmail(mail_options)
                                        .then(async (info) => {
                                            console.log("Nodemailer Email sent -------------------- ", info.response);
                                            try {
                                                let cart_recovery = await CartRecoveryEmails.findOne({
                                                    where: { store_id: data.store_id },
                                                });
                                                if (cart_recovery != null) {
                                                    let cart_recovery_data = await CartRecoveryEmails.update(
                                                        { time_sent: cart_recovery.time_sent + 1 },
                                                        {
                                                            where: { store_id: data.store_id },
                                                        }
                                                    );
                                                    console.log("-----------------updated", cart_recovery_data);
                                                }
                                            } catch (error) {
                                                console.log("err ---------- ", error);
                                            }
                                        })
                                        .catch((error) => {
                                            console.log("Nodemailer error ---------- ", error);
                                        });
                                });
                            }
                        }
                    }
                }
            } catch (err) {
                console.log("-------error-----:", err);
            }
        } //if
    });
});

cron.schedule("0 0 */5 * * *", async () => {
    // runs every 5 day

    if (!processCron) {
        processCron = true;
    }
    await Orders.findAll({
        is_purchased: false,
    }).then(async (order_response) => {
        if (order_response) {
            try {
                let cart_data = await Cart.findAll({
                    where: {
                        created_at: {
                            [Op.gt]: moment(now).add(5, "d").toDate(),
                        },
                    },
                });
                if (cart_data.length > 0) {
                    let html_cart;
                    let checkout;
                    let store_logo;
                    let store_name;
                    let greeting_msg;
                    let button_color = "#1A1A1A";
                    let accent_color = "#012970";
                    let checkout_id;
                    let store_id;

                    for (let cart of cart_data) {
                        html_cart +=
                            `
                        <table class="email-preview-table">
                            <tbody>
                                <tr class="email-preview-tr">
                                    <td class="email-preview-td-img">
                                        <img src = ` +
                            cart.image +
                            ` height="80">
                                    </td>
                                    <td class="email-preview-td-text">
                                        <div> ` +
                            cart.title +
                            `
                                            <div class="email-preview-text-size"> ` +
                            cart.quantity +
                            `</div>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>`;

                        checkout = await Checkouts.findAll({
                            where: {
                                id: cart.checkout_id,
                                is_purchase: false,
                            },
                        });
                    }
                    html_cart = html_cart.replace(/(undefined)/, "");

                    if (checkout.length > 0) {
                        for (let checkout_data of checkout) {
                            checkout_id = checkout_data.checkout_uuid;
                            let data = await CartRecoveryEmails.findOne({
                                where: {
                                    cart_recovery_schedule_time: "five_days",
                                    store_id: checkout_data.shop_id,
                                },
                            });

                            if (data != null) {
                                let customize_checkout = await CustomizeCheckout.findOne({
                                    where: {
                                        store_id: checkout_data.shop_id,
                                    },
                                });
                                if (customize_checkout != null) {
                                    store_logo = customize_checkout.store_logo;
                                    if (customize_checkout.button_color != "") {
                                        button_color = customize_checkout.button_color;
                                    }
                                    if (customize_checkout.accent_color != "") {
                                        accent_color = customize_checkout.accent_color;
                                    }
                                }
                                let store = await Stores.findOne({
                                    where: {
                                        id: checkout_data.shop_id,
                                    },
                                });
                                if (store != null) {
                                    store_name = store.store_name;
                                    store_id = store.id;
                                }
                                let translation = await Translations.findOne({
                                    where: {
                                        store_id: checkout_data.shop_id,
                                    },
                                });
                                if (translation != null) {
                                    greeting_msg = translation.default_greeting;
                                    if (data.cart_recovery_email_title == "") {
                                        data.cart_recovery_email_title = translation.cart_recovery_email_title;
                                    }
                                    if (data.cart_recovery_email_subject == "") {
                                        data.cart_recovery_email_subject = translation.default_subjects;
                                    }
                                    if (data.cart_recovery_email_body == "") {
                                        data.cart_recovery_email_body = translation.default_message;
                                    }
                                    if (data.cart_recovery_action_button_title == "") {
                                        data.cart_recovery_action_button_title = translation.default_call_to_action;
                                    }
                                    if (data.cart_recovery_footer_text == "") {
                                        data.cart_recovery_footer_text = translation.cart_recovery_footer_text;
                                    }
                                } else {
                                    greeting_msg = "Hi";
                                    if (data.cart_recovery_email_title == "") {
                                        data.cart_recovery_email_title = "You've left items in your cart!";
                                    }
                                    if (data.cart_recovery_email_subject == "") {
                                        data.cart_recovery_email_subject = "Your cart is waiting for you!";
                                    }
                                    if (data.cart_recovery_email_body == "") {
                                        data.cart_recovery_email_body =
                                            "you added items to your shopping cart and haven't completed your purchase. You can complete it now while they're still available. Your cart is currently waiting for you!";
                                    }
                                    if (data.cart_recovery_action_button_title == "") {
                                        data.cart_recovery_action_button_title = "Return to my order";
                                    }
                                    if (data.cart_recovery_footer_text == "") {
                                        data.cart_recovery_footer_text = "You are receiving this automatic reminder because you started ordering items on " + store_name;
                                    }
                                }
                                await Users.findOne({
                                    where: {
                                        id: data.user_id,
                                    },
                                }).then(async (user) => {
                                    /*** System Email start ***/

                                    let email_parameters = {
                                        PRODUCTS: html_cart,
                                        CART_RECOVERY_EMAIL_SUBJECT: data.cart_recovery_email_subject,
                                        CART_RECOVERY_EMAIL_TITLE: data.cart_recovery_email_title,
                                        CART_RECOVERY_EMAIL_BODY: data.cart_recovery_email_body,
                                        CART_RECOVERY_BUTTON_TEXT: data.cart_recovery_action_button_title,
                                        CART_RECOVERY_FOOTER_TEXT: data.cart_recovery_footer_text,
                                        STORE_LOGO: store_logo || `${process.env.APP_URL}/assets/img/site-logo.svg`,
                                        STORE_NAME: store_name,
                                        GREETING_MSG: greeting_msg,
                                        BUTTON_COLOR: button_color,
                                        ACCENT_COLOR: accent_color,
                                        CHECKOUT_ID: `${process.env.APP_URL}/${store_id}/check-out/${checkout_id}`,
                                        HOME_URL: `${process.env.APP_URL}`,
                                    };

                                    let email_template = await fs.readFileSync(`${appRoot}/views/email-templates/CartRecoveryEmailTemplate.html`, "utf8");
                                    email_template = email_template.replace(
                                        /PRODUCTS|CART_RECOVERY_EMAIL_SUBJECT|CART_RECOVERY_EMAIL_BODY|CART_RECOVERY_EMAIL_TITLE|CART_RECOVERY_BUTTON_TEXT|CART_RECOVERY_FOOTER_TEXT|HOME_URL|STORE_LOGO|STORE_NAME|GREETING_MSG|BUTTON_COLOR|ACCENT_COLOR|CHECKOUT_ID/gi,
                                        function (matched) {
                                            return email_parameters[matched];
                                        }
                                    );

                                    let mail_options = {
                                        html: email_template,
                                        subject: "Welcome to APP!",
                                        to: user?.email,
                                        from: `${process.env.MAIL_FROM_NAME} <${process.env.MAIL_FROM_ADDRESS}>`,
                                    };
                                    await SendEmail(mail_options)
                                        .then(async (info) => {
                                            console.log("Nodemailer Email sent -------------------- ", info.response);
                                            try {
                                                let cart_recovery = await CartRecoveryEmails.findOne({
                                                    where: { store_id: data.store_id },
                                                });
                                                if (cart_recovery != null) {
                                                    let cart_recovery_data = await CartRecoveryEmails.update(
                                                        { time_sent: cart_recovery.time_sent + 1 },
                                                        {
                                                            where: { store_id: data.store_id },
                                                        }
                                                    );
                                                    console.log("-----------------updated", cart_recovery_data);
                                                }
                                            } catch (error) {
                                                console.log("err ---------- ", error);
                                            }
                                        })
                                        .catch((error) => {
                                            console.log("Nodemailer error ---------- ", error);
                                        });
                                });
                            }
                        }
                    }
                }
            } catch (err) {
                console.log("-------error-----:", err);
            }
        } //if
    });
});