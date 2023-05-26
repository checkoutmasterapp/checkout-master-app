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
        })

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

        let subtotal_price = total_price;
        let automatic_discount = await AutomaticDiscounts.findOne({
            where: {
                store_id: store_id,
                active_from_date: {
                    [Op.lte]: moment().toDate()
                },
                active_to_date: {
                    [Op.gte]: moment().toDate()
                },
            },
            order: [["updated_at", "DESC"]],
        }).then((response) => {
            return response;
        });
        let total_discount_price = 0;
        let applicable_discount_on = subtotal_price;
        if (automatic_discount?.discount_type == "percentage") {
            // check if minimum quantity 
            if (automatic_discount?.cart_minimum_quantity_bool && automatic_discount?.cart_minimum_quantity >= product_details.length) {
                applicable_discount_on = subtotal_price;
            }
            // check if minimum Amount 
            if (automatic_discount?.cart_amount_quantity_bool && automatic_discount?.cart_minimum_amount >= subtotal_price) {
                applicable_discount_on = subtotal_price;
            }

            // *****calculate Discount**** 
            total_discount_price = (parseFloat((applicable_discount_on * automatic_discount?.percentage_discount_value) / 100)).toFixed(2);
            if (total_price > total_discount_price) {
                total_price = (parseFloat(applicable_discount_on - total_discount_price)).toFixed(2);
            } else {
                total_discount_price = (parseFloat(applicable_discount_on)).toFixed(2);
                total_price = (parseFloat(applicable_discount_on - total_discount_price)).toFixed(2);
            }

            // check if maximum_discount_usage 
            if (automatic_discount?.maximum_discount_usage != 0 && total_discount_price > automatic_discount?.maximum_discount_usage) {
                total_discount_price = (parseFloat(automatic_discount?.maximum_discount_usage)).toFixed(2);
                total_price = (parseFloat(applicable_discount_on - total_discount_price)).toFixed(2);
            }
            console.log("automatic_discount", automatic_discount)
        }

        let product_id = [];
        if (checkout_detail) {
            for (cart_detail of checkout_detail?.carts) {
                product_id.push(
                    cart_detail.product_id
                );
            }
        }

        product_id = product_id.filter((item, index) => product_id.indexOf(item) === index);

        // Get UpsellTrigger Data
        const upsellTriggerData = await models.UpsellTrigger.findAll({
            where: { trigger_id: product_id },
        });

        var upsell_id = [];
        if (upsellTriggerData) {
            for (let trigger of upsellTriggerData) {
                upsell_id.push(
                    trigger.upsell_id
                );
            }
        }

        // Get Upsell Data
        upsell_id = upsell_id.filter((item, index) => upsell_id.indexOf(item) === index);
        const upsellData = await models.Upsell.findOne({
            where: {
                store_id: store_id,
                id: upsell_id
            },
            order: [
                ['created_at', 'DESC']
            ],
        });


        res.render("shopify/preview_checkout", {
            store_id: store_id,
            checkout_id: checkout_id,

            countries: countries,
            automatic_discount: automatic_discount,
            total_discount_price: total_discount_price,
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
            language_translation: language_translation,
            upsellTriggerData: upsellTriggerData,
            upsellData: upsellData,
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
            return sub_total_upsell;
        });

        var shipping_rate = order_detail?.checkout?.shipping_rate_amount ? order_detail.checkout.shipping_rate_amount : "0.00";
        var upsell_total = parseFloat(sub_total_upsell) + parseFloat(shipping_rate);

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
        const { store_id, checkout_id, order_id } = req.params;

        // Get Store Detail
        let store_detail = await Stores.findOne({
            where: {
                id: store_id,
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

        // Get Product Id from Carts
        let product_id = [];
        if (checkout_detail) {
            for (cart_detail of checkout_detail?.carts) {
                product_id.push(
                    cart_detail.product_id
                );
            }
        }

        product_id = product_id.filter((item, index) => product_id.indexOf(item) === index);

        // Get UpsellTrigger Data
        const upsellTriggerData = await models.UpsellTrigger.findAll({
            where: { trigger_id: product_id },
        });

        var upsell_id = [];
        if (upsellTriggerData) {
            for (let trigger of upsellTriggerData) {
                upsell_id.push(
                    trigger.upsell_id
                );
            }
        }

        // Get Upsell Data
        upsell_id = upsell_id.filter((item, index) => upsell_id.indexOf(item) === index);
        const upsellData = await models.Upsell.findOne({
            where: {
                store_id: store_id,
                id: upsell_id
            },
            order: [
                ['created_at', 'DESC']
            ],
        });

        // Get UpsellOffer Data
        const upsellOfferData = await models.UpsellTriggerOffer.findAll({
            where: {
                store_id: store_id,
                upsell_id: upsellData?.id
            },
        });


        res.render("shopify/upsells", {
            store_id: store_id,
            order_id: order_id,
            checkout_id: checkout_id,

            upsellData: upsellData,
            upsellOfferData: upsellOfferData,
            upsellTriggerData: upsellTriggerData,
        });
    } catch (error) {
        console.error("shopify_upsell error----------", error);
        return res.json({
            status: false,
            message: error?.message ? error.message : "Something went wrong. Please try again.",
        });
    }
};

module.exports.shopify_purchase_upsell = async (req, res, next) => {
    let request_body = req.body;
    console.log(request_body, '-------request_body')
    const product_detail = request_body.product_ids;

    product_detail.forEach(element => {
        console.log(element.upsell_product_id, '-------------upsell_product_id')
    });
    try {
        let order_detail = await models.Orders.findOne({
            where: {
                shop_id: request_body?.store_id,
                order_uuid: request_body?.order_id
            },
        }).then((response) => {
            return response;
        });
        console.log(order_detail, '-----------order_detail')
        let checkout_detail = await models.Checkouts.findOne({
            attributes: ['cart_token'],
            where: {
                checkout_uuid: request_body?.checkout_id,
                shop_id: request_body?.store_id,
            }
        }).then((response) => {
            return response;
        });



        let create_checkout = await models.Checkouts.create({
            shop_id: request_body?.store_id,
            cart_token: checkout_detail?.cart_token
        })
            .then((response) => {
                return response;
            });


        product_detail.forEach(async element => {
            let create_cart = await models.Cart.create({
                cart_token: checkout_detail?.cart_token,
                checkout_id: create_checkout?.id,
                product_id: element.upsell_product_id,
                variant_id: element.upsell_varient_id,
                price: element.upsell_price,
                quantity: element.upsell_quantity,
                image: element.upsell_product_image,
                title: element.upsell_product_title,
                product_weight: request_body?.grams,
            })
                .then((response) => {
                    return response;
                });

        });

        let store_detail = await models.Stores.findOne({
            where: {
                id: request_body.store_id,
            },
        });

        let payment_method = await models.PaymentMethods.findOne({
            where: {
                method_name: "Stripe",
                store_id: request_body.store_id,
            },
        });

        if (payment_method.method_name == "Stripe") {
            const stripe = require("stripe")(payment_method.secret);

            /////////////////////////////////////////// Stripe Payment Start ///////////////////////////////////////////

            var stripecharge_response = await stripe.charges.create({
                customer: order_detail?.payment_response?.customer,
                currency: 'USD',
                amount: Math.floor(1 * 100),
                description: `Payment Received from store "${store_detail?.store_name}" -> "${order_detail?.email}"`,
            });
        }
        let payment_id = stripecharge_response?.id

        /////////////////////////////////////////// Shopify Order Created Start ///////////////////////////////////////////
        let items = [];
        let shipping_lines = [];
        let transactions = [];
        // let productData = JSON.parse(request_body.product_details);
        // productData.carts.forEach((element) => {
        const line_items = {
            quantity: product_detail[0].upsell1_quantity,
            variant_id: '42486308634801',
        };
        items.push(line_items);
        // });
        let customer = {
            email: order_detail.email,
            first_name: order_detail.first_name,
            last_name: order_detail.last_name,
        };
        let shipping_address = {
            email: order_detail.email,
            first_name: order_detail.first_name,
            last_name: order_detail.last_name,
            address1: order_detail.address,
            phone: order_detail.phone,
            city: order_detail.city,
            zip: order_detail.zipCode,
            country: order_detail.country,
            state: order_detail.state,
        };

        if (request_body?.shipping_name) {
            let shippings = {
                price: request_body?.shipping_rate_amount,
                title: request_body?.shipping_name
            }
            shipping_lines.push(shippings);
        }

        let paidByCustomer = {
            kind: "capture",
            status: "success",
            gateway: "manual",
            amount: '1'
        }

        transactions.push(paidByCustomer);
        let Order = {
            line_items: items,
            shipping_address: shipping_address,
            customer: customer,
            shipping_lines: shipping_lines,
            transactions: transactions
        }
        let billing_address = {}
        if (request_body.billing_status == 'true') {

            let billingDetails = JSON.parse(request_body.billingDetails);
            billing_address = {
                first_name: billingDetails.billing_first_name,
                last_name: billingDetails.billing_last_name,
                address1: billingDetails.billing_address,
                city: billingDetails.billing_city,
                zip: billingDetails.billing_zip_code,
                country: billingDetails.billing_country,
                state: billingDetails.billing_state,
            }
            Order.billing_address = billing_address
        }
        let findCustomer = await detectCustomer(store_detail);
        if (findCustomer?.customers.length > 0) {
            findCustomer.customers.forEach(element => {
                if (element?.email !== null) {
                    if (element?.email.includes(request_body.email)) {
                        Order = {
                            line_items: items,
                            shipping_address: shipping_address,
                            customer: {
                                id: element.id
                            },
                            // total_tax: request_body.shipping_rate_amount,
                            shipping_lines: shipping_lines,
                            // phone: request_body.phone,
                            transactions: transactions
                        }
                        if (request_body.billing_status == 'true') {
                            Order.billing_address = billing_address
                            console.log("element?.email.includes-------", Order)
                        }
                    }
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
            type: "upsell",
            parent_order_id: request_body?.order_id,
            checkout_id: create_checkout?.id,
            payment_id: payment_id,
            shopify_order_id: shopify_order_id
        });
    } catch (error) {
        console.error("Upsell purchase error----------", error);
        return res.json({
            status: false,
            message: error?.message ? error.message : "Something went wrong. Please try again.",
        });
    }
};

/////////////////////////////////////////// Get exist Customers ///////////////////////////////////////////
const detectCustomer = async (findStore) => {
    var getAllCustomer = {
        json: true,
        method: "GET",
        uri: `https://${findStore.store_name}.myshopify.com/admin/api/2023-01/customers.json`,
        headers: {
            "X-Shopify-Access-Token": findStore.store_token,
            "Content-Type": "application/json",
        },
        json: true,
    };
    let getExistCustomers = await request(getAllCustomer)
        .then(async (getAllCustomerResult) => {
            //   console.log("getAllCustomerResult data", getAllCustomerResult);
            return getAllCustomerResult;
        })
        .catch(function (error) {
            console.error("getAllCustomerResult error -----------------", error);
        });
    return getExistCustomers

}