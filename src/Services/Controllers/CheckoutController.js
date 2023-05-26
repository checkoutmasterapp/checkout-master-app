"use strict";

const moment = require("moment");
const sequelize = require('sequelize');
const request = require("request-promise");

const Op = sequelize.Op;
const models = require("../models");
const {
    Stores,
    CustomizeAboutSections, CustomizeCheckout,
    ShippingRates, PaymentMethods, Translations, AutomaticDiscounts, Taxes
} = require("../models");


module.exports.get_checkout = async (req, res, next) => {
    const { checkout_id, store_id } = req.params;

    try {
        let checkout_detail = await models.Checkouts.findOne({
            where: {
                checkout_uuid: checkout_id,
                shop_id: store_id,
                is_purchase: false,
            },
        }).then((response) => {
            return response;
        });

        if (checkout_detail) {
            return res.json({
                status: true,
                message: "Checkout find successfully",
                checkout_detail: checkout_detail,
            });
        } else {
            return res.json({
                status: false,
                message: "Checkout not found",
            });
        }
    } catch (error) {
        console.error("get_checkout error----------", error);
        return res.json({
            status: false,
            message: "Something went wrong.Please check your details!",
        });
    }
};

module.exports.create_checkout = async (req, res, next) => {
    const { store_id } = req.params;
    let { cartToken } = req.body;
    console.log("***create_checkout******")
    cartToken = cartToken ? cartToken.replace(/"/g, "") : null;

    try {
        let checkout_data = await models.Checkouts.findOne({
            where: {
                cart_token: cartToken,
                customer_id: {
                    [Op.ne]: null
                },
            },
            order: [
                ['created_at', 'DESC'],
            ],
        });

        let checkout_detail = await models.Checkouts.findOne({
            order: [["id", "DESC"]],
            where: {
                shop_id: store_id,
                cart_token: cartToken,
            },
        });

        if (checkout_detail && !checkout_detail.is_purchase) {
            if (cartToken) {
                checkout_detail.customer_id = checkout_data?.customer_id,
                    checkout_detail.save();
            }
            return res.json({
                status: true,
                message: "Checkout create successfully",
                store_detail: checkout_detail,
            });
        }
        checkout_detail = await models.Checkouts.create({
            shop_id: store_id,
            cart_token: cartToken,
        })

        if (cartToken) {
            checkout_detail.customer_id = checkout_data?.customer_id,
                checkout_detail.save();
        }


        return res.json({
            status: true,
            message: "Checkout create successfully",
            store_detail: checkout_detail,
        });
    } catch (error) {
        console.error("create_checkout error----------", error);
        return res.json({
            status: false,
            message: "Something went wrong.Please check your details!",
        });
    }
};

module.exports.update_cart = async (req, res, next) => {
    const { store_id, checkout_id } = req.params;
    const { cart_token } = req.body;

    try {

        if (
            checkout_id
            && checkout_id !== null
            && checkout_id !== "null"
            && checkout_id !== "undefined"
            && checkout_id !== undefined
        ) {
            let checkout_detail = await models.Checkouts.findOne({
                order: [["id", "DESC"]],
                where: {
                    shop_id: store_id,
                    cart_token: cart_token,
                },
            });
            if (!checkout_detail || checkout_detail?.is_purchase === true) {
                return res.json({
                    status: false,
                    message: "Record not found",
                });
            } else {
                return res.json({
                    status: true,
                    message: "Record found",
                    checkout_detail: checkout_detail,
                });
            }
        } else {
            let checkout_detail = await models.Checkouts.findOne({
                order: [["id", "DESC"]],
                where: {
                    shop_id: store_id,
                    cart_token: cart_token,
                },
            });

            if (checkout_detail && !checkout_detail.is_purchase) {
                return res.json({
                    status: true,
                    data: checkout_detail,
                    message: "Checkout created",
                });
            }

            checkout_detail = await models.Checkouts.create({
                shop_id: store_id,
                cart_token: cart_token,
            });
            return res.json({
                status: true,
                data: checkout_detail,
                message: "Checkout created",
            });
        }
    } catch (error) {
        console.error("update_cart error----------", error);
        return res.json({
            status: false,
            message: error?.message ? error.message : "Something went wrong. Please try again.",
        });
    }
};

module.exports.update_checkout = async (req, res, next) => {
    let request_body = req.body;
    const { checkout_id, store_id, line_items } = req.params;

    try {
        let line_items = request_body?.line_items;
        console.log("***update_checkout******")

        let checkout_detail = await models.Checkouts.findOne({
            where: {
                checkout_uuid: checkout_id,
                shop_id: store_id,
            },
        }).then((response) => {
            return response;
        });

        if (checkout_detail) {
            let cart_detail = await models.Cart.findAll({
                where: {
                    checkout_id: checkout_detail.id,
                },
            }).then((response) => {
                return response;
            });

            console.log("cart_detail", cart_detail.length)

            if (cart_detail && line_items.length) {

                cart_detail.forEach(async (element) => {
                    await models.Cart.destroy({
                        where: {
                            checkout_id: element.checkout_id,
                        },
                    })
                });

                let price = 0;
                let cart_items = [];
                for (let line_item of line_items) {
                    price += parseFloat(line_item.price);
                    cart_items.push({
                        store_id: store_id,
                        cart_token: line_item.cart_token,
                        checkout_id: checkout_detail?.id,
                        product_id: line_item.product_id,
                        variant_id: line_item.variant_id,
                        price: parseFloat(line_item.price).toFixed(2),
                        quantity: line_item.quantity,
                        image: line_item.image,
                        title: line_item.title,
                        product_weight: line_item.grams,
                    });
                }

                checkout_detail.price = price.toFixed(2);
                checkout_detail.cart_token = line_items[0].cart_token;
                checkout_detail.save();

                await models.Cart.bulkCreate(cart_items);
            }
            return res.json({
                status: true,
                message: "Checkout update successfully",
            });
        } else {
            return res.json({
                status: false,
                message: "Checkout not found",
            });
        }
    } catch (error) {
        console.error("update_checkout error----------", error);
        return res.json({
            status: false,
            message: "Something went wrong.Please check your details!",
        });
    }
};

function convert_key_array(array_objects, object_key) {
    let array_keys = [];
    let convert_key_array = {};

    for (let key in array_objects) {
        let array_object = array_objects[key];
        if (Array.isArray(array_object)) {
            let new_key = array_object[object_key];
            if (typeof convert_key_array[array_object[object_key]] === "undefined") {
                array_keys.push(new_key);
                convert_key_array[new_key] = [];
            }
            convert_key_array[new_key].push(array_object);
        } else {
            array_keys.push(array_object[object_key]);
            convert_key_array[array_object[object_key]] = array_object;
        }
    }
    return { array_keys, convert_key_array };
}

module.exports.abandoned_checkout = async (req, res, next) => {
    try {
        const { store_id, checkout_id, email, first_name, last_name } = req.body
        let checkout_detail = await models.Checkouts.findOne({
            where: {
                checkout_uuid: checkout_id,
                shop_id: store_id,
            },
        })
        if (!checkout_detail) {
            return res.json({
                status: false,
                message: "Checkout deleted",
            });
        }

        console.log("***abandoned_checkout******", req.body)


        let abandoned_checkout_detail = await models.AbandonedCheckouts.findOne({
            where: {
                checkout_id: checkout_detail?.id,
                shop_id: store_id,
            },
        })

        if (abandoned_checkout_detail) {
            await models.AbandonedCheckouts.update({
                cart_token: checkout_detail?.cart_token,
                checkout_id: checkout_detail?.id,
                email,
                first_name,
                last_name,
            }, {
                where: { id: abandoned_checkout_detail?.id },
            });

            return res.json({
                status: true,
                message: "Abandoned Checkout update successfully",
                abandoned_checkout_detail: abandoned_checkout_detail,
            });

        }

        abandoned_checkout_detail = await models.AbandonedCheckouts.create({
            shop_id: store_id,
            cart_token: checkout_detail?.cart_token,
            checkout_id: checkout_detail?.id,
            email,
            first_name,
            last_name,
        })

        return res.json({
            status: true,
            message: "Abandoned Checkout create successfully",
            abandoned_checkout_detail: abandoned_checkout_detail,
        });
    } catch (error) {
        console.error("abandoned_checkout error----------", error);
        return res.json({
            status: false,
            message: "Something went wrong.Please check your details!",
        });
    }
};

module.exports.shopify_checkout = async (req, res, next) => {
    const { store_id, checkout_id } = req.params;
    const { discount } = req.query;
    console.log("shopify_checkout discount----------", discount);
    console.log("shopify_checkout store_id----------", store_id);
    console.log("shopify_checkout checkout_id----------", checkout_id);

    try {
        if (!checkout_id || checkout_id === 'null' || !store_id) {
            return res.json(404);
        }

        // Get Store Custom domain
        let store_domain_url = "";
        if (process.env.Site_Environmental === "production") {
            store_domain_url = "https://pay.checkout-master.com";
        } else {
            store_domain_url = process.env.APP_URL;
        }

        let custom_domain = await models.CustomDomain.findOne({
            where: {
                store_id: store_id,
                verification_status: "success"
            },
        });
        if (custom_domain) {
            store_domain_url = `https://${custom_domain?.custom_domain}`
        }

        // Get Countries From Database
        let countries = await models.Countries.findAll({
            order: [["country_name", "ASC"]],
        });


        // Get Store Detail
        let store_detail = await models.Stores.findOne({
            where: {
                id: store_id
            },
            attributes: ["id", "user_id", "store_name", "store_domain", "store_token", "store_currency"],
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
        let convert_response = convert_key_array(payment_methods, "method_name");
        let payment_methods_key = convert_response?.convert_key_array;

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
                            card_html += `<small>${language_translation && language_translation.and_more || '& more'}</small>`;
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
                            card_html += `<small>${language_translation && language_translation.and_more || '& more'}</small>`;
                            break;
                        }
                        card_html += `<img src="/assets/img/card-icons/${card_accepted}.svg">`;
                    };
                }

                if (payment_method?.method_name === "Payout Master") {
                    card_html = `
                        <img src="/assets/img/card-icons/visa.svg">
                        <img src="/assets/img/card-icons/mastercard.svg">
                        <img src="/assets/img/card-icons/amex.svg">
                        <small>${language_translation && language_translation.and_more || '& more'}</small>
                    `;
                }

                if (payment_method?.method_name === "Revolut") {
                    card_html = `
                        <img src="/assets/img/card-icons/visa.svg">
                        <img src="/assets/img/card-icons/mastercard.svg">
                        <img src="/assets/img/card-icons/amex.svg">
                        <small>${language_translation && language_translation.and_more || '& more'}</small>
                    `;
                }

                payment_method["card_html"] = card_html;
            });
        }

        // Get Checkout and cart details
        let checkout_detail = await models.Checkouts.findOne({
            where: {
                checkout_uuid: checkout_id,
                shop_id: store_id,
            },
            include: [
                {
                    model: models.Cart,
                },
            ],
        });

        if (!checkout_detail) {
            return res.send(404);
        }

        if (checkout_detail && checkout_detail?.is_purchase) {
            let redirect_link = `https://${store_detail?.store_name}.myshopify.com`
            return res.render("shopify/cart_recovery_empty", {
                redirect_link: redirect_link
            })
        }

        if (checkout_detail && !checkout_detail.reached_checkout) {
            checkout_detail.reached_checkout = 1
            checkout_detail.save()
        }

        let total_price = 0;
        let total_weight = 0;
        let cart_item_count = 0;

        let product_id = [];
        let product_details = [];
        if (checkout_detail) {
            for (let cart_detail of checkout_detail?.carts) {

                product_id.push(cart_detail.product_id);
                cart_item_count += cart_detail.quantity;
                var shopify_product = {
                    json: true,
                    method: "GET",
                    uri: `https://${store_detail.store_name}.myshopify.com/admin/products/${cart_detail?.product_id}.json`,
                    headers: {
                        "Content-Type": "application/json",
                        "X-Shopify-Access-Token": `${store_detail.store_token}`,
                    },
                };
                await request(shopify_product, function (error, response) {
                    if (error) throw new Error(error);
                    shopify_product = response?.body?.product;
                });

                if (!cart_detail.image) {
                    cart_detail.image = shopify_product?.image?.src
                    cart_detail.save();
                }

                let product_varient = shopify_product.variants
                product_varient = product_varient.filter(varient => varient.id == cart_detail.variant_id)
                let product_option = shopify_product.options

                if (product_varient[0].title !== 'Default Title') {
                    let varient = {
                        title: product_varient[0].title
                    }
                    if (product_option[0]) {
                        varient[`${product_option[0].name}`] = product_varient[0].option1
                    }
                    if (product_option[1]) {
                        varient[`${product_option[1].name}`] = product_varient[0].option2
                    }
                    if (product_option[2]) {
                        varient[`${product_option[2].name}`] = product_varient[0].option3
                    }
                    product_varient = varient
                }
                let product_total = parseFloat(cart_detail.quantity * cart_detail.price)

                product_details.push({
                    product_id: cart_detail.product_id,
                    variant_id: cart_detail.variant_id,
                    product_title: cart_detail.title,
                    product_image: cart_detail.image,
                    variant_title: cart_detail?.variant_title,
                    quantity: cart_detail.quantity,
                    price: cart_detail.price,
                    format_price: await shopify_money_format(product_total, customize_checkout?.money_format),
                    product_varient
                });

                total_price += parseFloat(cart_detail.quantity * cart_detail.price);
                total_weight += parseFloat(cart_detail.quantity * cart_detail.product_weight);
            }
        }

        let subtotal_price = total_price;

        customize_checkout = customize_checkout?.dataValues;
        let custom_script = customize_checkout?.custom_script;
        delete customize_checkout.custom_script;

        let thankyou_description = customize_checkout?.thankyou_description;
        delete customize_checkout.thankyou_description;

        // Get Store TaxRates Details
        let tax_options = await Taxes.findAll({
            where: {
                store_id: store_id
            },
        })

        let abandoned_checkout = await models.AbandonedCheckouts.findOne({
            where: {
                checkout_id: checkout_detail?.id,
                shop_id: store_id,
            },
        })

        //////////////////////////////////// Check Upsell Functionality
        ///// Get UpsellTrigger Data
        const upsell_triggers = await models.UpsellTrigger.findAll({
            where: { trigger_id: product_id },
        });

        var upsell_ids = [];
        if (upsell_triggers) {
            for (let upsell_trigger of upsell_triggers) {
                upsell_ids.push(upsell_trigger.upsell_id);
            }
        }

        ///// Get Upsell Data
        upsell_ids = upsell_ids.filter((upsell_id, index) => upsell_ids.indexOf(upsell_id) === index);
        const upsell_detail = await models.Upsell.findOne({
            where: {
                id: upsell_ids,
                store_id: store_id,
                status: true,
            },
            order: [
                ['created_at', 'DESC']
            ],
        });

        if (req.session.cart_performance_uuid) {
            req.session.save();
        }


        let money_format = await shopify_money_format("9.99", customize_checkout?.money_format)
        console.log("shopify_checkout money_format---------", money_format);

        res.render("shopify/shopify_checkout", {
            store_id: store_id,
            checkout_id: checkout_id,
            version: customize_checkout?.template_code,
            body_class: `checkout-template-${customize_checkout?.template_code}`,

            store_domain_url: store_domain_url,

            countries: countries,
            store_detail: store_detail,

            web_discount: discount,
            total_price: total_price,
            total_weight: total_weight,
            subtotal_price: subtotal_price,
            cart_item_count: cart_item_count,
            abandoned_checkout: abandoned_checkout,

            card_accepted: card_accepted,
            payment_methods_key: payment_methods_key,

            product_details: product_details,

            customize_checkout: customize_checkout,
            custom_script: custom_script,
            thankyou_description: thankyou_description,

            shipping_options: shipping_options,
            payment_methods: payment_methods,
            language_translation: language_translation,

            checkout_detail: checkout_detail,

            tax_options: tax_options,

            upsell_detail: upsell_detail,
            upsell_triggers: upsell_triggers,
        });
    } catch (error) {
        console.error("shopify_checkout error----------", error);
        res.render("404");
    }
}

