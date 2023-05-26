const fs = require("fs");
const path = require("path");
const request = require("request-promise");
const { renderFile } = require("pug");

const { UserSubscriptions, CustomizeAboutSections, CustomizeCheckout, Stores, ShippingRates, PaymentMethods, Translations, States,Taxes, Countries } = require("../models");

module.exports.customize_checkout = async (req, res, next) => {
    const { store_id } = req.params;
    const auth_user = req?.auth_user;
    const auth_store = req?.auth_store;

    if (req.method === "POST") {
        try {
            let request_body = req.body;

            request_body.user_id = auth_user?.id;
            let customize_checkout_id = request_body?.customize_checkout_id;
            delete request_body?.customize_checkout_id;

            request_body.require_phone_number = request_body?.require_phone_number ? true : false;
            request_body.require_address_number = request_body?.require_address_number ? true : false;
            request_body.check_accepts_marketing = request_body?.check_accepts_marketing ? true : false;
            request_body.display_timer = request_body?.display_timer ? true : false;
            request_body.display_branding = request_body?.display_branding ? true : false;
            request_body.display_discount = request_body?.display_discount ? true : false;

            // Checkout details create and update
            if (customize_checkout_id) {
                request_body.updated_by = auth_user?.id;
                await CustomizeCheckout.update(request_body, {
                    where: {
                        id: customize_checkout_id,
                    },
                });
            } else {
                request_body.created_by = auth_user?.id;
                let customize_checkout = await CustomizeCheckout.create(request_body);
                customize_checkout_id = customize_checkout?.id;

                // Update Customize Checkout True
                // await Stores.update(
                //     { customize_checkout: true },
                //     {
                //         where: {
                //             id: request_body?.store_id,
                //         },
                //     }
                // );
            }

            // Checkout section details create and update
            for (let section_key in request_body?.section_title) {
                let section_detail = {
                    store_id: request_body?.store_id,
                    customize_checkout_id: customize_checkout_id,
                    section_title: request_body?.section_title[section_key],
                    section_icon: request_body?.section_icon[section_key],
                    section_description: request_body?.section_description[section_key],
                };
                if (request_body?.section_id && request_body?.section_id[section_key]) {
                    section_detail = { ...section_detail, updated_by: auth_user?.id };
                    await CustomizeAboutSections.update(section_detail, {
                        where: {
                            id: request_body?.section_id[section_key],
                        },
                    });
                } else {
                    section_detail = { ...section_detail, created_by: auth_user?.id };
                    await CustomizeAboutSections.create(section_detail);
                }
            }

            return res.json({
                status: true,
                message: "Checkout details submit",
                store_id: request_body.store_id,
                redirect_url: `${process.env.APP_URL}/${request_body?.store_id}/customize-checkout`,
            });
        } catch (error) {
            console.error("customize_checkout error--------------", error);
            return res.json({
                status: false,
                message: "Something went wrong. Please try again.",
            });
        }
    }

    let customize_checkout = await CustomizeCheckout.findOne({
        where: {
            store_id: store_id,
        },
        include: [
            {
                model: CustomizeAboutSections,
            },
        ],
    }).then((response) => {
        return response;
    });

    let userSubscription = true;
    let user_subscription = await UserSubscriptions.findOne({
        where: {
            store_id: store_id,
        },
    });
    if (user_subscription) {
        userSubscription = false;
    }

    res.render("backend/CustomizeCheckout/customize_checkout", {
        store_id: store_id,
        auth_user: auth_user,
        auth_store: auth_store,
        userSubscription: userSubscription,
        customize_checkout: customize_checkout,
        active_menu: "customize-checkout",
    });
};

