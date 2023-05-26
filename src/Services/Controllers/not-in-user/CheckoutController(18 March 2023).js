const models = require("../models");
const moment = require("moment");
const sequelize = require('sequelize');
const Op = sequelize.Op;
const { Stores, CustomizeAboutSections, CustomizeCheckout, ShippingRates, PaymentMethods, Translations, AutomaticDiscounts } = require("../models");
const request = require("request-promise");

module.exports.create_checkout = async (req, res, next) => {
    const { store_id } = req.params;

    try {
        let store_detail = await models.Checkouts.create({ shop_id: store_id }).then((response) => {
            return response;
        });

        return res.json({
            status: true,
            message: "Checkout create successfully",
            store_detail: store_detail,
        });
    } catch (error) {
        console.error("create_checkout error----------", error);
        return res.json({
            status: false,
            message: "Something went wrong.Please check your details!",
        });
    }
};

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

module.exports.update_checkout = async (req, res, next) => {
    let request_body = req.body;
    const { checkout_id, store_id, line_items } = req.params;

    try {
        let line_items = request_body?.line_items;

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

            if (cart_detail) {
                cart_detail.forEach(async (element) => {
                    await models.Cart.destroy({
                        where: {
                            checkout_id: element.checkout_id,
                        },
                    }).then((result) => {
                        // console.log("result-------result", result);
                    });
                });
                let cart_items = [];
                let price = 0;
                for (let line_item of line_items) {
                    price += parseFloat(line_item.price);
                    cart_items.push({
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
    let custom_array = {};
    for (let key in array_objects) {
        let array_object = array_objects[key];
        if (Array.isArray(array_object)) {
            let new_key = array_object[object_key];
            if (typeof custom_array[array_object[object_key]] === "undefined") {
                custom_array[new_key] = [];
            }
            custom_array[new_key].push(array_object);
        } else {
            custom_array[array_object[object_key]] = array_object;
        }
    }
    return custom_array;
}


module.exports.shopify_checkout = async (req, res, next) => {
    const { checkout_id, store_id } = req.params;
    console.log("shopify_checkout store_id-----------", store_id);
    console.log("shopify_checkout checkout_id-----------", checkout_id);

    try {
        // Get Store Detail
        let store_detail = await Stores.findOne({
            where: {
                id: store_id,
            },
        })

        // Get Store Customize Checkout
        let customize_checkout = await CustomizeCheckout.findOne({
            where: { store_id: store_id },
            include: [
                {
                    model: CustomizeAboutSections,
                },
            ],
        })

        // Get Store ShippingRates Details
        let shipping_options = await ShippingRates.findAll({
            where: {
                store_id: store_id
            },
        })

        // Get Store PaymentMethods Details
        let payment_methods = await PaymentMethods.findAll({
            where: {
                store_id: store_id
            },
        });
        let payment_methods_key = convert_key_array(payment_methods, "method_name");

        // Get Store Translations Details
        let language_translation = await Translations.findOne({
            where: {
                store_id: store_id,
            },
        });

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

        let total_price = 0;
        let product_details = [];
        let total_weight = 0;
        if (checkout_detail) {
            for (cart_detail of checkout_detail?.carts) {
                product_details.push({
                    title: cart_detail.title,
                    image: cart_detail.image,
                    quantity: cart_detail.quantity,
                    price: cart_detail.price,
                    product_id: cart_detail.product_id
                });

                total_price += parseFloat(cart_detail.quantity * cart_detail.price);
                total_weight += parseFloat(cart_detail.quantity * cart_detail.product_weight);
            }
        }
        let countries = await models.Countries.findAll({
            order: [["country_name", "ASC"]],
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

        customize_checkout = customize_checkout?.dataValues;
        let custom_script = customize_checkout?.custom_script;
        delete customize_checkout.custom_script;

        let thankyou_description = customize_checkout?.thankyou_description;
        delete customize_checkout.thankyou_description;


        let product_id = [];
        if (checkout_detail) {
            for (cart_detail of checkout_detail?.carts) {
                product_id.push(
                    cart_detail.product_id
                );
            }
        }

        product_id = product_id.filter((item, index) => product_id.indexOf(item) === index);

        let subtotal_price = total_price;
        let automatic_discount = await AutomaticDiscounts.findOne({
            where: {
                store_id: store_id,
                active_from_date: {
                    [Op.lte]: moment().toDate()
                }
            },
            order: [["updated_at", "DESC"]],
        })

        console.log("automatic_discount----------", automatic_discount)
        const discount_type = automatic_discount?.discount_type;
        let discount_apply = false;
        let product_length = product_details.length;
        if (product_length == 1) {
            product_length = product_details[0]?.quantity
        }
        let discount_applicable_items = automatic_discount?.customer_discount_items;
        let discount_buy_items = automatic_discount?.customer_buy_items;

        var include = false;
        var checkCount = 0;
        var quantity = 0;
        var price = 0;
        var discount_value = automatic_discount?.percentage_discount_value
        if (discount_applicable_items) {
            discount_applicable_items.forEach(element => {
                product_details.forEach(element1 => {
                    var product_idCheck = element.includes(element1?.product_id);
                    if (product_idCheck) {
                        checkCount += 1;
                        quantity += element1.quantity;
                        price += element1.price * element1.quantity
                    }
                });
            });
            if (checkCount > 0 && product_length >= checkCount) {
                include = true;
            }
            if (automatic_discount?.discount_each_item) {
                discount_value = (parseFloat(automatic_discount?.percentage_discount_value) * quantity).toFixed(2);
            }
            if (discount_type == "percentage") {
                discount_value = (parseFloat(price * automatic_discount?.percentage_discount_value / 100)).toFixed(2);
            }

            if (discount_type == "buy_x_get_y") {
                let buy_product_price = 0;
                discount_buy_items.forEach(element => {
                    product_details.forEach(element1 => {
                        var product_idCheck = element.includes(element1?.product_id);
                        if (product_idCheck) {
                            buy_product_price += element1.price * element1.quantity
                        }
                    });
                });
                if (automatic_discount?.customer_free_discount_bool) {
                    if (price > buy_product_price) {
                        discount_value = (parseFloat(buy_product_price)).toFixed(2);
                    } else {
                        discount_value = (parseFloat(price)).toFixed(2);
                    }
                } else if (automatic_discount?.customer_percentage_discount_bool) {
                    // var price_discount_prct = price* automatic_discount?.customer_percentage_discount / 100;
                    // var buy_discount_prct = buy_product_price* automatic_discount?.customer_percentage_discount / 100;

                    console.log(price, '----------', buy_product_price)
                    if (price > buy_product_price) {
                        discount_value = (parseFloat(buy_product_price)).toFixed(2);
                    } else {
                        discount_value = (parseFloat(price * automatic_discount?.customer_percentage_discount / 100)).toFixed(2);
                    }
                }
            }
        }

        console.log(include, '---------include', checkCount, product_length, quantity, discount_value, '---------price', price)
        if (automatic_discount) {
            // check if minimum quantity 
            if (automatic_discount?.cart_minimum_quantity_bool && automatic_discount?.cart_minimum_quantity <= product_length) {
                discount_apply = true;
                console.log("------------------1")
            }

            // check if Specific products and collections is true 
            if (automatic_discount?.specific_order_bool && include) {
                discount_apply = true;
                console.log("------------------2")
            }

            // check if minimum Amount 
            if (automatic_discount?.cart_amount_quantity_bool && automatic_discount?.cart_minimum_amount <= subtotal_price) {
                discount_apply = true;
            }

            //Discount expired or not
            if (automatic_discount?.is_end_date && automatic_discount?.active_to_date <= moment().toDate()) {
                discount_apply = false;
                console.log('==================active');
            }
        }

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



        res.render("shopify/preview_checkout", {
            store_id: store_id,
            checkout_id: checkout_id,

            countries: countries,

            subtotal_price: subtotal_price,
            total_price: total_price,
            total_weight: total_weight,
            card_accepted: card_accepted,
            product_details: product_details,
            checkout_detail: checkout_detail,
            store_detail: store_detail,
            custom_script: custom_script,
            customize_checkout: customize_checkout,
            thankyou_description: thankyou_description,

            shipping_options: shipping_options,
            payment_methods: payment_methods,
            payment_methods_key: payment_methods_key,
            language_translation: language_translation,

            upsell_detail: upsell_detail,
            upsell_triggers: upsell_triggers,

            automatic_discount: discount_apply ? automatic_discount : null,
            discount_type: discount_apply ? discount_type : null,
            discount_apply: discount_apply,
            exclude_shipping_amount: discount_apply ? automatic_discount?.exclude_shipping_amount : null,
            discount_value: discount_apply ? discount_value : null,
            discount_applicable_items: discount_apply ? automatic_discount?.customer_discount_items : null,
            include: discount_apply ? include : null,
            entire_order: discount_apply ? automatic_discount?.entire_order_bool : null,
            discount_buy_items: discount_apply ? automatic_discount?.customer_buy_items : null,
        });
    } catch (error) {
        console.error("shopify_checkout error----------", error);
        return res.json({
            status: false,
            message: "Something went wrong.Please check your details!",
        });
    }
};

module.exports.shopify_thankyou = async (req, res, next) => {
    const { store_id, order_id } = req.params;
    console.log("shopify_thankyou store_id-----------", store_id);
    console.log("shopify_thankyou order_id-----------", order_id);

    try {

        // Get Store Detail
        let store_detail = await Stores.findOne({
            where: {
                id: store_id,
            },
        });

        // Get Store Customize Checkout Detail
        let customize_checkout = await CustomizeCheckout.findOne({
            where: {
                store_id: store_id,
            },
        });

        // Get Store Translations Detail
        let language_translation = await Translations.findOne({
            where: {
                store_id: store_id,
            },
        });

        // Get Order Detail
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

        let product_details = [];
        if (order_detail?.checkout?.carts) {
            for (cart_detail of order_detail?.checkout?.carts) {
                product_details.push({
                    title: cart_detail.title,
                    image: cart_detail.image,
                    quantity: cart_detail.quantity,
                    price: cart_detail.price,
                });
            }
        }

        customize_checkout = customize_checkout?.dataValues;
        let custom_script = customize_checkout?.custom_script;
        delete customize_checkout.custom_script;

        let thankyou_description = customize_checkout?.thankyou_description;
        delete customize_checkout.thankyou_description;

        let payment_method = order_detail?.payment_method?.toUpperCase();

        if (order_detail.order_type == "order") {
            var order_parent_id = order_detail.id;
            var upsell_order_detail = await models.Orders.findOne({
                where: {
                    parent_order_id: order_parent_id,
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

        }

        let product_Upsell_details = [];
        if (upsell_order_detail?.checkout?.carts) {
            for (cart_detail of upsell_order_detail?.checkout?.carts) {
                product_Upsell_details.push({
                    title: cart_detail.title,
                    image: cart_detail.image,
                    quantity: cart_detail.quantity,
                    price: cart_detail.price,
                });
            }
        }
        var sub_total_upsell = 0;

        product_Upsell_details.forEach(element => {
            sub_total_upsell += parseFloat(element.price);
            sub_total_upsell += parseFloat(element.price);
            return sub_total_upsell;
        });

        var shipping_rate = order_detail?.checkout?.shipping_rate_amount ? order_detail.checkout.shipping_rate_amount : "0.00";
        var upsell_total = parseFloat(sub_total_upsell) + parseFloat(shipping_rate);
        var upsell_total = parseFloat(sub_total_upsell) + parseFloat(shipping_rate);

        var discount_amount = parseFloat(order_detail?.checkout?.discount_amount).toFixed(2);
        res.render("shopify/thankyou", {
            store_detail: store_detail,

            custom_script: custom_script,
            customize_checkout: customize_checkout,
            thankyou_description: thankyou_description,

            language_translation: language_translation,

            order_detail: order_detail,
            product_details: product_details,
            product_Upsell_details: product_Upsell_details,
            sub_total_upsell: sub_total_upsell,
            upsell_total: upsell_total,
            payment_method: payment_method,
            price: order_detail?.checkout?.price ? order_detail?.checkout?.price : "0.00",
            subtotal: order_detail?.checkout?.subtotal ? order_detail?.checkout?.subtotal : "0.00",
            shipping_rate_name: order_detail?.checkout?.shipping_rate?.shipping_rate_name ? order_detail?.checkout?.shipping_rate?.shipping_rate_name : "Free Shipping",
            shipping_rate_amount: order_detail?.checkout?.shipping_rate_amount ? order_detail.checkout.shipping_rate_amount : "0.00",

            discount_title: order_detail?.checkout?.discount_type,
            discount_amount: order_detail?.checkout?.discount_amount,
        });
    } catch (error) {
        console.error("shopify_thankyou error----------", error);
        return res.json({
            status: false,
            message: "Something went wrong.Please check your details!",
        });
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
            message: "Something went wrong",
        });
    }
};

module.exports.update_cart = async (req, res, next) => {
    const { store_id, checkout_id } = req.params;
    console.log("update_cart store_id ------------", store_id);
    console.log("update_cart checkout_id ------------", checkout_id);

    try {
        if (
            (checkout_id !== "null" || checkout_id !== null)
            && (checkout_id !== undefined || checkout_id !== "undefined")
        ) {
            let checkout_detail = await models.Checkouts.findOne({
                where: {
                    checkout_uuid: checkout_id,
                    shop_id: store_id,
                    cart_token: req.body.cart_token,
                    is_purchase: true,
                },
            }).then((response) => {
                return response;
            });

            if (checkout_detail) {
                return res.json({
                    status: true,
                    data: checkout_detail,
                    message: "Checkout record found",
                });
            } else {
                return res.json({
                    status: false,
                    message: "Record not found",
                });
            }
        } else {
            return res.json({
                status: true,
                message: "Record not found",
            });
        }
    } catch (error) {
        console.error("update_cart error----------", error);
        return res.json({
            status: false,
            message: error.message,
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

        return res.json({
            status: true,
            checkout_url: checkout_url,
        });
    } catch (error) {
        console.error("get_checkout_domain_url error----------", error);
        return res.json({
            status: false,
            message: error.messsage,
        });
    }
};

module.exports.shopify_upsell = async (req, res, next) => {
    try {
        const { store_id, checkout_id, order_id, upsell_id } = req.params;

        const upsell_detail = await models.Upsell.findOne({
            where: {
                store_id: store_id,
                upsell_uuid: upsell_id
            },
        });

        const upsell_trigger_offers = await models.UpsellTriggerOffer.findAll({
            where: {
                store_id: store_id,
                upsell_id: upsell_detail?.id
            },
        });

        res.render("shopify/upsells", {
            store_id: store_id,
            order_id: order_id,
            checkout_id: checkout_id,

            upsell_detail: upsell_detail,
            upsell_trigger_offers: upsell_trigger_offers,
        });
    } catch (error) {
        console.error("shopify_upsell error----------", error);
        return res.json({
            status: false,
            message: error?.message ? error.message : "Something went wrong. Please try again.",
        });
    }
};

const { StripeUpsellChargesCreate } = require("../../libs/StripePaymentHelper");
module.exports.shopify_purchase_upsell = async (req, res, next) => {
    let request_body = req.body;
    console.log("shopify_purchase_upsell request_body ---------", request_body)

    try {

        let order_detail = await models.Orders.findOne({
            where: {
                shop_id: request_body?.store_id,
                order_uuid: request_body?.order_id
            },
        });

        if (order_detail?.payment_method === "Stripe") {
            await StripeUpsellChargesCreate(request_body, order_detail, function (error, response) {
                if (error) {
                    return res.json(error);
                } else {
                    return res.json(response);
                }
            });
        }
        let shopify_order_id;
        var order_detail_api = {
            json: true,
            method: "POST",
            uri: `https://${store_detail.store_name}.myshopify.com/admin/api/2023-01/orders.json`,
            body: {
                order: Order,
            },
            headers: {
                "Content-Type": "application/json",
                "X-Shopify-Access-Token": store_detail.store_token,
            },
        };
        await request(order_detail_api)
            .then(async (order) => {
                console.log("Order Create result ------------", order?.order);
                shopify_order_id = order?.order?.id;
            })
            .catch(function (error) {
                console.error("StripeChargesCreate error -----------------", error);
            });



        return res.json({
            status: true,
            message: "Payment received successfully from upsell purchase",
        });
    } catch (error) {
        console.error("shopify_purchase_upsell error----------", error);
        return res.json({
            status: false,
            message: error?.message ? error.message : "Something went wrong. Please try again.",
        });
    }
};