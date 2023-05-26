const request = require("request-promise");
const moment = require("moment");

const models = require("../../src/Services/models");

module.exports.FreePaymentCreate = async (request_body, callback) => {
    return new Promise(async (resolve, reject) => {
        try {

            let store_detail = await models.Stores.findOne({
                where: {
                    id: request_body.store_id,
                },
            });

            /// Create New customer in the database
            let customer_detail = await models.Customers.findOne({
                where: {
                    email: request_body?.email,
                },
            });
            if (!customer_detail) {
                customer_detail = await models.Customers.create({
                    store_id: request_body?.store_id,
                    email: request_body?.email,
                    first_name: request_body?.first_name,
                    last_name: request_body?.last_name,
                    phone: request_body?.phone,
                });
            }

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
                // first_name: request_body.first_name,
                // last_name: request_body.last_name,
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

            let shopify_order_body = {
                line_items: items,
                customer: customer,
                // shipping_lines: shipping_lines,
                // shipping_address: shipping_address,
            }

            let discount_codes = [];
            let apply_discount = request_body?.apply_discount ? JSON.parse(request_body?.apply_discount) :'';
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
                console.log("StripePaymentSuccess discount_codes -------", discount_codes);
                shopify_order_body.discount_codes = discount_codes;
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
            }else{
                let additional_details = []
                let note = ''
                additional_details .push({
                        name: "buying_for",
                        value: request_body.buying_for
                    },
                    {
                        name: "delivery_date",
                        value: request_body?.send_delivery_date
                    })
                if(request_body?.buying_for === 'someone_else'){
                    additional_details .push({
                        name: "giftee_email",
                        value: request_body.gift_someone_email
                    })
                    // shopify_order_body.customer = {
                    //     email: request_body.gift_someone_email,
                    // };
                    shopify_order_body.shipping_address = {
                        email: request_body.gift_someone_email,
                    }
                    shipping_address= {
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
                };
                shopify_order_body.billing_address = billing_address;


                if(request_body?.messeage_txt){
                    additional_details .push({
                        name: "greeting_message",
                        value: request_body?.messeage_txt
                    })
                }

                if(request_body?.delivery_type && request_body?.delivery_type === 'future_date'){
                    note = `Future Delivery at ${request_body?.send_delivery_date}`
                    delivery_type = 'future'
                    let delivery_date_tags = {
                        name: "delivery_type",
                        value: 'Future'
                    }
                    additional_details.push(delivery_date_tags)
                }else{
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
            if(request_body.phone){
                shopify_order_body.phone = request_body.phone;
            }
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
            // console.log("FreePaymentSuccess order response ------------", response);
            //////////////////////////// Shopify Order Created End //////////////////////////////

            ////////////////////////////// Update Checkout Details In Database Start //////////////////////////////
            let store_checkout = await models.Checkouts.findOne({
                where: {
                    checkout_uuid: request_body?.checkout_id
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

            await models.AbandonedCheckouts.destroy({
                where: {
                    cart_token: store_checkout?.cart_token,
                    checkout_id: store_checkout?.id,
                }
            });


            //////////////////////////////Update Cart Performance //////////////////////////////////////////////
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

                payment_method: "free",
                // payment_id: null,
                // payment_response: null,

                is_purchase: true,
                order_type: "order",
                product_type : request_body.product_type
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

            if (request_body.product_type === 'digital'){
                order_detail.buying_for = request_body.buying_for
                order_detail.giftee_email = request_body.gift_someone_email
                order_detail.delivery_type = request_body.delivery_type
                order_detail.delivery_date = request_body.send_delivery_date
                order_detail.messeage_txt = request_body.messeage_txt
            }

            console.log("FreePaymentSuccess order_detail ------------", order_detail);

            let order_response = await models.Orders.create(order_detail);
            ////////////////////////////// Create Order In Database End //////////////////////////////

            /////////////////// Update tag in Shopify Order
            let orderdate = moment().format("DDMMYYYY")
            let shopify_tags = `checkout_master_${order_response.id}_${orderdate}`

            if (request_body.product_type === 'physical') {
                shopify_tags = `checkout_master_${order_response.id}_${orderdate}`
            }else{
                shopify_tags = `checkout_master_${order_response.id}_${orderdate},checkout_master_${delivery_type}_delivery`
            }

            let shopify_order_update = {
                json: true,
                method: "PUT",
                uri: `https://${store_detail.store_name}.myshopify.com/admin/api/2023-01/orders/${shopify_order?.order?.id}.json`,
                body: { order: {
                        'id': shopify_order?.order?.id,
                        tags: shopify_tags
                } },
                headers: {
                    "Content-Type": "application/json",
                    "X-Shopify-Access-Token": store_detail.store_token,
                },
            };

            await request(shopify_order_update).then(async (response) => {
                shopify_order = response;
            });

            callback(null, {
                status: true,
                data: order_response,
                message: "Order Created Successfully",
            });
        } catch (error) {
            console.error("FreePaymentcreate error -----------------", error);
            callback({
                error: error,
                status: false,
                message: error?.message || "Something went wrong. Please try again.",
            }, null);
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