const paypal = require("paypal-rest-sdk");
const request = require("request-promise");

const models = require("../../src/Services/models");

module.exports.CheckPayPalKey = async (request_parameters) => {
    const { user_id, publishable_key, secret } = request_parameters;

    return new Promise((resolve, reject) => {
        try {
            request.post(
                {
                    uri: "https://api.sandbox.paypal.com/v1/oauth2/token",
                    headers: {
                        Accept: "application/json",
                        "Accept-Language": "en_US",
                        "content-type": "application/x-www-form-urlencoded",
                    },
                    auth: {
                        user: publishable_key,
                        pass: secret,
                    },
                    form: {
                        grant_type: "client_credentials",
                    },
                },
                function (error, response, body) {
                    const data = JSON.parse(body);
                    if (data.error == "invalid_client") {
                        reject(data.error_description);
                    } else {
                        resolve(data.access_token);
                    }
                }
            );
        } catch (e) {
            reject(e);
        }
    });
};

module.exports.PaypalPaymentCreate = async (request_body, callback) => {
    return new Promise(async (resolve, reject) => {
        try {

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
                payment_method: "PayPal",
            });

            /// Get Payment method details from the database
            let payment_method = await models.PaymentMethods.findOne({
                where: {
                    method_name: "PayPal",
                    store_id: request_body.store_id,
                },
            });

            console.log("PaypalPaymentCreate process.env.PAYPAL_MODE------",process.env.PAYPAL_MODE);
            paypal.configure({
                mode: process.env.PAYPAL_MODE,
                headers: {
                    Authorization: `Bearer ${payment_method?.access_token}`,
                },
            });

            let payment_option = {
                intent: "sale",
                payer: {
                    payment_method: "paypal",
                },
                redirect_urls: {
                    return_url: `${process.env.APP_URL}/paypal-success/${request_body?.store_id}/${request_body?.checkout_id}`,
                    cancel_url: `${process.env.APP_URL}/paypal-cancel/${request_body?.store_id}/${request_body?.checkout_id}`,
                },
                transactions: [
                    {
                        amount: {
                            total: request_body?.price,
                            currency: request_body?.currency,
                        },
                        description: "Purcahsed from the Store",
                    },
                ],
            };
            console.log("PaypalPaymentCreate payment_option--------", payment_option);

            let paypal_payment_link;
            await paypal.payment.create(payment_option, async (error, payment) => {
                if (error) {
                    console.error("PaypalPaymentCreate error -------------", error);
                } else {
                    console.log("PaypalPaymentCreate payment -------------", payment);
                    for (var i = 0; i < payment.links.length; i++) {
                        if (payment.links[i].rel === "approval_url") {
                            paypal_payment_link = payment.links[i].href;
                        }
                    }
                }
            });
            console.log("PaypalPaymentCreate paypal_payment_link--------", paypal_payment_link);

            callback(null, {
                status: true,
                paypal_payment_link: paypal_payment_link,
                message: "Paypal Payment 3DS Pending!!",
            });
        } catch (error) {
            console.error("PaypalPaymentCreate error -----------------", error?.message);
            callback({
                status: false,
                message: error?.message || "Something went wrong. Please try again.",
            }, null);
        }
    })
};
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
                console.error("PaypalPaymentHelper getVariantDetail error -----------------", error);
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
                    console.error("PaypalPaymentHelper inventoryResult error -----------------", error);
                });
            if (inventoryResult) {
                var available =
                    inventoryResult.inventory_levels[0].available - element.quantity;
                var setInventory = {
                    json: true,
                    method: "POST",
                    uri: `https://${findStore.store_name}.myshopify.com/admin/api/2023-01/inventory_levels/set.json`,
                    body: {
                        location_id: inventoryResult.inventory_levels[0].location_id,
                        inventory_item_id:
                            inventoryResult.inventory_levels[0].inventory_item_id,
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
                        console.error("PaypalPaymentHelper setInventoryResult error -----------------", error);
                    });
            }
        }
    })
}
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