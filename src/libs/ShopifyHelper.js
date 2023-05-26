"use strict";

const request = require("request-promise");

const models = require("../../src/Services/models");

const array_column = (array, column) => {
    return array?.map((item) => item[column]);
};

/*****************************************
 ***** Product - Retrieve a single product
 ***** https://shopify.dev/docs/api/admin-rest/2023-01/resources/product#get-products-product-id
 *****************************************/
module.exports.ShopifyGetProductByID = async (store_detail, product_id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let product_option = {
                json: true,
                method: "GET",
                url: `https://${store_detail.store_name}.myshopify.com/admin/api/2023-01/products/${product_id}.json`,
                headers: {
                    "Content-Type": "application/json",
                    "X-Shopify-Access-Token": `${store_detail.store_token}`,
                },
            };
            await request(product_option, function (error, response) {
                resolve(response?.body?.product);
            });
        } catch (error) {
            console.error("ShopifyGetProductByID error --------", error);
            reject(error);
        }
    });
};

/*****************************************
 ***** Collection - Retrieves a single collection
 ***** https://shopify.dev/docs/api/admin-rest/2023-01/resources/collection#get-collections-collection-id
 *****************************************/
module.exports.ShopifyGetCollectionByID = async (store_detail, collection_id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let collection_option = {
                json: true,
                method: "GET",
                url: `https://${store_detail.store_name}.myshopify.com/admin/api/2023-01/collections/${collection_id}.json`,
                headers: {
                    "Content-Type": "application/json",
                    "X-Shopify-Access-Token": `${store_detail.store_token}`,
                },
            };
            await request(collection_option, function (error, response) {
                resolve(response?.body?.collection);
            });
        } catch (error) {
            console.error("ShopifyGetCollectionByID error --------", error);
            reject(error);
        }
    });
};

/*****************************************
 ***** Collection - Retrieve a list of products belonging to a collection
 ***** https://shopify.dev/docs/api/admin-rest/2023-01/resources/collection#get-collections-collection-id-products
 *****************************************/
module.exports.ShopifyGetCollectionProducts = async (store_detail, collection_id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let product_option = {
                json: true,
                method: "GET",
                url: `https://${store_detail.store_name}.myshopify.com/admin/api/2022-10/collections/${collection_id}/products.json`,
                headers: {
                    "Content-Type": "application/json",
                    "X-Shopify-Access-Token": `${store_detail.store_token}`,
                },
            };
            await request(product_option, function (error, response) {
                let collection_products = response?.body?.products;
                resolve(collection_products);
            });
        } catch (error) {
            console.error("ShopifyGetCollectionProducts error --------", error);
            reject(error);
        }
    });
};

module.exports.ShopifyGetDiscountPriceRule = async (store_detail, discount_code, callback) => {
    return new Promise(async (resolve, reject) => {
        try {
            let shopify_discount;
            let ecommerce_discount;

            let discount_option = {
                json: true,
                method: "GET",
                url: `https://${store_detail.store_name}.myshopify.com/admin/api/2022-10/discount_codes/lookup.json?code=${discount_code}`,
                headers: {
                    "Content-Type": "application/json",
                    "X-Shopify-Access-Token": `${store_detail.store_token}`,
                },
            };
            await request(discount_option, function (error, response) {
                shopify_discount = response?.body?.discount_code;
            });

            if (shopify_discount) {
                let price_rule_option = {
                    json: true,
                    method: "GET",
                    url: `https://${store_detail.store_name}.myshopify.com/admin/api/2022-10/price_rules/${shopify_discount?.price_rule_id}.json`,
                    headers: {
                        "Content-Type": "application/json",
                        "X-Shopify-Access-Token": `${store_detail.store_token}`,
                    },
                };
                await request(price_rule_option, function (error, response) {
                    ecommerce_discount = response?.body?.price_rule;
                });
            }

            callback(null, {
                status: true,
                ecommerce_discount: ecommerce_discount,
                message: "Discount found successfully",
            });
        } catch (error) {
            console.error("ShopifyGetDiscountPriceRule error --------", error.message);
            // resolve(error);
            callback(null, {
                status: false,
                message: "Make sure that the code you have applied is correct, not used before or expired",
            });
        }
    });
};

/*****************************************
 ***** Retrieve a specific order
 ***** https://shopify.dev/docs/api/admin-rest/2022-10/resources/order#get-orders-order-id

 ````````````````
let shopify_order = await ShopifyReceiveSingleOrder({
    shopify_order_id: request_body?.id,
    store_id: order_detail.shop_id,
});
````````````````

*****************************************/
module.exports.ShopifyReceiveSingleOrder = async (request_body, callback) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Get Store Detail
            let store_detail = await models.Stores.findOne({
                where: {
                    id: request_body?.store_id,
                },
            });

            let singleorder_options = {
                json: true,
                method: "GET",
                url: `https://${store_detail?.store_name}.myshopify.com/admin/api/2022-10/orders/${request_body?.shopify_order_id}.json`,
                headers: {
                    "X-Shopify-Access-Token": `${store_detail?.store_token}`,
                },
            };
            let webhook_response;
            await request(singleorder_options).then(async function (response) {
                webhook_response = response;
            });

            resolve(webhook_response);
        } catch (error) {
            console.error("ShopifyHelper ShopifyReceiveSingleOrder error --------", error);
            reject(error);
        }
    });
};