async function product_varient_detail(store_detail, cart_detail) {
    try {
        var shopify_product = {
            json: true,
            method: "GET",
            uri: `https://${store_detail.store_name}.myshopify.com/admin/products/${cart_detail?.product_id}.json`,
            headers: {
                "Content-Type": "application/json",
                "X-Shopify-Access-Token": `${store_detail.store_token}`,
            },
        };
        await request(shopify_product, function (error, response) {
            if (error) throw new Error(error);
            shopify_product = response?.body?.product;
        });

        let product_varient = shopify_product.variants
        product_varient = product_varient.filter(varient => varient.id == cart_detail.variant_id)

        let product_option = shopify_product.options

        if (product_varient[0].title !== 'Default Title') {
            let varient = {
                title: product_varient[0].title
            }
            if (product_option[0]) {
                varient[`${product_option[0].name}`] = product_varient[0].option1
            }
            if (product_option[1]) {
                varient[`${product_option[1].name}`] = product_varient[0].option2
            }
            if (product_option[2]) {
                varient[`${product_option[2].name}`] = product_varient[0].option3
            }
            product_varient = varient
        }
        return product_varient
    } catch (error) {
        console.error("product varient", error)
        return ''
    }
}

module.exports.shopify_thankyou = async (req, res, next) => {
    const { store_id, order_id } = req.params;

    try {

        ////////////////////////////// Get Store Detail
        let store_detail = await Stores.findOne({
            where: { id: store_id }
        });

        ////////////////////////////// Get Store Customize Checkout Detail
        let customize_checkout = await CustomizeCheckout.findOne({
            where: { store_id: store_id },
        });

        ////////////////////////////// Get Store Translations Detail
        let language_translation = await Translations.findOne({
            where: {
                store_id: store_id,
            },
        });

        ////////////////////////////// Get Order Detail
        let order_detail = await models.Orders.findOne({
            where: {
                order_uuid: order_id,
                shop_id: store_id,
                is_purchase: true,
            },
            include: [
                {
                    as: "checkout",
                    model: models.Checkouts,
                    include: [
                        {
                            model: models.Cart,
                        },
                        {
                            as: "shipping_rate",
                            model: models.ShippingRates,
                            attributes: ["id", "shipping_rate_name"],
                        },
                    ],
                },
            ],
        });

        let tax_options = {}

        // Get Store TaxRates Details
        if (order_detail?.checkout?.tax_rate_id) {
            tax_options = await Taxes.findOne({
                where: {
                    id: order_detail?.checkout?.tax_rate_id
                },
            })
        }

        let product_details = [];
        if (order_detail?.checkout?.carts) {
            for (let cart_detail of order_detail?.checkout?.carts) {
                let product_total = parseFloat(cart_detail.quantity * cart_detail.price)
                product_details.push({
                    title: cart_detail.title,
                    image: cart_detail.image,
                    quantity: cart_detail.quantity,
                    price: cart_detail.price,
                    product_varient: await product_varient_detail(store_detail, cart_detail),
                    price_html: await shopify_money_format(product_total, customize_checkout?.money_format),
                });
            }
        }

        customize_checkout = customize_checkout?.dataValues;
        let custom_script = customize_checkout?.custom_script;
        delete customize_checkout.custom_script;

        let thankyou_description = customize_checkout?.thankyou_description;
        delete customize_checkout.thankyou_description;

        let payment_method = order_detail?.payment_method?.toUpperCase();

        ////////////////////////////// Getting Upsell Order Details
        let upsell_order_detail = await models.Orders.findOne({
            where: {
                shop_id: store_id,
                is_purchase: true,
                parent_order_id: order_detail?.id,
            },
            include: [
                {
                    as: "checkout",
                    model: models.Checkouts,
                    include: [
                        {
                            model: models.Cart,
                        },
                    ],
                },
            ],
        });

        let upsell_orders = [];
        var upsell_total_price = 0;
        if (upsell_order_detail?.checkout?.carts) {
            for (let upsell_cart_detail of upsell_order_detail?.checkout?.carts) {

                let total_price = parseFloat(upsell_cart_detail.price) * parseFloat(upsell_cart_detail.quantity);
                upsell_total_price += total_price;

                upsell_orders.push({
                    title: upsell_cart_detail.title,
                    variant_title: upsell_cart_detail?.variant_title !== "Default Title" ? upsell_cart_detail.variant_title : "",
                    image: upsell_cart_detail.image,
                    quantity: upsell_cart_detail.quantity,
                    product_varient: await product_varient_detail(store_detail, upsell_cart_detail),

                    price: upsell_cart_detail.price,
                    total_price: total_price,
                    total_price_html: await shopify_money_format(total_price, customize_checkout?.money_format),
                });
            }
        }

        console.log("shopify_thankyou customize_checkout-------", customize_checkout);

        let grand_total = parseFloat(parseFloat(order_detail?.checkout?.price) + upsell_total_price);
        
        res.render("shopify/thankyou", {
            store_detail: store_detail,
            version: customize_checkout?.template_code,
            body_class: `checkout-thankyou-${customize_checkout?.template_code}`,

            custom_script: custom_script,
            customize_checkout: customize_checkout,
            thankyou_description: thankyou_description,

            language_translation: language_translation,

            order_detail: order_detail,
            product_details: product_details,
            payment_method: payment_method,

            price: await shopify_money_format(order_detail?.checkout?.price, customize_checkout?.money_format),
            subtotal: await shopify_money_format(order_detail?.checkout?.subtotal, customize_checkout?.money_format),

            shipping_rate_name: order_detail?.checkout?.shipping_rate?.shipping_rate_name ? order_detail?.checkout?.shipping_rate?.shipping_rate_name : "Free Shipping",
            shipping_rate_amount: await shopify_money_format(order_detail?.checkout?.shipping_rate_amount, customize_checkout?.money_format),

            tax_rate_name: tax_options?.tax_rate_name,
            tax_rate_amount: await shopify_money_format(order_detail?.checkout?.tax_rate_amount, customize_checkout?.money_format),

            discount_title: order_detail?.checkout?.discount_title,
            discount_amount: await shopify_money_format(order_detail?.checkout?.discount_amount, customize_checkout?.money_format),

            upsell_orders: upsell_orders,
            grand_total: await shopify_money_format(grand_total, customize_checkout?.money_format)
        });

    } catch (error) {
        console.error("shopify_thankyou error----------", error);
        res.render("404");
    }
};

