const fs = require("fs");

const models = require("../models");

module.exports.checkout_templates = async (req, res, next) => {
    const { store_id } = req.params;
    const { auth_user, auth_store } = req;

    if (req.method === "POST") {
        try {
            let request_body = req.body;

            let checkout_templates = await models.CheckoutTemplates.findAndCountAll({
                limit: request_body?.limit,
                offset: request_body?.offset,
                order: [["id", "ASC"]],
            });

            return res.json({
                status: true,
                data: checkout_templates?.rows,
                recordsTotal: checkout_templates.count,
            });
        } catch (error) {
            return res.json({
                status: false,
                message: error?.message ? error.message : "Something went wrong. Please try again.",
            });
        }
    }

    // Get Store Customize Checkout
    let customize_checkout = await models.CustomizeCheckout.findOne({
        attributes: ["template_id", "template_code"],
        where: {
            store_id: store_id
        },
    });

    return res.render("backend/CheckoutTemplates/checkout_templates", {
        store_id: store_id,
        auth_user: auth_user,
        auth_store: auth_store,
        active_menu: "checkout-templates",

        customize_checkout: customize_checkout
    });
}

module.exports.change_checkout_templates = async (req, res, next) => {
    if (req.method === "POST") {
        try {
            let request_body = req.body;

            // Get Store Detail
            let store_detail = await models.Stores.findOne({
                where: {
                    id: request_body?.store_id
                },
                attributes: ["id", "user_id", "store_name", "store_domain", "store_token"],
            })

            let checkout_template = await models.CheckoutTemplates.findOne({
                where: {
                    id: request_body?.template_id
                }
            });

            let template_code = checkout_template?.template_code;

            // Replace constant value with the database variable
            let replace_parametars = {
                font_size: `${checkout_template?.font_size}px`,
                accent_color: checkout_template?.accent_color,
                button_color: checkout_template?.button_color,
                error_color: checkout_template?.error_color,
            };

            let checkout_template_css = await fs.readFileSync(`${appRoot}/public/assets/css/checkout-template/checkout-template-${template_code}-dummy.css`, "utf8");
            checkout_template_css = checkout_template_css.replace(/font_size|accent_color|button_color|error_color/gi, function (matched) {
                return replace_parametars[matched];
            });

            let checkout_template_writeStream = await fs.createWriteStream(`${appRoot}/public/assets/css/store-css/checkout-template-${store_detail?.id}.css`);
            checkout_template_writeStream.write(checkout_template_css);
            checkout_template_writeStream.end();

            let checkout_thankyou_css = await fs.readFileSync(`${appRoot}/public/assets/css/checkout-template/checkout-thankyou-${template_code}-dummy.css`, "utf8");
            checkout_thankyou_css = checkout_thankyou_css.replace(/font_size|accent_color|button_color|error_color/gi, function (matched) {
                return replace_parametars[matched];
            });

            let checkout_thankyou_writeStream = await fs.createWriteStream(`${appRoot}/public/assets/css/store-css/checkout-thankyou-${store_detail?.id}.css`);
            checkout_thankyou_writeStream.write(checkout_thankyou_css);
            checkout_thankyou_writeStream.end();

            const customize_checkout = await models.CustomizeCheckout.findOne({
                where: {
                    store_id: request_body?.store_id,
                },
            })

            if (customize_checkout) {
                await models.CustomizeCheckout.update({
                    font_size: checkout_template?.font_size,
                    accent_color: checkout_template?.accent_color,
                    button_color: checkout_template?.button_color,
                    error_color: checkout_template?.error_color,
    
                    template_id: checkout_template?.id,
                    template_code: checkout_template?.template_code,
                }, {
                    where: {
                        store_id: request_body?.store_id,
                    },
                });
            } else {
                await models.CustomizeCheckout.create(request_body);
            }

            return res.json({
                status: true,
                redirect_url: `${process.env.APP_URL}/${request_body?.store_id}/customize-checkout`,
                message: "Checkout template selected successfully",
            });
        } catch (error) {
            console.error("change_checkout_templates error -------", error);
            return res.json({
                status: false,
                message: error?.message ? error.message : "Something went wrong. Please try again.",
            });
        }
    }
}

module.exports.preview_checkout_new = async (req, res, next) => {
    const { store_id } = req.params;
    const { auth_user, auth_store } = req;

    // Get Countries From Database
    let countries = await models.Countries.findAll({
        order: [["country_name", "ASC"]],
    });

    // Get Store Detail
    let store_detail = await models.Stores.findOne({
        where: {
            id: store_id
        },
        attributes: ["id", "user_id", "store_name", "store_domain", "store_token"],
    })

    // Get Store Customize Checkout
    let customize_checkout = await models.CustomizeCheckout.findOne({
        where: {
            store_id: store_id
        },
        include: [
            {
                model: models.CustomizeAboutSections,
            },
        ],
    });

    // Get Store ShippingRates Details
    let shipping_options = await models.ShippingRates.findAll({
        where: {
            store_id: store_id
        },
    });

    // Get Store PaymentMethods Details
    let payment_methods = await models.PaymentMethods.findAll({
        order: [['method_name', 'DESC']],
        where: {
            store_id: store_id
        },
    });

    // Get Store Translations Details
    let language_translation = await models.Translations.findOne({
        where: {
            store_id: store_id,
        },
    });

    let card_accepted = [];
    if (payment_methods) {
        payment_methods.forEach((payment_method, payment_method_key) => {
            let card_html = '';

            if (payment_method?.method_name === "Stripe") {
                card_accepted = payment_method?.card_accepted;
                for (let card_accepted_key in payment_method?.card_accepted) {
                    let card_accepted = payment_method?.card_accepted[card_accepted_key];
                    if (card_accepted_key >= 3) {
                        card_html += `<small>&amp; more</small>`;
                        break;
                    }
                    card_html += `<img src="/assets/img/card-icons/${card_accepted}.svg">`;
                };
            }

            if (payment_method?.method_name === "Checkout.com") {
                card_accepted = payment_method?.card_accepted;
                for (let card_accepted_key in payment_method?.card_accepted) {
                    let card_accepted = payment_method?.card_accepted[card_accepted_key];
                    if (card_accepted_key >= 3) {
                        card_html += `<small>&amp; more</small>`;
                        break;
                    }
                    card_html += `<img src="/assets/img/card-icons/${card_accepted}.svg">`;
                };
            }

            if (payment_method?.method_name === "Payout Master") {
                card_html = `<img src="/assets/img/card-icons/visa.svg"><img src="/assets/img/card-icons/mastercard.svg"><img src="/assets/img/card-icons/amex.svg"><small>&amp; more</small>`;
            }

            if (payment_method?.method_name === "Revolut") {
                card_html = `<img src="/assets/img/card-icons/visa.svg"><img src="/assets/img/card-icons/mastercard.svg"><img src="/assets/img/card-icons/amex.svg"><small>&amp; more</small>`;
            }

            payment_method["card_html"] = card_html;
        });
    }

    res.render(`backend/CheckoutTemplates/checkout_template_checkout`, {
        right_sides: [],
        store_id: store_id,
        version: customize_checkout?.template_code,
        body_class: `checkout-template-${customize_checkout?.template_code}`,

        countries: countries,
        store_detail: store_detail,

        customize_checkout: customize_checkout,
        money_format: customize_checkout.money_format ? customize_checkout.money_format.substring(0, 1) : "$",

        shipping_options: shipping_options,
        payment_methods: payment_methods,
        language_translation: language_translation,
    });
};