module.exports.preview_checkout = async (req, res, next) => {
    const { auth_user, auth_store } = req;
    const { store_id } = req.params;

    await Stores.update(
        { customize_checkout_preview: true },
        {
            where: {
                id: store_id,
            },
        }
    );

    // Get Store Customize Checkout
    let customize_checkout = await CustomizeCheckout.findOne({
        where: {
            store_id: store_id,
            user_id: auth_user?.id,
        },
        include: [
            {
                model: CustomizeAboutSections,
            },
        ],
    });

    // Get Store ShippingRates Details
    let shipping_options = await ShippingRates.findAll({
        where: {
            store_id: store_id,
            user_id: auth_user?.id,
        },
    });

    // Get Store TaxRates Details
    let tax_options = await Taxes.findAll({
        where: {
            store_id: store_id
        },
    })

    // Get Store PaymentMethods Details
    let payment_methods = await PaymentMethods.findAll({
        where: {
            store_id: store_id,
            user_id: auth_user?.id,
        },
    });

    // Get Store Translations Details
    let language_translation = await Translations.findOne({
        where: {
            store_id: store_id,
            user_id: auth_user?.id,
        },
    });

    let customize_checkout_publish = true;
    if (!auth_store.user_subscription_id) {
        customize_checkout_publish = false;
    }
    if (auth_store.customize_checkout_publish) {
        customize_checkout_publish = false;
    }
    if (!payment_methods) {
        customize_checkout_publish = false;
    }
    if (!shipping_options) {
        customize_checkout_publish = false;
    }
    let countries = await Countries.findAll();

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

    res.render("backend/CustomizeCheckout/preview_checkout", {
        right_sides: [],
        store_id: store_id,
        auth_user: auth_user,
        auth_store: auth_store,

        countries: countries,
        card_accepted: card_accepted,
        shipping_options: shipping_options,
        tax_options:tax_options,
        payment_methods: payment_methods,
        language_translation: language_translation,
        customize_checkout: customize_checkout,
        customize_checkout_publish: customize_checkout_publish,
    });
};

module.exports.preview_thankyou = async (req, res, next) => {
    const { auth_user, auth_store } = req;
    const { store_id } = req.params;

    let preview_data = await CustomizeCheckout.findOne({
        where: {
            store_id: store_id,
        },
    }).then((response) => {
        return response;
    });
    let language_translation = await Translations.findOne({
        where: {
            store_id: store_id,
            user_id: auth_user?.id,
        },
    }).then((translation_resp) => {
        return translation_resp;
    });

    // Get Store ShippingRates Details
    let shipping_options = await ShippingRates.findAll({
        where: {
            store_id: store_id,
            user_id: auth_user?.id,
        },
    }).then((shipping_resp) => {
        return shipping_resp;
    });

    // Get Store Customize Checkout
    let customize_checkout = await CustomizeCheckout.findOne({
        where: {
            store_id: store_id,
            user_id: auth_user?.id,
        },
        include: [
            {
                model: CustomizeAboutSections,
            },
        ],
    }).then((response) => {
        return response;
    });

    res.render("backend/CustomizeCheckout/preview_thankyou", {
        right_sides: [],
        store_id: store_id,
        auth_user: auth_user,
        auth_store: auth_store,

        preview_data: preview_data,
        shipping_options: shipping_options,
        customize_checkout: customize_checkout,
        language_translation: language_translation,
    });
};

// Delete section
module.exports.delete_section = async (req, res, next) => {
    const { store_id } = req.params;
    if (req.method === "POST") {
        try {
            let request_body = req.body;

            let section = await CustomizeAboutSections.destroy({
                where: {
                    id: request_body.id,
                },
            });
            if (section) {
                return res.json({
                    status: true,
                    message: "Section Deleted Successfully",
                });
            } else {
                return res.json({
                    status: false,
                    message: "Unable to delete Section",
                });
            }
        } catch (error) {
            console.log("delete_section error----------", error);
            return res.json({
                status: false,
                message: "Something went wrong. Please try again.",
            });
        }
    }
};