module.exports.getStatesByCountryCode = async (req, res, next) => {
    try {
        const { country_code } = req.body;

        let findStates = await models.States.findAll({
            where: {
                country_code: country_code,
            },
            order: [["state_name", "ASC"]],
        });

        if (findStates) {
            return res.json({
                status: true,
                states: findStates,
            });
        } else {
            return res.json({
                status: false,
            });
        }
    } catch (error) {
        return res.json({
            status: false,
            message: error?.message ? error.message : "Something went wrong. Please try again.",
        });
    }
};

module.exports.get_checkout_domain_url = async (req, res, next) => {
    const { store_id } = req.params;
    try {
        let checkout_url;

        if (process.env.Site_Environmental === "production") {
            checkout_url = "https://pay.checkout-master.com";
        } else {
            checkout_url = process.env.APP_URL;
        }

        let custom_domain = await models.CustomDomain.findOne({
            where: {
                store_id: store_id,
                verification_status: "success"
            },
        });
        if (custom_domain) {
            checkout_url = `https://${custom_domain?.custom_domain}`
        }

        return res.json({
            status: true,
            checkout_url: checkout_url,
        });
    } catch (error) {
        console.error("get_checkout_domain_url error----------", error);
        return res.json({
            status: false,
            message: error?.message ? error.message : "Something went wrong. Please try again.",
        });
    }
};

