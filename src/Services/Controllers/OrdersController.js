const models = require("../models");

module.exports.order_create = async (req, res, next) => {
    try {
        let request_body = req.body;
        
        const status = req.body?.status;
        const card_details = req.body?.card_details;
        const billing_status = req.body?.billing_status;

        const parent_order_id = req.body?.parent_order_id;
        const upsell_checkout_id = req.body?.checkout_id;
        const type = req.body?.type;
        const stripe_token = req.body?.stripe_token;
        const stripe_cardNo = req.body?.stripe_cardNo;
        const card_brand = req.body?.card_brand
        console.log(type,'--------type')

        if (type== "upsell") {
            let order_detail = await models.Orders.findOne({
                where: {
                    order_uuid: parent_order_id
                },
            }).then((response) => {
                return response;
            });

            let upsell_order_details = {
                payment_method: order_detail?.payment_method,
                checkout_id: upsell_checkout_id,
                shop_id: order_detail?.shop_id,

                shopify_order_id: req.body?.shopify_order_id,

                customer_id: order_detail?.customer_id,
                first_name: order_detail?.first_name,
                last_name: order_detail?.last_name,
                email: order_detail?.email,
                address: order_detail?.address,
                city: order_detail?.city,
                state: order_detail?.state,
                zipcode: order_detail?.zipcode,
                country: order_detail?.country,
                is_purchase: order_detail?.is_purchase,
                card_brand: order_detail?.card_brand,
                card_last4: order_detail?.card_last4,
                phone: order_detail?.phone,
                card_token: order_detail?.card_token,
                parent_order_id: order_detail?.id,
                parent_order_uuid: parent_order_id,
                order_type: type,
                payment_id: req.body?.payment_id,
            };

            let order_response = await models.Orders.create(upsell_order_details);
            return res.json({
                status: true,
                data: order_response,
                order_uuid: order_detail.order_uuid,
                message: "Order Create Successfully",
            });
        }
        
        const { shipping_method, checkout_id, phone, store_id, email, first_name, last_name, address, city, state, country, zipCode, payment_method } = JSON.parse(req.body.customer);
        
        const Customer = await models.Customers.findOne({
            where: { email: email },
        });
        if (Customer) {
            let order_details = {
                payment_method: shipping_method.toLowerCase(),
                checkout_id: checkout_id,
                shop_id: store_id,
                customer_id: Customer?.id,
                first_name: first_name,
                last_name: last_name,
                email: email,
                address: address,
                city: city,
                state: state,
                zipcode: zipCode,
                country: country,
                is_purchase: status,
                card_brand: card_brand,
                card_last4: stripe_cardNo,
                phone: phone,
                // expiry_year: exp_year,
                // expiry_month: exp_month,
                card_token: stripe_token,
                order_type: "order",
            };

            if (billing_status == "true") {
                const { billing_first_name, billing_last_name, billing_address, billing_city, billing_state, billing_country, billing_zip_code } = JSON.parse(req.body.billing_details);
                order_details.billing_status = true;
                order_details.billing_first_name = billing_first_name;
                order_details.billing_last_name = billing_last_name;
                order_details.billing_address = billing_address;
                order_details.billing_city = billing_city;
                order_details.billing_state = billing_state;
                order_details.billing_country = billing_country;
                order_details.billing_zipcode = billing_zip_code;
            }

            let order_response = await models.Orders.create(order_details);
            return res.json({
                status: true,
                data: order_response,
                message: "Order Create Successfully",
            });
        } else {
            const create_customer = await models.Customers.create({
                store_id: store_id,
                email: email,
                first_name: first_name,
                last_name: last_name,
                phone: phone,
            });

            if (create_customer) {
                let order_details = {
                    payment_method: shipping_method.toLowerCase(),
                    checkout_id: checkout_id,
                    shop_id: store_id,
                    customer_id: create_customer?.id,
                    first_name: first_name,
                    last_name: last_name,
                    email: email,
                    address: address,
                    city: city,
                    state: state,
                    zipcode: zipCode,
                    country: country,
                    is_purchase: status,
                    card_brand: card_brand,
                    card_last4: stripe_cardNo,
                    phone: phone,
                    // expiry_year: exp_year,
                    // expiry_month: exp_month,
                    card_token: stripe_token,
                    order_type: "Order",
                };
                if (billing_status == "true") {
                    console.log(req.body.billing_details,'------------req.body.billing_details')
                    const { billing_first_name, billing_last_name, billing_address, billing_city, billing_state, billing_country, billing_zip_code } = JSON.parse(req.body.billing_details);
                    order_details.billing_status = true;
                    order_details.billing_first_name = billing_first_name;
                    order_details.billing_last_name = billing_last_name;
                    order_details.billing_address = billing_address;
                    order_details.billing_city = billing_city;
                    order_details.billing_state = billing_state;
                    order_details.billing_country = billing_country;
                    order_details.billing_zipcode = billing_zip_code;
                }
                let order_response = await models.Orders.create(order_details);
                return res.json({
                    status: true,
                    data: order_response,
                    message: "Order Create Successfully",
                });
            }
        }
    } catch (error) {
        console.log("order_create error ------------", error);
        return res.json({
            error: error,
            status: false,
            message: "Something went wrong. Please try again.",
        });
    }
};