// Checkout PUBLISH On Shopify store
module.exports.get_shopToken = async (req, res, next) => {
    const { store_id } = req.params;
    const { auth_user, auth_store } = req;

    try {
        // --------  validations Start -------- 
        if (!auth_store.user_subscription_id) {
            return res.json({
                status: false,
                message: "No Subscription found!, Please create a Subscription.",
            });
        }

        if (store_id && auth_user) {
            let payment_methods = await PaymentMethods.findOne({
                where: {
                    store_id: store_id,
                    user_id: auth_user.id,
                },
            });

            if (!payment_methods) {
                return res.json({
                    status: false,
                    message: "No Payment method found!, Please add a Payment Method.",
                });
            }

            let shipping_rate = await ShippingRates.findOne({
                where: {
                    store_id: store_id,
                    user_id: auth_user?.id,
                },
            });
            if (!shipping_rate) {
                return res.json({
                    status: false,
                    message: "No Shipping Rate found!, Please add a Shipping Rate.",
                });
            }
        }

        // --------  validations End -------- 
        let store_detail = await Stores.findOne({
            where: {
                id: store_id,
            },
        });

        let getScript = {
            json: true,
            method: "GET",
            uri: `https://${store_detail.store_name}.myshopify.com/admin/api/2022-01/themes.json`,
            headers: {
                "X-Shopify-Access-Token": store_detail.store_token,
                "Content-Type": "application/json",
            },
        };
        await request(getScript)
            .then(async function (response) {

                response.themes.forEach(async (element) => {
                    if (element.role.includes("main")) {

                        var theme_liquid = {
                            json: true,
                            cache: false,
                            method: "GET",
                            uri: `https://${store_detail.store_name}.myshopify.com/admin/api/2022-10/themes/${element.id}/assets.json?asset[key]=layout/theme.liquid`,
                            headers: { "X-Shopify-Access-Token": store_detail.store_token, "Content-Type": "application/json", },
                        };
                        await request(theme_liquid)
                            .then(async function (theme_response) {

                                let custom_script = `<script type="text/javascript" src="${process.env.APP_URL}/assets/js/shopify/checkout-integration.js" data-master-x-id="${store_id}"></script>`;
                                var checkScript = theme_response.asset.value.match(/data-master-x-id/g);

                                if (!checkScript) {
                                    var position = theme_response.asset.value.indexOf("</head>");
                                    var output = [theme_response.asset.value.slice(0, position), custom_script, theme_response.asset.value.slice(position)].join("\n");

                                    var putThemeLiquid = {
                                        json: true,
                                        method: "PUT",
                                        uri: `https://${store_detail.store_name}.myshopify.com/admin/api/2022-10/themes/${theme_response.asset.theme_id}/assets.json`,
                                        body: {
                                            asset: {
                                                key: "layout/theme.liquid",
                                                value: output,
                                            },
                                        },
                                        headers: {
                                            "X-Shopify-Access-Token": store_detail.store_token,
                                            "Content-Type": "application/json",
                                        },
                                        json: true,
                                    };
                                    await request(putThemeLiquid)
                                        .then(async (put_theme_response) => {
                                            store_detail.customize_checkout_publish = true;
                                            store_detail.save();

                                            return res.json({
                                                status: true,
                                                token: store_detail,
                                                message: "Successfully Published ",
                                            });
                                        })
                                        .catch(function (error) {
                                            console.log("putThemeLiquid error ------------", error);
                                        });
                                } else {
                                    store_detail.customize_checkout_publish = true;
                                    store_detail.save();

                                    return res.json({
                                        status: true,
                                        token: store_detail,
                                        message: "Already Publish",
                                    });
                                }
                            })
                            .catch(function (error) {
                                console.log("themeLiquid error ------------", error);
                            });
                    }
                });
            })
            .catch(function (error) {
                console.log("getScript error ------------", error);
            });
    } catch (error) {
        console.log("script_section error----------", error);
        return res.json({
            status: false,
            message: "Something went wrong. Please try again.",
        });
    }
};


const { CheckoutTemplatLists } = require("../../libs/CheckoutTemplateHelper");
module.exports.checkout_templates = async (req, res, next) => {
    const { store_id } = req.params;
    const { auth_user, auth_store } = req;

    let checkout_template_lists = await CheckoutTemplatLists();
    console.log("checkout_templates checkout_template_lists ---------", checkout_template_lists);

    return res.render("backend/CustomizeCheckout/checkout_templates", {
        store_id: store_id,
        auth_user: auth_user,
        auth_store: auth_store,
        active_menu: "checkout-templates",

        checkout_template_lists: checkout_template_lists,
    });
}