module.exports.get_store_subscription = async (req, res, next) => {
    const { store_id } = req.params;
    try {

        const store_detail = await models.Stores.findOne({
            where: {
                id: store_id
            },
        });

        let current_user_subscription = await models.UserSubscriptions.findOne({
            where: {
                status: true,
                user_id: store_detail?.user_id,
            },
            attributes: ["start_date", "end_date", "status", "is_expired"],
        });

        return res.json({
            status: true,
            current_user_subscription: current_user_subscription
        });
    } catch (error) {
        console.error("get_store_subscription error----------", error);
        return res.json({
            status: false,
            message: error?.message ? error.message : "Something went wrong. Please try again.",
        });
    }
};

module.exports.shopify_upsell = async (req, res, next) => {
    try {
        const { store_id, checkout_id, order_id, upsell_id } = req.params;

        const store_detail = await models.Stores.findOne({
            where: {
                id: store_id
            },
        });

        // Get Store Custom domain
        let store_domain_url = "";
        if (process.env.Site_Environmental === "production") {
            store_domain_url = "https://pay.checkout-master.com";
        } else {
            store_domain_url = process.env.APP_URL;
        }

        let custom_domain = await models.CustomDomain.findOne({
            where: {
                store_id: store_id,
                verification_status: "success"
            },
        });
        if (custom_domain) {
            store_domain_url = `https://${custom_domain?.custom_domain}`
        }

        let order_detail = await models.Orders.findOne({
            where: {
                order_uuid: order_id,
                shop_id: store_detail.id,
            }
        });

        // Get Store Customize Checkout
        let customize_checkout = await CustomizeCheckout.findOne({
            attributes: ["money_format", "store_logo", "favicon", "security_badge"],
            where: { store_id: store_id },
        })

        const upsell_detail = await models.Upsell.findOne({
            where: {
                store_id: store_id,
                upsell_uuid: upsell_id
            },
        });

        let upsell_trigger_offers = await models.UpsellTriggerOffer.findAll({
            where: {
                store_id: store_id,
                upsell_id: upsell_detail?.id
            },
        });

        // Create Upsell Performance If Not Exits.
        let upsell_performance = await models.UpsellPerformance.findOne({
            where: {
                customer_id: order_detail?.customer_id,
                store_id: upsell_detail.store_id,
                upsell_id: upsell_detail.id,
                parent_order_id: order_detail?.id
            }
        });
        if (!upsell_performance) {
            await models.UpsellPerformance.create({
                customer_id: order_detail?.customer_id,
                store_id: upsell_detail.store_id,
                upsell_id: upsell_detail.id,
                parent_order_id: order_detail?.id
            })
        }

        let upsell_trigger_lists = [];
        for (let upsell_trigger_offer of upsell_trigger_offers) {
            upsell_trigger_offer = upsell_trigger_offer?.dataValues;

            let product_option = {
                json: true,
                'method': 'GET',
                'url': `https://${store_detail.store_name}.myshopify.com/admin/api/2022-10/products/${upsell_trigger_offer?.product_id}.json`,
                'headers': {
                    'X-Shopify-Access-Token': store_detail.store_token
                }
            };
            let product_detail;
            await request(product_option, function (error, response) {
                product_detail = response?.body?.product;
            });

            upsell_trigger_offer.product_title = product_detail?.title;
            upsell_trigger_offer.product_image = product_detail?.image?.src;
            upsell_trigger_offer.product_description = product_detail?.body_html;

            upsell_trigger_offer.product_variant = product_detail?.variants[0];
            upsell_trigger_offer.product_variants = product_detail?.variants;

            upsell_trigger_offer.purchase_quantity = 1;

            upsell_trigger_offer.product_price_html = await shopify_money_format(upsell_trigger_offer?.product_price, customize_checkout?.money_format);
            upsell_trigger_offer.compare_at_price_html = await shopify_money_format(upsell_trigger_offer?.compare_at_price, customize_checkout?.money_format);

            upsell_trigger_lists.push(upsell_trigger_offer)
        };

        res.render("shopify/upsells", {
            store_id: store_id,
            order_id: order_id,
            checkout_id: checkout_id,

            custom_domain: custom_domain,

            store_detail: store_detail,
            customize_checkout: customize_checkout,

            upsell_detail: upsell_detail,
            upsell_trigger_offers: upsell_trigger_lists,
        });
    } catch (error) {
        console.error("shopify_upsell error----------", error.message);
        res.render("404");
    }
};

const { StripeUpsellChargesCreate } = require("../../libs/StripePaymentHelper");
const { CheckoutUpsellPaymentCreate } = require("../../libs/CheckoutPaymentHelper");
const { RevolutUpsellChargesCreate, RevolutUpsellPaymentSuccess } = require("../../libs/RevolutPaymentHelper");
module.exports.shopify_purchase_upsell = async (req, res, next) => {
    let request_body = req.body;

    try {

        let order_detail;
        if (request_body?.store_id && request_body?.order_id) {
            order_detail = await models.Orders.findOne({
                where: {
                    shop_id: request_body?.store_id,
                    order_uuid: request_body?.order_id
                },
            });
        }

        if (order_detail?.payment_method === "Stripe") {
            await StripeUpsellChargesCreate(request_body, order_detail, function (error, response) {
                if (error) {
                    return res.json(error);
                } else {
                    return res.json(response);
                }
            });
        }

        if (order_detail?.payment_method === "Revolut") {
            await RevolutUpsellChargesCreate(request_body, order_detail, function (error, response) {
                if (error) {
                    return res.json(error);
                } else {
                    return res.json(response);
                }
            });
        }

        if (request_body?.action === "revolut_success") {
            await RevolutUpsellPaymentSuccess(request_body, function (error, response) {
                if (error) {
                    return res.json(error);
                } else {
                    return res.json(response);
                }
            });
        }

        if (order_detail?.payment_method === "Checkout.com" && !request_body?.action) {
            let payment_method = await models.PaymentMethods.findOne({
                where: {
                    method_name: "Checkout.com",
                    store_id: request_body.store_id,
                },
            });

            return res.json({
                status: true,
                publishable_key: payment_method?.publishable_key,
                action: "checkout_payment_confirmation"
            });
        }

        if (request_body?.action === "checkout_success") {
            await CheckoutUpsellPaymentCreate(request_body, order_detail, function (error, response) {
                if (error) {
                    return res.json(error);
                } else {
                    return res.json(response);
                }
            });
        }
    } catch (error) {
        console.error("shopify_purchase_upsell error----------", error);
        return res.json({
            status: false,
            message: error?.message ? error.message : "Something went wrong. Please try again.",
        });
    }
};

