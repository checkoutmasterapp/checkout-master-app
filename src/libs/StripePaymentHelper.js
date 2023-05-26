const request = require("request-promise");
const moment = require("moment");

const models = require("../../src/Services/models");
const { ShopifyReceiveSingleOrder } = require("./ShopifyHelper");

module.exports.CheckStripeKey = async (request_parameters) => {
    const stripe = require("stripe");

    const { user_id, publishable_key, secret } = request_parameters;

    return new Promise((resolve, reject) => {
        try {
            if (publishable_key && secret) {
                let key = publishable_key.startsWith("pk_live_") || publishable_key.startsWith("pk_test_");

                if (key === false) {
                    reject("Invalid Publish Key!");
                }

                if ((publishable_key.startsWith("pk_live_") === true && secret.startsWith("sk_live_") === false) || (!publishable_key.startsWith("pk_live_") === false && secret.startsWith("sk_live_") === true)) {
                    reject("One of key is invalid either publish or secret!");
                }

                let data = stripe(secret);
                data.identity.verificationSessions
                    .create({
                        type: "document",
                        metadata: {
                            user_id: user_id,
                        },
                    })
                    .then((result) => {
                        resolve(result);
                    })
                    .catch((error) => {
                        if (error.type === "StripeAuthenticationError") {
                            reject(error.raw.message);
                        }
                        if (error === "StripeInvalidRequestError") {
                            reject(error.raw.message);
                        }
                    });
            }
        } catch (error) {
            reject(error);
        }
    });
};

module.exports.StripePaymentIntent = async (request_body, callback) => {
    return new Promise(async (resolve, reject) => {
        try {

            /// Get Payment method details from the database
            let payment_method = await models.PaymentMethods.findOne({
                where: {
                    method_name: "Stripe",
                    store_id: request_body.store_id,
                },
            });

            /////////////////////////////////////////// Initialize Stipe
            const stripe = require("stripe")(payment_method.secret);

            /////////////////////////////////////////// Create a PaymentIntent with the order amount and currency
            const payment_intent = await stripe.paymentIntents.create({
                currency: "aud",
                // currency: request_body?.currency,
                amount: Math.floor(request_body?.price * 100),
                automatic_payment_methods: { enabled: true },
            });
            console.log("StripePaymentIntent payment_intent-------", payment_intent);

            callback(null, {
                status: true,
                clientSecret: payment_intent.client_secret,
                message: "Payment received successfully",
            });
        } catch (error) {
            console.error("StripePaymentIntent error -----------------", error);
            callback({
                status: false,
                message: error?.message || "Something went wrong. Please try again.",
            }, null);
        }
    });
};