/*****************************************
 ***** Create a new Webhook
 ***** https://shopify.dev/docs/api/admin-rest/2023-01/resources/webhook#post-webhooks

 ````````````````
let webhook_response = await ShopifyRetrievedWebhooks({
    store_domain: request_body?.store_domain,
    access_token: request_body?.access_token
});
````````````````

*****************************************/
module.exports.ShopifyRetrievedWebhooks = async (request_body, callback) => {
    console.log("ShopifyRetrievedWebhooks store_domain---------", request_body?.store_domain);
    console.log("ShopifyRetrievedWebhooks access_token---------", request_body?.access_token);

    return new Promise(async (resolve, reject) => {
        try {
            let webhook_details = await RetrieveWebhookLists(request_body);

            let webhook_response = [];
            if (webhook_details.status) {

                //////////////////////////////////// Delete All Existing Webhooks
                if (webhook_details?.webhook_lists?.webhooks.length > 0) {
                    let webhooks = webhook_details?.webhook_lists?.webhooks;
                    for (let webhook of webhooks) {
                        let webhook_options = {
                            method: "DELETE",
                            url: `https://${request_body?.store_domain}.myshopify.com/admin/api/2023-01/webhooks/${webhook?.id}.json`,
                            headers: {
                                "cache-control": "no-cache",
                                "content-type": "application/json",
                                "X-Shopify-Access-Token": request_body?.access_token,
                            },
                        };
                        await request(webhook_options).then(async function (response) {
                            webhook_response.push(response);
                        });
                    }
                }

                //////////////////////////////////// Order Update Webhook
                let webhook_options = {
                    method: "POST",
                    url: `https://${request_body?.store_domain}.myshopify.com/admin/api/2023-01/webhooks.json`,
                    headers: {
                        "cache-control": "no-cache",
                        "content-type": "application/json",
                        "X-Shopify-Access-Token": request_body?.access_token,
                    },
                    body: JSON.stringify({
                        webhook: {
                            address: `${process.env.APP_URL}/${request_body?.store_id}/shopify-webhook`,
                            topic: "orders/updated",
                            format: "json",
                        },
                    }),
                };
                await request(webhook_options).then(async function (response) {
                    webhook_response.push(response);
                });

                //////////////////////////////////// Cart Create Webhook
                let CARTS_CREATE_options = {
                    method: "POST",
                    url: `https://${request_body?.store_domain}.myshopify.com/admin/api/2023-01/webhooks.json`,
                    headers: {
                        "cache-control": "no-cache",
                        "content-type": "application/json",
                        "X-Shopify-Access-Token": request_body?.access_token,
                    },
                    body: JSON.stringify({
                        webhook: {
                            address: `${process.env.APP_URL}/${request_body?.store_id}/shopify-webhook`,
                            topic: "carts/create",
                            format: "json",
                        },
                    }),
                };
                await request(CARTS_CREATE_options).then(async function (response) {
                    webhook_response.push(response);
                });

                //////////////////////////////////// Cart Update Webhook
                let CARTS_UPDATE_options = {
                    method: "POST",
                    url: `https://${request_body?.store_domain}.myshopify.com/admin/api/2023-01/webhooks.json`,
                    headers: {
                        "cache-control": "no-cache",
                        "content-type": "application/json",
                        "X-Shopify-Access-Token": request_body?.access_token,
                    },
                    body: JSON.stringify({
                        webhook: {
                            address: `${process.env.APP_URL}/${request_body?.store_id}/shopify-webhook`,
                            topic: "carts/update",
                            format: "json",
                        },
                    }),
                };
                await request(CARTS_UPDATE_options).then(async function (response) {
                    webhook_response.push(response);
                });
            }

            resolve(webhook_details);
        } catch (error) {
            console.error("ShopifyHelper ShopifyRetrievedWebhooks error --------", error?.message);
            reject(error);
        }
    });
};

/*****************************************
 ***** Retrieves a list of webhooks
 ***** https://shopify.dev/docs/api/admin-rest/2023-01/resources/webhook#get-webhooks
 *****************************************/
const RetrieveWebhookLists = async (request_body) => {
    return new Promise(async (resolve, reject) => {
        try {
            let webhook_options = {
                json: true,
                method: "GET",
                url: `https://${request_body?.store_domain}.myshopify.com/admin/api/2023-01/webhooks.json`,
                headers: {
                    "cache-control": "no-cache",
                    "content-type": "application/json",
                    "X-Shopify-Access-Token": request_body?.access_token,
                },
            };
            let webhook_lists;
            await request(webhook_options).then(async function (response) {
                webhook_lists = response;
            });

            let webhook_topics = array_column(webhook_lists?.webhooks, "topic");
            webhook_topics = typeof webhook_topics == "undefined" ? [] : webhook_topics;

            resolve({
                status: true,
                webhook_lists: webhook_lists,
                webhook_topics: webhook_topics,
            });
        } catch (error) {
            console.error("ShopifyHelper RetrieveWebhookLists error --------", error?.message);
            resolve({
                status: false,
                message: error?.message ? error.message : "Something went wrong. Please try again.",
            });
        }
    });
};