module.exports.shopify_buylink_checkout = async (req, res, next) => {
    const { discount } = req.query;
    const { store_id, buylink_products } = req.params;

    try {
        // Get Store Detail
        let store_detail = await Stores.findOne({
            where: {
                id: store_id,
            },
        })

        let product_details = [];
        let product_ids = [];
        // get product and variation ID from URL
        let products_data = buylink_products.split("~");
        if (products_data && products_data?.length > 0) {
            products_data.forEach(function (item, i) {
                let item_details = item.split("_");
                if (item_details && item_details?.length > 0) {
                    let row = {
                        id: item_details[0],
                        variation_id: item_details[1],
                        quantity: parseInt(item_details[2]),
                    }
                    product_details.push(row);
                    product_ids.push(item_details[0]);
                }
            })
        }

        // fetch selected products details
        let product_option = {
            json: true,
            method: "GET",
            url: `https://${store_detail.store_name}.myshopify.com/admin/api/2022-10/products.json?ids=${product_ids}`,
            headers: {
                "Content-Type": "application/json",
                "X-Shopify-Access-Token": store_detail.store_token,
            },
        };
        let fetch_products_details;
        await request(product_option, function (error, response) {
            fetch_products_details = response?.body?.products;
        });


        // create checkout
        let checkout_detail = await models.Checkouts.create({
            shop_id: store_id
        });

        let cart_items = [];
        let total_price = 0;
        let total_weight = 0;
        // add required details about the products
        product_details.forEach(function (product, i) {
            let single_product_details = fetch_products_details.find(function (item) {
                return item.id == product.id
            })

            let variant_details = single_product_details.variants.find(function (variant) {
                return variant.id == product.variation_id
            });

            product.title = single_product_details?.title;
            product.image = single_product_details?.image?.src;

            if (variant_details.grams) {
                product.grams = parseFloat(variant_details.grams);
            }

            if (variant_details.weight) {
                total_weight += parseFloat(variant_details.weight);
            }

            if (variant_details.price) {
                product.price = parseFloat(variant_details.price).toFixed(2);
                total_price += parseInt(product.quantity) * parseFloat(variant_details.price);
            }

            product_details[i] = product;

            // add to cart items
            cart_items.push({
                store_id: store_id,
                checkout_id: checkout_detail?.id,
                product_id: product?.id,
                variant_id: variant_details?.id,

                title: product?.title,
                variant_title: (variant_details?.title !== "Default Title") ? variant_details?.title : "",

                image: product?.image,

                price: product?.price,
                quantity: product?.quantity,
                product_weight: product?.grams,
            });
        });

        checkout_detail.price = total_price.toFixed(2);
        checkout_detail.save();
        await models.Cart.bulkCreate(cart_items);


        let checkout_link = `${process.env.APP_URL}/${store_id}/checkout/${checkout_detail?.checkout_uuid}`;
        checkout_link = (discount) ? `${checkout_link}/?discount=${discount}` : checkout_link;
        return res.redirect(checkout_link);
    } catch (error) {
        console.error("shopify_buylink_checkout error----------", error);
        res.render("404");
    }
}

const { ShopifyGetCollectionProducts, ShopifyGetDiscountPriceRule } = require("../../libs/ShopifyHelper");
module.exports.check_discount_code = async (req, res, next) => {
    const { store_id, checkout_id, discount_code } = req.body;

    try {
        const store_detail = await models.Stores.findOne({
            where: {
                id: store_id
            },
        });

        await ShopifyGetDiscountPriceRule(store_detail, discount_code, function (error, response) {
            if (error) {
                return res.json(error);
            } else {
                return res.json(response);
            }
        });
    } catch (error) {
        console.error("check_discount_code error----------", error.message);
        return res.json({
            status: false,
            message: error?.message ? error.message : "Something went wrong. Please try again.",
        });
    }
}