module.exports.StripeChargesCreate = async (request_body, callback) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (request_body && request_body.card_number) {
                request_body.card_number = request_body.card_number.replace(/\s+/g, "");
            }

            let store_detail = await models.Stores.findOne({
                where: {
                    id: request_body.store_id,
                },
            });

            //// Check Customer Exist or Not
            let customer_detail = await models.Customers.findOne({
                where: {
                    email: request_body?.email,
                    store_id: request_body?.store_id,
                },
            });

            //// If Customer not Exits then create new customer
            if (!customer_detail) {
                customer_detail = await models.Customers.create({
                    store_id: request_body?.store_id,
                    email: request_body?.email,
                    first_name: request_body?.first_name,
                    last_name: request_body?.last_name,
                    phone: request_body?.phone,
                });
            }

            //// Create New Temp Checkout in the database
            let temp_checkout = await models.TempCheckout.create({
                customer_id: customer_detail?.id,
                store_id: request_body?.store_id,
                checkout_id: request_body?.checkout_id,
                request_body: request_body,
                payment_method: "Stripe"
            });

            /// Get Payment method details from the database
            let payment_method = await models.PaymentMethods.findOne({
                where: {
                    method_name: "Stripe",
                    store_id: request_body.store_id,
                },
            });

            /////////////////////////////////////////// Initialize Stipe
            const stripe = require("stripe")(payment_method.secret);

            //////////////////////////////////// Create Stripe Customer If not Exist
            let stripe_customers = {
                email: request_body.email,
                name: `${request_body.first_name} ${request_body.last_name}`,
            };
            let stripe_customer_id;
            await stripe.customers.create(stripe_customers).then(async function (customer) {
                stripe_customer_id = customer.id;
            });

            //////////////////////////////////// Create Stripe Customer Card
            let stripe_card_id, stripe_card_last4, exp_month, exp_year, stripe_card_brand;
            let card_detail = {
                card: {
                    number: request_body.card_number,
                    exp_month: request_body.expiry_month,
                    exp_year: request_body.expiry_year,
                    name: request_body.first_name,
                    cvc: request_body.cvv,
                },
            };
            await stripe.tokens.create(card_detail).then(async (token) => {
                let stripe_token = token.id;

                stripe_card_last4 = token?.card?.last4;
                exp_month = token?.card?.exp_month;
                exp_year = token?.card?.exp_year;
                stripe_card_brand = token?.card?.brand;

                await stripe.customers.createSource(stripe_customer_id, {
                    source: stripe_token
                }).then(async function (secret_key) {
                    stripe_card_id = secret_key.id;
                });
            });

            //////////////////////////////////// Make update card as Default card
            await stripe.customers.update(stripe_customer_id, {
                invoice_settings: {
                    default_payment_method: stripe_card_id,
                },
            }).then(async function (response) {
                console.log("StripeChargesCreate stripe.customers.update response---------", stripe_customer_id);
            });

            let stripecharge_option = {
                customer: stripe_customer_id,
                currency: store_detail?.store_currency,
                amount: Math.floor(request_body?.price * 100),
                // description: `Payment Received from store "${store_detail?.store_name}" -> "${request_body?.email}"`,
            };

            if (payment_method?.soft_descriptor) {
                stripecharge_option.description = payment_method?.soft_descriptor
            }
            console.log("StripeChargesCreate stripecharge_option---------", stripecharge_option);

            const stripecharge_response = await stripe.charges.create(stripecharge_option);

            temp_checkout.payment_id = stripecharge_response?.id;
            temp_checkout.payment_response = stripecharge_response;
            temp_checkout.payment_card = {
                stripe_card_last4,
                exp_month,
                exp_year,
                stripe_card_brand
            };
            await temp_checkout.save();

            let shopify_response = await StripePaymentSuccess({ payment_id: stripecharge_response?.id });
            callback(null, shopify_response);
        } catch (error) {
            console.error("StripeChargesCreate error -----------------", error);
            callback({
                error: error,
                status: false,
                message: error?.message || "Something went wrong. Please try again.",
            }, null);
        }
    });
};

const StripePaymentSuccess = async (request_body) => {
    return new Promise(async (resolve, reject) => {
        try {
            let temp_checkout = await models.TempCheckout.findOne({
                where: {
                    payment_method: "Stripe",
                    payment_id: request_body.payment_id,
                },
            });
            if (temp_checkout) {
                request_body = temp_checkout?.request_body;

                let store_detail = await models.Stores.findOne({
                    where: {
                        id: request_body.store_id,
                    },
                });

                let customer_detail = await models.Customers.findOne({
                    where: {
                        email: request_body?.email,
                        store_id: request_body?.store_id,
                    },
                });

                ////////////////////////////// Shopify Order Created Start //////////////////////////////
                let items = [];
                let product_details = JSON.parse(request_body.product_details);
                let tax_lines = [];
                if (request_body?.tax_rate_name) {
                    let taxRate = Number(request_body?.tax_rate_percentage) / 100
                    let taxes = {
                        price: request_body?.tax_rate_amount,
                        title: request_body?.tax_rate_name,
                        rate: taxRate
                    }
                    tax_lines.push(taxes);
                }
                product_details.carts.forEach((product_detail) => {
                    const line_items = {
                        quantity: product_detail.quantity,
                        variant_id: product_detail.variant_id,
                        fulfillment_service: "manual",
                        inventory_management: "shopify",
                        tax_lines
                    };
                    items.push(line_items);
                });

                let customer = {
                    email: request_body.email,
                };

                let shipping_address = {};
                let billing_address = {};

                let shipping_lines = [];
                if (request_body?.shipping_name) {
                    let shippings = {
                        price: request_body?.shipping_rate_amount,
                        title: request_body?.shipping_name
                    }
                    shipping_lines.push(shippings);
                }

                let transactions = [];
                let paidByCustomer = {
                    kind: "capture",
                    status: "success",
                    gateway: "manual",
                    amount: request_body?.price
                }
                transactions.push(paidByCustomer);

                let shopify_order_body = {
                    line_items: items,
                    customer: customer,
                    transactions: transactions,
                    // shipping_lines: shipping_lines,
                    // shipping_address: shipping_address,
                }

                let delivery_type = 'immediate';
                if (request_body.product_type === 'physical') {

                    shopify_order_body.shipping_lines = shipping_lines;
                    shopify_order_body.customer = {
                        email: request_body.email,
                        first_name: request_body.first_name,
                        last_name: request_body.last_name,
                    };

                    shipping_address = {
                        email: request_body.email,
                        first_name: request_body.first_name,
                        last_name: request_body.last_name,
                        address1: request_body.address,
                        phone: request_body.phone,
                        city: request_body.city,
                        zip: request_body.zipcode,
                        country: request_body.country,
                        state: request_body.state,
                    }

                    shopify_order_body.shipping_address = shipping_address;

                    if (request_body.billing_status == "true") {
                        let billing_detail = JSON.parse(request_body.billing_detail);
                        billing_address = {
                            first_name: billing_detail.billing_first_name,
                            last_name: billing_detail.billing_last_name,
                            address1: billing_detail.billing_address,
                            city: billing_detail.billing_city,
                            zip: billing_detail.billing_zip_code,
                            country: billing_detail.billing_country,
                            state: billing_detail.billing_state,
                        };
                        shopify_order_body.billing_address = billing_address;
                    } else {
                        billing_address = {
                            first_name: request_body.first_name,
                            last_name: request_body.last_name,
                            address1: request_body.address,
                            city: request_body.city,
                            zip: request_body.zipcode,
                            country: request_body.country,
                            state: request_body.state,
                        };
                        shopify_order_body.billing_address = billing_address;
                    }
                } else {
                    let additional_details = []
                    let note = ''
                    additional_details.push({
                        name: "buying_for",
                        value: request_body.buying_for
                    },
                        {
                            name: "delivery_date",
                            value: request_body?.send_delivery_date
                        })
                    if (request_body?.buying_for === 'someone_else') {
                        additional_details.push({
                            name: "giftee_email",
                            value: request_body.gift_someone_email
                        })
                        // shopify_order_body.customer = {
                        //     email: request_body.gift_someone_email,
                        // };
                        shopify_order_body.shipping_address = {
                            email: request_body.gift_someone_email,
                        }
                        shipping_address = {
                            email: request_body.gift_someone_email,
                        }
                    }

                    let billing_detail = JSON.parse(request_body.billing_detail);
                    billing_address = {
                        first_name: billing_detail.billing_first_name,
                        last_name: billing_detail.billing_last_name,
                        address1: billing_detail.billing_address,
                        city: billing_detail.billing_city,
                        zip: billing_detail.billing_zip_code,
                        country: billing_detail.billing_country,
                        state: billing_detail.billing_state,
                    }
                    shopify_order_body.billing_address = billing_address

                    if (request_body?.messeage_txt) {
                        additional_details.push({
                            name: "greeting_message",
                            value: request_body?.messeage_txt
                        })
                    }

                    if (request_body?.delivery_type && request_body?.delivery_type === 'future_date') {
                        note = `Future Delivery at ${request_body?.send_delivery_date}`
                        delivery_type = 'future'
                        let delivery_date_tags = {
                            name: "delivery_type",
                            value: 'Future'
                        }
                        additional_details.push(delivery_date_tags)
                    } else {
                        note = `Immediate Delivery at ${request_body?.send_delivery_date}`
                        let delivery_date_tags = {
                            name: "delivery_type",
                            value: 'Immediately'
                        }
                        additional_details.push(delivery_date_tags)
                    }
                    shopify_order_body.note = note
                    shopify_order_body.note_attributes = additional_details
                }


                let discount_codes = [];
                let apply_discount = JSON.parse(request_body?.apply_discount);
                if (apply_discount) {
                    if (apply_discount?.shopify_discount_type == "buy_x_get_y") {
                        discount_codes.push({
                            type: "buy_x_get_y",
                            code: apply_discount?.discount_title,
                            amount: apply_discount?.shopify_discount_amount,
                        })
                    }

                    if (apply_discount?.shopify_discount_type == "percentage") {
                        discount_codes.push({
                            type: "percentage",
                            code: apply_discount?.discount_title,
                            amount: apply_discount?.shopify_discount_amount,
                        });
                    }

                    if (apply_discount?.shopify_discount_type == "fixed_amount") {
                        discount_codes.push({
                            type: "fixed_amount",
                            code: apply_discount?.discount_title,
                            amount: apply_discount?.shopify_discount_amount,
                        });
                    }

                    if (apply_discount?.shopify_discount_type == "free_shipping") {
                        discount_codes.push({
                            type: "shipping",
                            code: apply_discount?.discount_title,
                            amount: apply_discount?.shopify_discount_amount,
                        })
                    }
                    shopify_order_body.discount_codes = discount_codes;
                }


                let findCustomer = await detectCustomer(store_detail);
                if (findCustomer?.customers.length > 0) {
                    findCustomer.customers.forEach((element) => {
                        if (element?.email !== null) {
                            if (element?.email.includes(request_body.email)) {
                                // shopify_order_body = {
                                //     line_items: items,
                                //     shipping_address: shipping_address,
                                //     customer: { id: element.id },
                                //     shipping_lines: shipping_lines,
                                //     transactions: transactions,
                                // };
                                shopify_order_body.line_items = items
                                shopify_order_body.customer = { id: element.id }
                                shopify_order_body.transactions = transactions

                                if (request_body.product_type === 'physical') {
                                    shopify_order_body.shipping_address = shipping_address;
                                    shopify_order_body.shipping_lines = shipping_lines;
                                }


                                if (request_body.billing_status == "true") {
                                    shopify_order_body.billing_address = billing_address;
                                }

                                if (apply_discount?.discount_title && apply_discount?.discount_amount > 0) {
                                    shopify_order_body.discount_codes = discount_codes;
                                }
                            }
                        }
                    });
                }
                if (request_body.phone) {
                    shopify_order_body.phone = request_body.phone;
                }
                console.log("StripePaymentSuccess shopify_order_body -------", shopify_order_body);

                let shopify_order_detail = {
                    json: true,
                    method: "POST",
                    uri: `https://${store_detail.store_name}.myshopify.com/admin/api/2023-01/orders.json`,
                    body: { order: shopify_order_body },
                    headers: {
                        "Content-Type": "application/json",
                        "X-Shopify-Access-Token": store_detail.store_token,
                    },
                };

                let shopify_order;
                await request(shopify_order_detail).then(async (response) => {
                    shopify_order = response;
                });
                //////////////////////////// Shopify Order Created End

                ////////////////////////////// Update Checkout Details In Database Start
                let store_checkout = await models.Checkouts.findOne({
                    where: {
                        checkout_uuid: temp_checkout.checkout_id
                    }
                });
                store_checkout.is_purchase = true;
                store_checkout.customer_id = customer_detail?.id;
                store_checkout.subtotal = request_body?.subtotal;
                store_checkout.price = request_body?.price;

                if (request_body?.shipping_rate_id) {
                    store_checkout.shipping_rate_id = request_body?.shipping_rate_id;
                    store_checkout.shipping_rate_amount = request_body?.shipping_rate_amount;
                }

                if (request_body?.tax_rate_id) {
                    store_checkout.tax_rate_id = request_body?.tax_rate_id;
                    store_checkout.tax_rate_amount = request_body?.tax_rate_amount;
                    store_checkout.tax_rate_percentage = request_body?.tax_rate_percentage;
                }

                if (apply_discount.discount_amount !== 0 || apply_discount.discount_amount !== null) {
                    store_checkout.discount_source = apply_discount?.discount_source;
                    store_checkout.discount_id = apply_discount?.discount_id;
                    store_checkout.discount_title = apply_discount?.discount_title;
                    store_checkout.discount_amount = apply_discount?.discount_amount;
                    store_checkout.discount_type = apply_discount?.discount_type;
                }

                store_checkout.save();
                ////////////////////////////// Update Checkout Details In Database End

                //////////////////////////////Update Cart Performance 
                if (request_body?.cart_performance_uuid) {
                    let cart_performance_Id = request_body.cart_performance_uuid[`${store_checkout?.checkout_uuid}cart_performance`]
                    let cart_performance = await models.CartPerformance.findOne({
                        where: {
                            store_id: store_checkout?.shop_id,
                            checkout_id: store_checkout?.id,
                            cart_performance_uuid: cart_performance_Id
                        },
                    })
                    if (cart_performance) {
                        cart_performance.customer_id = customer_detail?.id;
                        cart_performance.purchased_amount = request_body?.price;
                        cart_performance.purchased_time = cart_performance?.purchased_time + 1;
                        cart_performance.save();
                    }
                }

                ////////////////////////////// Update Automatic Discount Count Use In Database
                if (apply_discount?.discount_id) {
                    let automatic_discount = await models.AutomaticDiscounts.findOne({
                        where: {
                            id: apply_discount?.discount_id
                        }
                    });
                    if (automatic_discount) {
                        automatic_discount.total_discount_usage = parseInt(automatic_discount.total_discount_usage) + 1;
                        automatic_discount.save();
                    }
                }

                ////////////////////////////// Create Order In Database Start
                let order_detail = {
                    checkout_id: store_checkout?.id,
                    shop_id: store_checkout?.shop_id,
                    customer_id: customer_detail?.id,
                    shopify_order_id: shopify_order?.order?.id,

                    first_name: request_body?.first_name,
                    last_name: request_body?.last_name,
                    email: request_body?.email,
                    phone: request_body?.phone,
                    address: request_body?.address,
                    city: request_body?.city,
                    state: request_body?.state,
                    zipcode: request_body?.zipcode,
                    country: request_body?.country,

                    payment_method: "Stripe",
                    payment_id: temp_checkout?.payment_id,
                    payment_response: temp_checkout?.payment_response,

                    is_purchase: true,
                    order_type: "order",
                    product_type: request_body.product_type
                };

                if (request_body.billing_status == "true") {
                    let billing_detail = JSON.parse(request_body.billing_detail);
                    order_detail.billing_status = true;
                    order_detail.billing_first_name = billing_detail?.billing_first_name;
                    order_detail.billing_last_name = billing_detail?.billing_last_name;
                    order_detail.billing_address = billing_detail?.billing_address;
                    order_detail.billing_city = billing_detail?.billing_city;
                    order_detail.billing_state = billing_detail?.billing_state;
                    order_detail.billing_country = billing_detail?.billing_country;
                    order_detail.billing_zipcode = billing_detail?.billing_zip_code;
                }

                if (request_body.product_type === 'digital') {
                    order_detail.buying_for = request_body.buying_for
                    order_detail.giftee_email = request_body.gift_someone_email
                    order_detail.delivery_type = request_body.delivery_type
                    order_detail.delivery_date = request_body.send_delivery_date
                    order_detail.messeage_txt = request_body.messeage_txt
                }

                let order_response = await models.Orders.create(order_detail);

                ////////////////////////////// Create Order In Database End


                /////////////////// Update tag in Shopify Order

                let orderdate = moment().format("DDMMYYYY")
                let shopify_tags = `checkout_master_${order_response.id}_${orderdate}`

                if (request_body.product_type === 'digital') {
                    shopify_tags = `checkout_master_${order_response.id}_${orderdate},checkout_master_${delivery_type}_delivery`
                }

                let shopify_order_update = {
                    json: true,
                    method: "PUT",
                    uri: `https://${store_detail.store_name}.myshopify.com/admin/api/2023-01/orders/${shopify_order?.order?.id}.json`,
                    body: {
                        order: {
                            'id': shopify_order?.order?.id,
                            tags: shopify_tags
                        }
                    },
                    headers: {
                        "Content-Type": "application/json",
                        "X-Shopify-Access-Token": store_detail.store_token,
                    },
                };

                await request(shopify_order_update).then(async (response) => {
                    shopify_order = response;
                });

                // Delete Temp Checkout data
                await models.TempCheckout.destroy({
                    where: {
                        id: temp_checkout?.id
                    }
                });

                await models.AbandonedCheckouts.destroy({
                    where: {
                        cart_token: store_checkout?.cart_token,
                        checkout_id: store_checkout?.id,
                    }
                });

                resolve({
                    status: true,
                    data: order_response,
                    temp_checkout: temp_checkout,
                    message: "Order Created Successfully",
                });
            } else {
                resolve({
                    status: true,
                    message: "temp_checkout not Exist",
                });
            }
        } catch (error) {
            console.error("StripePaymentSuccess error -----------------", error);
            reject({
                status: false,
                message: error?.message || "Something went wrong. Please try again.",
            });
        }
    });
};