module.exports.check_automatic_discount = async (req, res, next) => {
    let default_timezone = moment.tz.guess();
    moment.tz.setDefault(default_timezone);
    console.log("check_automatic_discount default_timezone-------", default_timezone);

    let {
        store_id, checkout_id,
        totalPrice, money_format, subtotal_price, cart_item_count,
        product_details,
        shipping_rate_id, shipping_rate_name, shipping_rate_amount,
        selected_Country_Code,
        ecommerce_discount
    } = req.body;

    try {

        totalPrice = parseFloat(totalPrice);
        subtotal_price = parseFloat(subtotal_price);
        shipping_rate_amount = shipping_rate_amount ? parseFloat(shipping_rate_amount) : 0;

        product_details = JSON.parse(product_details);
        ecommerce_discount = ecommerce_discount ? JSON.parse(ecommerce_discount) : "";

        const store_detail = await models.Stores.findOne({
            where: {
                id: store_id
            },
        });

        let language_translation = await models.Translations.findOne({
            where: {
                store_id: store_id,
            },
        });

        // Get Store TaxRates Details
        let tax_options = await Taxes.findAll({
            where: {
                store_id: store_id
            },
        })
        let tax_id = "";
        let tax_rate_name = '';
        let tax_rate = 0;
        let tax_rate_percentage = ""
        let tax_preference_shipping_rate_charge = false;
        let tax_preference_not_included = false

        if (tax_options && tax_options.length > 0) {
            let selectedtax = tax_options.filter(taxes => taxes.country_codes.includes(selected_Country_Code))
            if (selectedtax && selectedtax.length) {
                let taxes = selectedtax[0]
                tax_id = taxes.id || "";
                tax_rate_name = taxes.tax_rate_name || 'Taxes';
                tax_rate = 0;
                tax_rate_percentage = taxes.tax_rate_percentage
                tax_preference_shipping_rate_charge = taxes.tax_preference_shipping_rate_charge
                tax_preference_not_included = taxes.tax_preference_not_included
            }
        }

        let discount_html = "";
        let discount_amount = 0;
        let shopify_discount_amount = 0;

        let apply_discount = {};
        let check_discount_condition = true;

        //////////////////////////////////// Checking Shopigy Discount        
        let ecommerce_discount_apply = false;
        if (ecommerce_discount?.value_type) {
            discount_amount = ecommerce_discount?.value.split('-')[1];
            discount_amount = parseFloat(discount_amount);

            // Check Active dates and End date
            if (ecommerce_discount?.ends_at) {
                let ends_at = moment(ecommerce_discount?.ends_at);
                check_discount_condition = moment().diff(ends_at, "hours") < 0;
            }

            // Checking Minimum purchase amount
            if (ecommerce_discount?.prerequisite_subtotal_range && check_discount_condition == true) {
                let prerequisite_subtotal_range = ecommerce_discount?.prerequisite_subtotal_range;
                let greater_than_or_equal_to = parseFloat(prerequisite_subtotal_range?.greater_than_or_equal_to);
                check_discount_condition = greater_than_or_equal_to <= subtotal_price;
            }

            // Checking Minimum quantity of items
            if (ecommerce_discount?.prerequisite_quantity_range && check_discount_condition == true) {
                let prerequisite_quantity_range = ecommerce_discount?.prerequisite_quantity_range;
                let greater_than_or_equal_to = parseFloat(prerequisite_quantity_range?.greater_than_or_equal_to);
                check_discount_condition = greater_than_or_equal_to <= cart_item_count;
            }

            // Exclude shipping rates over a certain amount
            if (ecommerce_discount?.prerequisite_shipping_price_range && check_discount_condition == true) {
                let prerequisite_shipping_price_range = ecommerce_discount?.prerequisite_shipping_price_range;
                let less_than_or_equal_to = parseFloat(prerequisite_shipping_price_range?.less_than_or_equal_to);
                check_discount_condition = subtotal_price <= less_than_or_equal_to;
            }

            /******** Discount Type - Buy X get Y ********/
            if (
                ecommerce_discount?.target_type == "line_item"
                && ecommerce_discount?.target_selection == "entitled"
                && ecommerce_discount?.allocation_method == "each"
            ) {

                let specific_produdcts = [];
                let buy_product_include = false;
                check_discount_condition = false;

                // Check Buy Specific Products Exist or Not
                if (ecommerce_discount?.prerequisite_product_ids) {
                    let customer_buy_product_items = ecommerce_discount?.prerequisite_product_ids;
                    product_details.filter((product_detail) => {
                        if (customer_buy_product_items.includes(parseInt(product_detail?.product_id)) === true) {
                            buy_product_include = true;
                            return false;
                        }
                    });
                }

                // Check Buy Specific Product Varients Exist or Not
                if (ecommerce_discount?.prerequisite_variant_ids.length > 0 && buy_product_include === false) {
                    let customer_buy_product_varient_items = ecommerce_discount?.prerequisite_variant_ids;
                    product_details.filter((product_detail) => {
                        if (customer_buy_product_varient_items.includes(parseInt(product_detail?.variant_id)) === true) {
                            buy_product_include = true;
                            return false;
                        }
                    });
                }

                // Check Buy Specific Collection Exist or Not
                if (ecommerce_discount?.prerequisite_collection_ids && buy_product_include === false) {
                    let buy_collection_product_ids = [];
                    let customer_buy_collection_items = ecommerce_discount?.prerequisite_collection_ids;
                    for (let collection_id of customer_buy_collection_items) {
                        let buy_collection_products = await ShopifyGetCollectionProducts(store_detail, collection_id);
                        buy_collection_products.filter((collection_product) => {
                            buy_collection_product_ids.push(collection_product?.id);
                        });
                    }
                    product_details.forEach(product_detail => {
                        if (buy_collection_product_ids.includes(parseInt(product_detail?.product_id)) === true) {
                            buy_product_include = true;
                            return false;
                        }
                    });
                }

                if (buy_product_include === true) {
                    // Check Get Specific Products Exist or Not
                    if (ecommerce_discount?.entitled_product_ids) {
                        let customer_get_product_varient_items = ecommerce_discount?.entitled_product_ids;
                        product_details.filter((product_detail) => {
                            if (customer_get_product_varient_items.includes(parseInt(product_detail?.product_id)) === true) {
                                check_discount_condition = true;
                                specific_produdcts.push(product_detail);
                            }
                        });
                    }

                    if (ecommerce_discount?.entitled_variant_ids.length > 0) {
                        let customer_get_product_items = ecommerce_discount?.entitled_variant_ids;
                        product_details.filter((product_detail) => {
                            if (customer_get_product_items.includes(parseInt(product_detail?.variant_id)) === true) {
                                check_discount_condition = true;
                                specific_produdcts.push(product_detail);
                            }
                        });
                    }

                    // Check Get Specific Collection Exist or Not
                    if (ecommerce_discount?.entitled_collection_ids) {
                        let get_collection_product_ids = [];
                        let entitled_collection_ids = ecommerce_discount?.entitled_collection_ids;
                        for (let collection_id of entitled_collection_ids) {
                            let get_collection_products = await ShopifyGetCollectionProducts(store_detail, collection_id);
                            get_collection_products.filter((collection_product) => {
                                get_collection_product_ids.push(collection_product?.id);
                            });
                        }
                        product_details.filter((product_detail) => {
                            if (get_collection_product_ids.includes(parseInt(product_detail?.product_id)) === true) {
                                check_discount_condition = true;
                                specific_produdcts.push(product_detail);
                            }
                        });
                    }
                }

                let specific_produdct_amount = 0;
                specific_produdcts.map((specific_produdct) => {
                    specific_produdct_amount = parseFloat(specific_produdct_amount) + parseFloat(specific_produdct?.price);
                });

                if (discount_amount === 100) {
                    shopify_discount_amount = discount_amount;
                    discount_amount = specific_produdct_amount;
                } else {
                    shopify_discount_amount = discount_amount;
                    discount_amount = parseFloat(specific_produdct_amount * discount_amount / 100);
                }

            }

            /******** Discount Type - Amount off products ********/
            if (
                ecommerce_discount?.target_type == "line_item"
                && ecommerce_discount?.target_selection == "entitled"
                && ecommerce_discount?.allocation_method == "across"
            ) {

                let specific_produdcts = [];
                check_discount_condition = false;
                // Check Specific products Exist in cart or not
                if (ecommerce_discount?.entitled_product_ids.length > 0) {
                    let customer_discount_product_items = ecommerce_discount?.entitled_product_ids;
                    product_details.filter((product_detail) => {
                        if (customer_discount_product_items.includes(parseInt(product_detail?.product_id)) === true) {
                            check_discount_condition = true;
                            specific_produdcts.push(product_detail);
                        }
                    });
                }

                if (ecommerce_discount?.entitled_variant_ids.length > 0) {
                    let customer_discount_product_varient_items = ecommerce_discount?.entitled_variant_ids;
                    product_details.filter((product_detail) => {
                        if (customer_discount_product_varient_items.includes(parseInt(product_detail?.variant_id)) === true) {
                            check_discount_condition = true;
                            specific_produdcts.push(product_detail);
                        }
                    });
                }

                // Check Specific collections Exist in cart or not
                if (ecommerce_discount?.entitled_collection_ids.length > 0) {
                    let customer_collection_product_ids = [];
                    let customer_discount_collection_items = ecommerce_discount?.entitled_collection_ids;
                    for (let collection_id of customer_discount_collection_items) {
                        let customer_collection_products = await ShopifyGetCollectionProducts(store_detail, collection_id);
                        customer_collection_products.filter((collection_product) => {
                            customer_collection_product_ids.push(collection_product?.id);
                        });
                    }
                    product_details.filter((product_detail) => {
                        if (customer_collection_product_ids.includes(parseInt(product_detail?.product_id)) === true) {
                            check_discount_condition = true;
                            specific_produdcts.push(product_detail);
                        }
                    });
                }

                let specific_produdct_amount = 0;
                specific_produdcts.map((specific_produdct) => {
                    specific_produdct_amount = parseFloat(specific_produdct_amount) + parseFloat(specific_produdct?.price);
                });
                ////////////////////////////// Discount Type - Amount off products/Percentage
                if (ecommerce_discount?.value_type == "percentage") {
                    shopify_discount_amount = discount_amount;
                    discount_amount = parseFloat(specific_produdct_amount * discount_amount / 100);
                }

                ////////////////////////////// Discount Type - Amount off products/Fixed amount
                if (ecommerce_discount?.value_type == "fixed_amount") {
                    shopify_discount_amount = discount_amount;
                }
            }

            /******** Discount Type - Amount off order ********/
            if (ecommerce_discount?.target_type == "line_item" && ecommerce_discount?.target_selection == "all") {

                ////////////////////////////// Discount Type - Amount off order/Percentage
                if (ecommerce_discount?.value_type == "percentage") {
                    shopify_discount_amount = discount_amount;
                    discount_amount = parseFloat(subtotal_price * discount_amount / 100);
                }

                ////////////////////////////// Discount Type - Amount off order/Fixed Amount
                if (ecommerce_discount?.value_type == "fixed_amount") {
                    shopify_discount_amount = discount_amount;
                    totalPrice = parseFloat(subtotal_price) - parseFloat(discount_amount);
                }
            }

            /******** Discount Type - Free Shipping ********/
            if (ecommerce_discount?.value_type == "percentage" && ecommerce_discount?.target_type == "shipping_line") {
                shopify_discount_amount = discount_amount;
                totalPrice = parseFloat(totalPrice) - parseFloat(shipping_rate_amount);
            }


            if (check_discount_condition) {
                totalPrice = parseFloat(totalPrice) - parseFloat(discount_amount);
                discount_html = `
                    <h5 class="text__order-ship">
                        <span>
                            ${language_translation ? language_translation.discount : 'Discount'}
                            <strong class="discount-title">
                                <i class="bi bi-tag ms-2"></i>${ecommerce_discount?.title}
                            </strong>
                        </span>
                        <span class="float-end price iteam__sh">
                            - ${await shopify_money_format(discount_amount, money_format)}
                        </span>
                    </h5>
                `;

                ecommerce_discount_apply = true;

                apply_discount = {
                    shopify_discount_type: "fixed_amount",
                    shopify_discount_amount: discount_amount,

                    discount_source: "shopify",
                    discount_id: ecommerce_discount?.id,
                    discount_title: ecommerce_discount?.title,
                    discount_type: ecommerce_discount?.discount_type,
                    discount_amount: discount_amount,
                };
            }
        }

        //////////////////////////////////// Get Automatic Discount Functionality
        if (ecommerce_discount_apply === false) {
            let automatic_discount_apply = {};

            let default_timezone = moment.tz.guess();
            moment.tz.setDefault(default_timezone);

            let automatic_discounts = await AutomaticDiscounts.findAll({
                order: [["id", "DESC"]],
                where: { store_id: store_id },
            });

            let discount_title = '';
            let max_discount_amount = 0;
            for (let automatic_discount of automatic_discounts) {
                check_discount_condition = true;
                automatic_discount = automatic_discount?.dataValues;

                // Check Start date is Valid or Not
                let active_from_date = moment(automatic_discount?.active_from_date);
                console.log("check_automatic_discount active_from_date-------", active_from_date);
                check_discount_condition = moment().diff(active_from_date, "minutes") > 0;

                // Check End date is Valid or Not
                if (check_discount_condition && automatic_discount?.is_end_date === true) {
                    let active_to_date = moment(automatic_discount?.active_to_date);
                    console.log("check_automatic_discount active_to_date-------", active_to_date);

                    check_discount_condition = moment().diff(active_to_date, "hours") < 0;
                }

                /******** Discount Type - Buy X Get Y ********/
                if (automatic_discount?.discount_type === "buy_x_get_y" && check_discount_condition == true) {

                    let check_discount_condition = false;
                    if (automatic_discount?.cart_minimum_quantity_bool) {
                        check_discount_condition = automatic_discount?.cart_minimum_quantity <= cart_item_count;
                    }

                    if (automatic_discount?.cart_amount_quantity_bool) {
                        check_discount_condition = automatic_discount?.cart_minimum_amount <= subtotal_price;
                    }

                    let specific_produdcts = [];
                    if (check_discount_condition === true) {
                        let buy_product_include = false;
                        // Check Buy Specific Products Exist or Not
                        if (automatic_discount?.customer_buy_product_varient_items) {
                            let customer_buy_product_varient_items = automatic_discount?.customer_buy_product_varient_items;
                            product_details.filter((product_detail) => {
                                if (customer_buy_product_varient_items.includes(product_detail?.variant_id) === true) {
                                    buy_product_include = true;
                                    return false;
                                }
                            });
                        }

                        // Check Buy Specific Collection Exist or Not
                        if (buy_product_include === false) {
                            if (automatic_discount?.customer_buy_collection_items) {
                                let buy_collection_product_ids = [];
                                let customer_buy_collection_items = automatic_discount?.customer_buy_collection_items;
                                for (let collection_id of customer_buy_collection_items) {
                                    let buy_collection_products = await ShopifyGetCollectionProducts(store_detail, collection_id);
                                    buy_collection_products.filter((collection_product) => {
                                        buy_collection_product_ids.push(collection_product?.id);
                                    });
                                }
                                product_details.forEach(product_detail => {
                                    if (buy_collection_product_ids.includes(parseInt(product_detail?.product_id)) === true) {
                                        buy_product_include = true;
                                        return false;
                                    }
                                });
                            }
                        }

                        if (buy_product_include === true) {
                            let product_filter_count = 0;
                            let maximum_discount_usage = automatic_discount?.maximum_discount_usage;

                            // Check Get Specific Products Exist or Not
                            if (automatic_discount?.customer_get_product_varient_items) {
                                let customer_get_product_varient_items = automatic_discount?.customer_get_product_varient_items;
                                product_details.filter((product_detail) => {
                                    if (customer_get_product_varient_items.includes(product_detail?.variant_id) === true) {
                                        if (product_filter_count == maximum_discount_usage) { return; }
                                        specific_produdcts.push(product_detail);
                                        product_filter_count++;
                                    }
                                });
                            }

                            // Check Get Specific Collection Exist or Not
                            if (automatic_discount?.customer_get_collection_items) {
                                let get_collection_product_ids = [];
                                let customer_get_collection_items = automatic_discount?.customer_get_collection_items;
                                for (let collection_id of customer_get_collection_items) {
                                    let get_collection_products = await ShopifyGetCollectionProducts(store_detail, collection_id);
                                    get_collection_products.filter((collection_product) => {
                                        get_collection_product_ids.push(collection_product?.id);
                                    });
                                }
                                product_details.filter((product_detail) => {
                                    if (get_collection_product_ids.includes(parseInt(product_detail?.product_id)) === true) {
                                        if (product_filter_count == maximum_discount_usage) { return; }
                                        specific_produdcts.push(product_detail);
                                        product_filter_count++;
                                    }
                                });
                            }
                        }
                    }

                    if (check_discount_condition == true && specific_produdcts.length > 0) {
                        automatic_discount_apply = automatic_discount;

                        let discount_price = 0;
                        specific_produdcts.map((specific_produdct) => {
                            discount_price = parseFloat(discount_price) + parseFloat(specific_produdct?.price);
                        });

                        if (automatic_discount_apply?.customer_percentage_discount_bool === true) {
                            discount_price = parseFloat(discount_price * automatic_discount_apply?.customer_percentage_discount / 100)
                        }

                        discount_title = max_discount_amount > discount_price ? discount_title : automatic_discount_apply?.discount_title;
                        discount_amount = max_discount_amount > discount_price ? max_discount_amount : discount_price;
                        max_discount_amount = parseFloat(discount_price);

                        shopify_discount_amount = discount_price;
                    }

                }

                /******** Discount Type - Percentage ********/
                if (automatic_discount?.discount_type === "percentage" && check_discount_condition == true) {

                    if (automatic_discount?.cart_minimum_quantity_bool && check_discount_condition == true) {
                        check_discount_condition = automatic_discount?.cart_minimum_quantity <= cart_item_count;
                    }

                    if (automatic_discount?.cart_mini_amount_bool && check_discount_condition == true) {
                        check_discount_condition = automatic_discount?.cart_minimum_amount <= subtotal_price;
                    }

                    let specific_produdcts = [];
                    if (automatic_discount?.specific_order_bool === true && check_discount_condition == true) {
                        check_discount_condition = false;
                        if (automatic_discount?.customer_discount_product_varient_items) {
                            let customer_discount_product_varient_items = automatic_discount?.customer_discount_product_varient_items;
                            product_details.filter((product_detail) => {
                                if (customer_discount_product_varient_items.includes(product_detail?.variant_id) === true) {
                                    check_discount_condition = true;
                                    specific_produdcts.push(product_detail);
                                    return false;
                                }
                            });
                        }

                        if (automatic_discount?.customer_discount_collection_items) {
                            let collection_product_ids = [];
                            let collection_items = automatic_discount?.customer_discount_collection_items;
                            for (let collection_id of collection_items) {
                                let collection_products = await ShopifyGetCollectionProducts(store_detail, collection_id);
                                collection_products.filter((collection_product) => {
                                    collection_product_ids.push(collection_product?.id);
                                });
                            }
                            product_details.forEach(product_detail => {
                                if (collection_product_ids.includes(parseInt(product_detail?.product_id)) === true) {
                                    check_discount_condition = true;
                                    specific_produdcts.push(product_detail);
                                    return false;
                                }
                            });
                        }
                    }
                    if (check_discount_condition === true) {
                        automatic_discount_apply = automatic_discount;
                        discount_amount = parseFloat(automatic_discount_apply?.percentage_discount_value);

                        if (specific_produdcts.length > 0) {
                            let specific_produdct_amount = 0;
                            specific_produdcts.map((specific_produdct) => {
                                let quantity = specific_produdct.quantity
                                specific_produdct_amount = (parseFloat(specific_produdct_amount) + parseFloat(specific_produdct?.price)) * quantity;
                            });

                            discount_amount = parseFloat(specific_produdct_amount * discount_amount / 100);
                        } else {
                            discount_amount = parseFloat(subtotal_price * discount_amount / 100);
                        }

                        discount_title = max_discount_amount > discount_amount ? discount_title : automatic_discount_apply?.discount_title;
                        discount_amount = max_discount_amount > discount_amount ? max_discount_amount : discount_amount;
                        max_discount_amount = parseFloat(discount_amount);

                    }
                }

                /******** Discount Type - Fixed Amount ********/
                if (automatic_discount?.discount_type === "fixed_amount" && check_discount_condition == true) {

                    if (automatic_discount?.cart_minimum_quantity_bool && check_discount_condition == true) {
                        check_discount_condition = automatic_discount?.cart_minimum_quantity <= cart_item_count;
                    }

                    if (automatic_discount?.cart_mini_amount_bool && check_discount_condition == true) {
                        check_discount_condition = automatic_discount?.cart_minimum_amount <= subtotal_price;
                    }

                    let specific_produdcts = [];
                    if (automatic_discount?.specific_order_bool === true && check_discount_condition == true) {
                        check_discount_condition = false;
                        if (automatic_discount?.customer_discount_product_varient_items) {
                            let customer_discount_product_varient_items = automatic_discount?.customer_discount_product_varient_items;
                            product_details.filter((product_detail) => {
                                if (customer_discount_product_varient_items.includes(product_detail?.variant_id) === true) {
                                    check_discount_condition = true;
                                    specific_produdcts.push(product_detail);
                                    return false;
                                }
                            });
                        }

                        if (automatic_discount?.customer_discount_collection_items) {
                            let collection_product_ids = [];
                            let collection_items = automatic_discount?.customer_discount_collection_items;
                            for (let collection_id of collection_items) {
                                let collection_products = await ShopifyGetCollectionProducts(store_detail, collection_id);
                                collection_products.filter((collection_product) => {
                                    collection_product_ids.push(collection_product?.id);
                                });
                            }
                            product_details.forEach(product_detail => {
                                if (collection_product_ids.includes(parseInt(product_detail?.product_id)) === true) {
                                    check_discount_condition = true;
                                    specific_produdcts.push(product_detail);
                                    return false;
                                }
                            });
                        }
                    }
                    if (check_discount_condition === true) {
                        automatic_discount_apply = automatic_discount;
                        discount_amount = parseFloat(automatic_discount_apply?.percentage_discount_value);

                        discount_title = max_discount_amount > discount_amount ? discount_title : automatic_discount_apply?.discount_title;
                        discount_amount = max_discount_amount > discount_amount ? max_discount_amount : discount_amount;
                        max_discount_amount = parseFloat(discount_amount);

                    }
                }

                /******** Discount Type - Free Shipping ********/
                if (automatic_discount?.discount_type === "free_shipping" && check_discount_condition == true) {
                    if (automatic_discount?.cart_minimum_quantity_bool && check_discount_condition == true) {
                        check_discount_condition = automatic_discount?.cart_minimum_quantity <= cart_item_count;
                    }

                    if (automatic_discount?.cart_mini_amount_bool && check_discount_condition == true) {
                        check_discount_condition = automatic_discount?.cart_minimum_amount <= subtotal_price;
                    }

                    // Create Discount Html
                    if (check_discount_condition === true) {
                        automatic_discount_apply = automatic_discount;

                        discount_amount = parseFloat(shipping_rate_amount);

                        discount_title = max_discount_amount > discount_amount ? discount_title : automatic_discount_apply?.discount_title;
                        discount_amount = max_discount_amount > discount_amount ? max_discount_amount : discount_amount;
                        max_discount_amount = parseFloat(discount_amount);

                        shopify_discount_amount = discount_amount;

                    }
                }
            }

            if (discount_title) {
                totalPrice = parseFloat(totalPrice) - parseFloat(discount_amount);
                totalPrice = totalPrice < 0 ? 0.00 : totalPrice;
                discount_html = `
                    <h5 class="text__order-ship">
                        <span>
                            ${language_translation ? language_translation.discount : 'Discount'}
                            <strong class="discount-title">
                                <i class="bi bi-tag ms-2"></i>${discount_title}
                            </strong>
                        </span>
                        <span class="float-end price iteam__sh">
                            - ${await shopify_money_format(discount_amount, money_format)}
                        </span>
                    </h5>
                `;
            }

            if (discount_title && automatic_discount_apply?.id) {
                apply_discount = {
                    shopify_discount_type: "fixed_amount",
                    shopify_discount_amount: discount_amount,

                    discount_source: "automatic_discount",
                    discount_id: automatic_discount_apply?.id,
                    discount_title: automatic_discount_apply?.discount_title,
                    discount_type: automatic_discount_apply?.discount_type,
                    discount_amount: discount_amount,
                };
            }
        }

        let customize_checkout = await models.CustomizeCheckout.findOne({
            where: {
                store_id: store_id
            },
        });

        if (customize_checkout.template_code === "d1") {
            shipping_rate_amount = 0
        }

        totalPrice = parseFloat(totalPrice) + parseFloat(shipping_rate_amount);

        let tax_rate_html = "";
        if (tax_rate_percentage && tax_preference_not_included) {
            tax_rate_percentage = parseFloat(tax_rate_percentage)
            if (!tax_preference_shipping_rate_charge) {
                tax_rate = (tax_rate_percentage * (totalPrice - parseFloat(shipping_rate_amount))).toFixed(2) / 100
            } else {
                tax_rate = (totalPrice * tax_rate_percentage).toFixed(2) / 100
            }
            totalPrice = parseFloat(totalPrice) + parseFloat(tax_rate);

            tax_rate_html = `
                <h5 class="text__order-ship">
                    ${tax_rate_name}
                    <span class="float-end price iteam__sh">${await shopify_money_format(tax_rate, money_format)}</span>
                    <input type="hidden" name="tax_rate_id" value="${tax_id}" />
                    <input type="hidden" name="tax_rate_name" value="${tax_rate_name}" />
                    <input type="hidden" name="tax_rate_percentage" value="${tax_rate_percentage}" />
                    <input type="hidden" name="tax_rate_amount" value="${tax_rate}" />
                </h5>
            `;
        }

        let shipping_rate_html = "";
        if (shipping_rate_amount > 0 && customize_checkout.template_code !== "d1") {
            shipping_rate_html = `
                <h5 class="text__order-ship">
                    ${shipping_rate_name}
                    <span class="float-end price iteam__sh">
                        ${await shopify_money_format(shipping_rate_amount, money_format)}
                    </span>
                    <input type="hidden" name="shipping_rate_name" value="${shipping_rate_name}" />
                    <input type="hidden" name="shipping_rate_amount" value="${shipping_rate_amount}" />
                </h5>
            `
        }

        let button_price_html = `${await shopify_money_format(totalPrice, money_format)}`;
        let checkout_price_section_html = `
            <h5 class="text__order-ship mt-3">
                ${language_translation ? language_translation.subtotal : 'Subtotal'}
                <span class="float-end price iteam__sh">${await shopify_money_format(subtotal_price, money_format)}</span>
            </h5>
            ${shipping_rate_html}
            ${discount_html}
            ${tax_rate_html}
            <div class="total-all-iteam">
                <h5 class="tatl-txt">
                    ${language_translation ? language_translation.total : 'Total'}
                    <span class="float-end">
                        ${await shopify_money_format(totalPrice, money_format)}
                        <input type="hidden" name="total_price" value="${totalPrice.toFixed(2)}" />
                        <input type="hidden" name="subtotal" value="${subtotal_price.toFixed(2)}" />
                    </span>
                </h5>
            </div>
        `;

        return res.json({
            status: true,
            totalPrice: totalPrice,
            apply_discount: apply_discount,
            button_price_html: button_price_html,
            checkout_price_section_html: checkout_price_section_html,
            message: "Discount Code found successfully",
        });
    } catch (error) {
        console.error("check_automatic_discount error----------", error?.message);
        return res.json({
            status: false,
            message: error?.message ? error.message : "Something went wrong. Please try again.",
        });
    }
};