module.exports.StripeUpsellChargesCreate = async (request_body, parent_order_detail, callback) => {
    return new Promise(async (resolve, reject) => {
        try {
            console.log("############################################################");
            console.log("StripeUpsellChargesCreate request_body--------", request_body);

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

            /////////////////////////////////////////// Initialize Stipe
            const stripe = require("stripe")(payment_method.secret);

            /////////////////////////////////////////// Get Product varient, price from request
            let upsell_product_purchase = JSON.parse(request_body?.upsell_product_purchase);

            let net_price = 0;
            let shopify_line_items = [];
            for (let upsell_product of upsell_product_purchase) {
                let product_variant = upsell_product?.product_variant;

                let price = parseFloat(upsell_product?.product_price) * parseFloat(upsell_product?.purchase_quantity);
                net_price = parseFloat(net_price) + parseFloat(price);

                shopify_line_items.push({
                    variant_id: product_variant?.id,
                    price: upsell_product?.product_price,
                    quantity: upsell_product?.purchase_quantity,
                });
            }

            /////////////////////////////////////////// Make a Stripe Charge

            let stripecharge_option = {
                amount: Math.floor(net_price) * 100,
                currency: store_detail?.store_currency,
                customer: parent_order_detail?.payment_response?.customer,
            };

            if (payment_method?.soft_descriptor) {
                stripecharge_option.description = payment_method?.soft_descriptor
            }
            console.log("StripeUpsellChargesCreate stripecharge_option---------", stripecharge_option);

            let stripe_charge_upsell = await stripe.charges.create(stripecharge_option);

            /////////////////////////////////////////// Shopify Order Created Start
            /*** Shopify Add Customer Detail ***/
            let customer_detail = {
                email: parent_order_detail.email,
            };

            /*** Shopify Add Shipping Address ***/
            let shipping_address = {};

            /*** Shopify Add Shipping Address ***/
            let transactions = [{
                kind: "capture",
                status: "success",
                gateway: "manual",
                amount: net_price
            }];

            let shopify_order = {
                customer: customer_detail,
                line_items: shopify_line_items,
                // shipping_address: shipping_address,
                transactions: transactions
            }

            /*** Shopify Add Shipping Address ***/
            if (parent_order_detail?.address) {

                shopify_order.customer = {
                    email: parent_order_detail.email,
                    first_name: parent_order_detail.first_name,
                    last_name: parent_order_detail.last_name,
                };

                shopify_order.shipping_address = {
                    email: parent_order_detail?.email,
                    first_name: parent_order_detail?.first_name,
                    last_name: parent_order_detail?.last_name,
                    address1: parent_order_detail?.address,
                    phone: parent_order_detail?.phone,
                    city: parent_order_detail?.city,
                    zip: parent_order_detail?.zipCode,
                    country: parent_order_detail?.country,
                    state: parent_order_detail?.state,
                };

                let billing_address = {};
                if (parent_order_detail.billing_status == "true") {
                    billing_address = {
                        first_name: parent_order_detail.billing_first_name,
                        last_name: parent_order_detail.billing_last_name,
                        address1: parent_order_detail.billing_address,
                        city: parent_order_detail.billing_city,
                        zip: parent_order_detail.billing_zip_code,
                        country: parent_order_detail.billing_country,
                        state: parent_order_detail.billing_state,
                    };
                    shopify_order.billing_address = billing_address;
                } else {
                    billing_address = {
                        first_name: parent_order_detail.first_name,
                        last_name: parent_order_detail.last_name,
                        address1: parent_order_detail.address,
                        city: parent_order_detail.city,
                        zip: parent_order_detail.zipcode,
                        country: parent_order_detail.country,
                        state: parent_order_detail.state,
                    };
                    shopify_order.billing_address = billing_address;
                }
            } else {
                let additional_details = []
                additional_details.push({
                    name: "buying_for",
                    value: 'myself'
                })
                let send_delivery_date = `${moment().format('YYYY-MM-DD')} Time:${moment().format('HH:mm')} UTC`
                let note = `Immediate Delivery at ${send_delivery_date}`

                additional_details.push({
                    name: "delivery_type",
                    value: 'Immediately'
                }, {
                    name: "delivery_date",
                    value: send_delivery_date
                })
                shopify_order.note = note
                shopify_order.note_attributes = additional_details
                shopify_order.billing_address = {
                    first_name: parent_order_detail.first_name,
                    last_name: parent_order_detail.last_name,
                    address1: parent_order_detail.address,
                    city: parent_order_detail.city,
                    zip: parent_order_detail.zipcode,
                    country: parent_order_detail.country,
                    state: parent_order_detail.state,
                }
            }


            let find_customers = await detectCustomer(store_detail);
            if (find_customers?.customers.length > 0) {
                find_customers.customers.forEach((customer) => {
                    if (customer?.email !== null) {
                        if (customer?.email.includes(parent_order_detail.email)) {
                            shopify_order.customer = {
                                id: customer.id
                            };
                        }
                    }
                })
            }

            if (request_body.phone) {
                shopify_order.phone = parent_order_detail.phone;
            }

            let shopify_order_detail = {
                json: true,
                method: "POST",
                uri: `https://${store_detail.store_name}.myshopify.com/admin/api/2023-01/orders.json`,
                body: { order: shopify_order },
                headers: {
                    "Content-Type": "application/json",
                    "X-Shopify-Access-Token": store_detail.store_token,
                },
            };
            let shopify_order_response;
            await request(shopify_order_detail).then(async (response) => {
                shopify_order_response = response;
            });
            console.log("StripeUpsellChargesCreate shopify_order_response--------", shopify_order_response);

            /////////////////////////////////////////// Create Upsell Checkout And cart
            let checkout_detail = await models.Checkouts.create({
                shop_id: store_detail?.id
            });

            let cart_items = [];

            let upsell_revenue = 0;
            let purchased_count = 0;
            for (let upsell_product of upsell_product_purchase) {

                let product_variant = upsell_product?.product_variant;

                let price = parseFloat(upsell_product?.product_price) * parseFloat(upsell_product?.purchase_quantity);

                cart_items.push({
                    store_id: parent_order_detail?.shop_id,
                    checkout_id: checkout_detail?.id,
                    product_id: upsell_product?.product_id,
                    variant_id: product_variant?.id,
                    title: upsell_product?.product_title,
                    variant_title: product_variant?.title,
                    price: upsell_product?.product_price,
                    quantity: upsell_product?.purchase_quantity,
                    image: upsell_product?.product_image,
                    product_weight: upsell_product?.grams,
                });

                purchased_count++;
                upsell_revenue = parseFloat(upsell_revenue) + parseFloat(price);
            }

            checkout_detail.customer_id = parent_order_detail?.customer_id;
            checkout_detail.price = net_price.toFixed(2);
            checkout_detail.save();

            await models.Cart.bulkCreate(cart_items);

            ////////////////////////////// Create Order In Database Start
            let order_detail = {
                checkout_id: checkout_detail?.id,
                shop_id: parent_order_detail?.shop_id,
                customer_id: parent_order_detail?.customer_id,
                shopify_order_id: shopify_order_response?.order?.id,

                parent_order_id: parent_order_detail?.id,
                parent_order_uuid: parent_order_detail?.order_uuid,

                first_name: parent_order_detail?.first_name,
                last_name: parent_order_detail?.last_name,
                email: parent_order_detail?.email,
                phone: parent_order_detail?.phone,
                address: parent_order_detail?.address,
                city: parent_order_detail?.city,
                state: parent_order_detail?.state,
                zipcode: parent_order_detail?.zipcode,
                country: parent_order_detail?.country,

                payment_method: "Stripe",
                payment_id: stripe_charge_upsell?.id,
                payment_response: stripe_charge_upsell,

                is_purchase: true,
                order_type: "order",
                product_type: parent_order_detail.product_type
            };

            if (parent_order_detail?.billing_status == true) {
                order_detail.billing_status = true;
                order_detail.billing_first_name = parent_order_detail?.billing_first_name;
                order_detail.billing_last_name = parent_order_detail?.billing_last_name;
                order_detail.billing_address = parent_order_detail?.billing_address;
                order_detail.billing_city = parent_order_detail?.billing_city;
                order_detail.billing_state = parent_order_detail?.billing_state;
                order_detail.billing_country = parent_order_detail?.billing_country;
                order_detail.billing_zipcode = parent_order_detail?.billing_zip_code;
            }

            if (parent_order_detail.product_type === 'digital') {
                order_detail.buying_for = parent_order_detail.buying_for
                order_detail.giftee_email = parent_order_detail.gift_someone_email
                order_detail.delivery_type = parent_order_detail.delivery_type
                order_detail.delivery_date = parent_order_detail.delivery_date
                order_detail.messeage_txt = parent_order_detail.messeage_txt
            }

            let order_response = await models.Orders.create(order_detail);

            /////////////////// Update tag in Shopify Order
            let orderdate = moment().format("DDMMYYYY")
            let shopify_tags = `checkout_master_upsell_${order_response.id}_${orderdate}`

            let delivery_type = 'immediate'
            if (!parent_order_detail?.address) {
                shopify_tags = `checkout_master_upsell_${order_response.id}_${orderdate},checkout_master_${delivery_type}_delivery`
            }

            console.log('shopify_tags', shopify_tags)


            let shopify_order_update = {
                json: true,
                method: "PUT",
                uri: `https://${store_detail.store_name}.myshopify.com/admin/api/2023-01/orders/${shopify_order_response?.order?.id}.json`,
                body: {
                    order: {
                        'id': shopify_order_response?.order?.id,
                        tags: shopify_tags
                    }
                },
                headers: {
                    "Content-Type": "application/json",
                    "X-Shopify-Access-Token": store_detail.store_token,
                },
            };

            await request(shopify_order_update).then(async (response) => {
                shopify_order = response;
            });

            ////////////////////////////// Update Upsell Performance Records
            await models.UpsellPerformance.update({
                purchased_count: 1,
                upsell_revenue: upsell_revenue,
                order_id: order_response?.id
            }, {
                where: {
                    customer_id: parent_order_detail?.customer_id,
                    store_id: request_body?.store_id,
                    upsell_id: request_body?.upsell_id,
                    parent_order_id: parent_order_detail?.id
                }
            });

            callback(null, {
                status: true,
                data: order_response,
                message: "Payment received successfully for upsell purchase",
            });
        } catch (error) {
            console.error("StripeUpsellChargesCreate error -----------------", error);
            callback({
                status: false,
                message: error?.message ? error.message : "Something went wrong. Please try again.",
            }, null);
        }
    });
};

module.exports.StripeShopifyRefund = async (request_body, order_detail) => {
    return new Promise(async (resolve, reject) => {
        try {

            /////////////////////////////////////////// Retrieve a specific order Start
            let shopify_order = await ShopifyReceiveSingleOrder({
                shopify_order_id: request_body?.id,
                store_id: order_detail.shop_id,
            });

            let latest_refund = shopify_order?.order?.refunds[shopify_order?.order?.refunds.length - 1];
            let latest_transaction = latest_refund?.transactions[latest_refund?.transactions.length - 1];
            let refund_amount = Math.abs(latest_transaction?.amount);
            console.log("StripeShopifyRefund refund_amount --------", refund_amount);
            /////////////////////////////////////////// Retrieve a specific order End

            /////////////////////////////////////////// Get Payment method details from the database
            let payment_method = await models.PaymentMethods.findOne({
                where: {
                    method_name: "Stripe",
                    store_id: order_detail.shop_id,
                },
            });

            /////////////////////////////////////////// Initialize Stipe
            const stripe = require("stripe")(payment_method.secret);
            const refund_response = await stripe.refunds.create({
                charge: order_detail?.payment_response?.id,
                amount: parseFloat(refund_amount).toFixed(2) * 100,
            });

            resolve({
                status: true,
                message: "Shopify refunded successfully",
            });
        } catch (error) {
            console.error("StripeShopifyRefund error --------", error);
            reject(error);
        }
    });
}

/////////////////////////////////////////// Inventory Update ///////////////////////////////////////////
const inventoryUpdate = (findStore, productData) => {
    productData.carts.forEach(async (element) => {
        var getVariantDetail = {
            json: true,
            method: "GET",
            uri: `https://${findStore.store_name}.myshopify.com/admin/api/2023-01/variants/${element.variant_id}.json`,
            headers: {
                "X-Shopify-Access-Token": findStore.store_token,
                "Content-Type": "application/json",
            },
            json: true,
        };
        let get_inventory_item_id = await request(getVariantDetail)
            .then(async (variant) => {
                //   console.log("getVariantDetail data", variant);
                return variant;
            })
            .catch(function (error) {
                console.error("StripePaymentHelper inventoryUpdate getVariantDetail error -----------------", error);
            });

        if (get_inventory_item_id) {
            var getInventory = {
                json: true,
                method: "GET",
                uri: `https://${findStore.store_name}.myshopify.com/admin/api/2023-01/inventory_levels.json?inventory_item_ids=${get_inventory_item_id.variant.inventory_item_id}`,
                headers: {
                    "X-Shopify-Access-Token": findStore.store_token,
                    "Content-Type": "application/json",
                },
                json: true,
            };
            let inventoryResult = await request(getInventory)
                .then(async (inventoryResult) => {
                    // console.log("inventoryResult ------------", inventoryResult);
                    return inventoryResult;
                })
                .catch(function (error) {
                    console.error("StripePaymentHelper inventoryUpdate error -----------------", error);
                });

            if (inventoryResult) {
                var available = inventoryResult.inventory_levels[0].available - element.quantity;
                var setInventory = {
                    json: true,
                    method: "POST",
                    uri: `https://${findStore.store_name}.myshopify.com/admin/api/2023-01/inventory_levels/set.json`,
                    body: {
                        location_id: inventoryResult.inventory_levels[0].location_id,
                        inventory_item_id: inventoryResult.inventory_levels[0].inventory_item_id,
                        available: available,
                    },
                    headers: {
                        "X-Shopify-Access-Token": findStore.store_token,
                        "Content-Type": "application/json",
                    },
                    json: true,
                };
                let setInventoryResult = await request(setInventory)
                    .then(async (setInventoryResult) => {
                        //   console.log("setInventoryResult ------------", setInventoryResult);
                        return inventoryResult;
                    })
                    .catch(function (error) {
                        console.error("StripePaymentHelper inventoryUpdate setInventoryResult error -----------------", error);
                    });
            }
        }
    });
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
    return getExistCustomers;
};