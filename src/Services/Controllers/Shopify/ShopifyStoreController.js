const fs = require('fs');
const path = require('path');
const axios = require("axios");
const https = require("https");
const request = require("request-promise");

const models = require("../../models");
const SCOPES = require("../../../libs/ShopifyScopesList.json");
const { ShopifyRetrievedWebhooks } = require("../../../libs/ShopifyHelper");

module.exports.StoreConnect = async (req, res, next) => {
    const { auth_user, auth_store } = req;

    if (req.method === "POST") {
        let request_body = req.body;

        if (request_body?.store_name) {
            try {
                let store_name = request_body.store_name.trim();
                let store_url = `https://${store_name}.myshopify.com`;

                if (request_body?.store_id) {
                    console.log("store_url", store_url)
                    let storeValidation = await axios(store_url)
                        .then(async (response) => {
                            return response;
                        })
                        .catch(function (error) {
                            return error;
                        });

                    if (storeValidation?.response?.status == "404") {
                        return res.json({
                            status: false,
                            message: "Shopify store not valid",
                        });
                    }

                    let store_detail = await models.Stores.findOne({
                        where: {
                            id: request_body?.store_id,
                        },
                    });
                    if (store_detail) {
                        store_detail.store_name = store_name;
                        store_detail.save();

                        return res.json({
                            status: true,
                            page: "store_scopes",
                            store_name: store_name,
                            message: "Shopify store Successfully Update",
                        });
                    } else {
                        return res.json({
                            status: false,
                            message: "Bad Request",
                        });
                    }
                } else {
                    let store_detail = await models.Stores.findOne({
                        where: {
                            store_name: store_name,
                        },
                    });
                    if (store_detail) {
                        return res.json({
                            status: false,
                            message: "Shopify store is already connected to an account.",
                        });
                    } else {

                        let storeValidation = await axios(store_url)
                            .then(async (response) => {
                                // console.log("store_response", response)
                                return response;
                            })
                            .catch(function (error) {
                                return {
                                    status: false,
                                    error: error,
                                };
                            });
                        if (storeValidation?.response?.status == "404" || storeValidation?.status === false) {
                            return res.json({
                                status: false,
                                message: "Shopify store not valid",
                            });
                        }

                        let storeData = {
                            user_id: auth_user.id,
                            store_name: store_name,
                        };
                        if (
                            await models.Stores.findOne({
                                where: {
                                    user_id: auth_user.id,
                                    store_name: store_name,
                                },
                            })
                        ) {
                            let updateData = {
                                store_name: store_name,
                            };
                            let storeUpdate = models.Stores.update(updateData, {
                                where: {
                                    store_name: store_name,
                                },
                            });
                            if (storeUpdate) {
                                return res.json({
                                    status: true,
                                    page: "store_scopes",
                                    store_name: store_name,
                                    message: "Shopify store Successfully Update",
                                });
                            }
                        } else {
                            let store_detail = models.Stores.create(storeData);

                            await models.Users.update({
                                store_count: parseFloat(auth_user?.store_count) + 1
                            }, {
                                where: {
                                    id: auth_user?.id,
                                },
                            });

                            if (store_detail) {
                                return res.json({
                                    status: true,
                                    page: "store_scopes",
                                    store_name: store_name,
                                    store_detail: store_detail,
                                    message: "Shopify store Successfully Create",
                                    redirect_url: `${process.env.APP_URL}/${store_detail?.id}/dashboard`,
                                });
                            }
                        }
                    }
                }
            } catch (error) {
                console.error("StoreConnect error -----------------", error);
                return res.json({
                    status: false,
                    page: "store_scopes",
                    message: error?.message ? error.message : "Something went wrong. Please try again.",
                });
            }
        }

        if (request_body?.access_token && request_body?.shopify_api_key && request_body?.shopify_secret_key && request_body?.store_domain) {
            try {
                const existScopes = [];
                const incorrectScopes = [];
                var getApiOrAccessValid = {
                    json: true,
                    method: "GET",
                    uri: `https://${request_body?.shopify_api_key}:${request_body?.access_token}@${request_body?.store_domain}.myshopify.com/admin/api/2023-01/shop.json`,
                    json: true,
                };
                let shopifyValidation = await request(getApiOrAccessValid)
                    .then(async function (response) {
                        return response;
                    })
                    .catch(function (error) {
                        return error;
                    });
                if (!shopifyValidation?.error) {
                    console.log("shopifyValidation-------------shopifyValidation", shopifyValidation.shop.password_enabled);

                    /*****************************************
                     ***** AccessScope
                     ***** https://shopify.dev/docs/api/admin-rest/2023-01/resources/accessscope
                    *****************************************/
                    var getApiScopes = {
                        json: true,
                        method: "GET",
                        uri: `https://${request_body?.store_domain}.myshopify.com/admin/oauth/access_scopes.json`,
                        headers: {
                            "X-Shopify-Access-Token": request_body?.access_token,
                            "Content-Type": "application/json",
                        },
                        json: true,
                    };
                    let shopifyScopes = await request(getApiScopes)
                        .then(async function (response) {
                            return response;
                        })
                        .catch(function (error) {
                            return error;
                        });
                    if (!shopifyScopes?.error) {
                        shopifyScopes.access_scopes.map((element) => {
                            existScopes.push(element.handle);
                        });
                        if (!existScopes.includes(SCOPES.Products.read_products)) {
                            incorrectScopes.push("read_products");
                        }
                        if (!existScopes.includes(SCOPES.Products.write_products)) {
                            incorrectScopes.push("write_products");
                        }
                        if (!existScopes.includes(SCOPES.Customers.read_customers)) {
                            incorrectScopes.push("read_customers");
                        }
                        if (!existScopes.includes(SCOPES.Customers.write_customers)) {
                            incorrectScopes.push("write_customers");
                        }
                        if (!existScopes.includes(SCOPES.Discounts.read_discounts)) {
                            incorrectScopes.push("read_discounts");
                        }
                        if (!existScopes.includes(SCOPES.Discounts.write_discounts)) {
                            incorrectScopes.push("write_discounts");
                        }
                        if (!existScopes.includes(SCOPES.Fulfillment_services.read_fulfillments)) {
                            incorrectScopes.push("read_fulfillments");
                        }
                        if (!existScopes.includes(SCOPES.GDPR_data_requests.read_gdpr_data_request)) {
                            incorrectScopes.push("read_gdpr_data_request");
                        }
                        if (!existScopes.includes(SCOPES.Gift_cards.read_gift_cards)) {
                            incorrectScopes.push("read_gift_cards");
                        }
                        if (!existScopes.includes(SCOPES.Inventory.read_inventory)) {
                            incorrectScopes.push("read_inventory");
                        }
                        if (!existScopes.includes(SCOPES.Inventory.write_inventory)) {
                            incorrectScopes.push("write_inventory");
                        }
                        if (!existScopes.includes(SCOPES.Order_editing.read_order_edits)) {
                            incorrectScopes.push("read_order_edits");
                        }
                        if (!existScopes.includes(SCOPES.Order_editing.write_order_edits)) {
                            incorrectScopes.push("write_order_edits");
                        }
                        if (!existScopes.includes(SCOPES.Orders.read_orders)) {
                            incorrectScopes.push("read_orders");
                        }
                        if (!existScopes.includes(SCOPES.Orders.write_orders)) {
                            incorrectScopes.push("write_orders");
                        }
                        if (!existScopes.includes(SCOPES.Price_rules.read_price_rules)) {
                            incorrectScopes.push("read_price_rules");
                        }
                        if (!existScopes.includes(SCOPES.Price_rules.write_price_rules)) {
                            incorrectScopes.push("write_price_rules");
                        }
                        if (!existScopes.includes(SCOPES.Products_listings.read_product_listings)) {
                            incorrectScopes.push("read_product_listings");
                        }
                        if (!existScopes.includes(SCOPES.Script_tags.read_script_tags)) {
                            incorrectScopes.push("read_script_tags");
                        }
                        if (!existScopes.includes(SCOPES.Script_tags.write_script_tags)) {
                            incorrectScopes.push("write_script_tags");
                        }
                        if (!existScopes.includes(SCOPES.Shipping.read_shipping)) {
                            incorrectScopes.push("read_shipping");
                        }
                        if (!existScopes.includes(SCOPES.Themes.read_themes)) {
                            incorrectScopes.push("read_themes");
                        }
                        if (!existScopes.includes(SCOPES.Themes.write_themes)) {
                            incorrectScopes.push("write_themes");
                        }
                    }

                    if (incorrectScopes.length > 0) {
                        return res.json({
                            status: true,
                            page: "incorrect_scopes",
                            store_name: request_body?.store_domain,
                            api_key: request_body?.shopify_api_key,
                            secret_key: request_body?.shopify_secret_key,
                            password: request_body?.access_token,
                            incorrectScopes: incorrectScopes,
                            message: "Please allow all the permissions listed",
                        });
                    } else {
                        var developmentStore = false;
                        if (process.env.Site_Environmental === "production") {
                            developmentStore = true;
                        }
                        if (developmentStore && shopifyValidation?.shop?.password_enabled) {
                            return res.json({
                                status: false,
                                message: "Before connect, please turn off password protection on your store",
                            });
                        } else {
                            let storeData = {
                                store_status: true,
                                store_token: request_body?.access_token,
                                store_domain: shopifyValidation?.shop?.domain,
                                store_currency: shopifyValidation?.shop?.currency,
                                money_format: shopifyValidation?.shop?.money_format
                            };
                            await models.Stores.update(storeData, {
                                where: {
                                    store_name: request_body?.store_domain,
                                },
                            });

                            let store_detail = await models.Stores.findOne({
                                where: {
                                    user_id: auth_user.id,
                                    store_name: request_body?.store_domain,
                                },
                            });

                            //////////////////////////////////// Shopify Webhook Start
                            if (process.env.Site_Environmental !== "local") {
                                await ShopifyRetrievedWebhooks({
                                    store_id: store_detail?.id,
                                    store_domain: store_detail?.store_name,
                                    access_token: store_detail?.store_token
                                });
                            }
                            //////////////////////////////////// Shopify Webhook End

                            return res.json({
                                status: true,
                                page: "congrats_page",
                                store_name: request_body?.store_domain,
                                api_key: request_body?.shopify_api_key,
                                secret_key: request_body?.shopify_secret_key,
                                password: request_body?.access_token,
                                message: "Store Connected",
                                redirect_url: `${process.env.APP_URL}/${store_detail.id}/dashboard`,
                            });
                        }
                    }
                } else {
                    console.log(shopifyValidation?.error);
                    return res.json({
                        status: false,
                        page: "",
                        message: "Invalid Api Key Or Access Token",
                    });
                }
            } catch (error) {
                console.log("accessTokenResponse error---------------", error);
                return res.json({
                    status: false,
                    page: "store_details",
                    message: error?.message ? error.message : "Something went wrong. Please try again.",
                });
            }
        }
    }

    res.render("backend/ShopifyStore/store-connect", {
        right_sides: [],
        auth_user: auth_user,
        auth_store: auth_store,
    });
};

module.exports.CreateNewStore = async (req, res, next) => {
    const auth_user = req.auth_user;
    let store_id = Buffer.from(req.params.store_id, "base64").toString();
    let create_store = true;
    res.render("backend/ShopifyStore/store-connect", {
        right_sides: [],
        store_id: store_id,
        auth_user: auth_user,
        create_store: create_store,
    });
};

module.exports.ChangeDefaultStore = async (req, res, next) => {
    req.session.store_id = req.body.id;
    req.session.auth_store = req.body;
    req.session.save();

    res.cookie("store_id", req.body.id);

    return res.json({
        status: true,
        message: "created successfully",
        redirect_url: `${process.env.APP_URL}/${req.body.id}/dashboard`,
    });
};

module.exports.manage_store = async (req, res, next) => {
    const { store_id } = req.params;
    const auth_user = req.auth_user;

    let store_details = await models.Stores.findAll({
        where: {
            user_id: auth_user.id,
        },
    }).then((response) => {
        return response;
    });

    res.render("backend/ShopifyStore/manage_store", {
        right_sides: [],
        store_id: store_id,
        auth_user: auth_user,
        store_details: store_details,
    });
};

module.exports.store_delete = async (req, res, next) => {
    const { auth_user, auth_store } = req;

    try {

        let request_body = req.body;
        console.log("store_delete request_body------", request_body);

        await models.Stores.destroy({
            where: {
                id: request_body?.store_id,
            },
        });
        return res.json({
            status: true,
            message: "Store Deleted Successfully",
            redirect_url: `${process.env.APP_URL}/store-connect`,
        });

    } catch (error) {
        console.error("store_delete error------------", error);
        return res.json({
            status: false,
            message: error?.message ? error.message : "Something went wrong. Please try again.",
        });
    }
};

module.exports.Test = async (req, res, next) => {
    fetch("https://testappwithnodejs.myshopify.com/cart.json")
        .then(function (res) {
            console.log("event-----------", res);
        })
        .then(function (event) {
            console.log("event-----------", event);
        });
};

const { PaypalPaymentCreate } = require("../../../libs/PaypalPaymentHelper");
const { StripePaymentIntent, StripeChargesCreate } = require("../../../libs/StripePaymentHelper");
const { ApplePayPaymentCreate } = require("../../../libs/ApplePayPaymentHelper");
const { PayoutMasterPaymentCreate } = require("../../../libs/PayoutPaymentHelper");
const { CheckoutPaymentCreate } = require("../../../libs/CheckoutPaymentHelper");
const { RevolutPaymentCreate, RevolutPaymentSuccess } = require("../../../libs/RevolutPaymentHelper");
const { FreePaymentCreate } = require("../../../libs/FreePaymentHelper");

module.exports.PaymentGateways = async (req, res, next) => {
    let request_body = req.body;
    request_body.sesion = req.session;
    console.log(req.session)

    if (req.session.cart_performance_uuid) {
        request_body.cart_performance_uuid = req.session.cart_performance_uuid
    } else {
        let checkouts = await models.Checkouts.findOne({
            where: {
                checkout_uuid: request_body?.checkout_id
            },
        });
        let cart_performances = await models.CartPerformance.findOne({
            where: {
                checkout_id: checkouts?.id,
                sent_time: 1,
                time_clicked: 1,
            },
            order: [
                ['updated_at', 'DESC']
            ],
        });
        if (cart_performances) {
            request_body.cart_performance_uuid = {
                [`${request_body?.checkout_id}cart_performance`]: cart_performances?.cart_performance_uuid
            };
        }

    }

    // console.log(request_body)

    // return res.json({
    //     status: false,
    //     message: "Something went wrong. Please try again.",
    // });

    try {
        if (request_body?.method === "paypal") {
            await PaypalPaymentCreate(request_body, function (error, response) {
                console.log("PaypalPaymentCreate error-------", error);
                console.log("PaypalPaymentCreate response-------", response);

                if (error) {
                    return res.json(error);
                } else {
                    return res.json(response);
                }
            });
        }

        if (request_body?.method === "stripe") {
            await StripeChargesCreate(request_body, function (error, response) {
                if (error) {
                    return res.json(error);
                } else {
                    return res.json(response);
                }
            });
        }

        if (request_body?.method === "payout_master") {
            await PayoutMasterPaymentCreate(request_body, function (error, response) {
                if (error) {
                    return res.json(error);
                } else {
                    return res.json(response);
                }
            });
        }

        if (request_body?.method === "Checkout.com") {
            await CheckoutPaymentCreate(request_body, function (error, response) {
                if (error) {
                    return res.json(error);
                } else {
                    return res.json(response);
                }
            });
        }

        // Revolut paymane gateway
        if (request_body?.method === "Revolut") {
            await RevolutPaymentCreate(request_body, function (error, response) {
                if (error) {
                    return res.json(error);
                } else {
                    return res.json(response);
                }
            });
        }

        if (request_body?.action === "revolut_success") {
            await RevolutPaymentSuccess(request_body, function (error, response) {
                if (error) {
                    return res.json(error);
                } else {
                    return res.json(response);
                }
            });
        }

        if (request_body?.method === "apple_pay") {
            await ApplePayPaymentCreate(request_body, function (error, response) {
                if (error) {
                    return res.json(error);
                } else {
                    return res.json(response);
                }
            });
        }

        if (request_body?.method == "cash_on_delivery") {
            res.json({
                status: true,
                message: "Payment received successfully",
            });
        }

        if (request_body?.method === "free") {
            await FreePaymentCreate(request_body, function (error, response) {
                if (error) {
                    return res.json(error);
                } else {
                    return res.json(response);
                }
            });
        }

    } catch (error) {
        console.error("PaymentGateways error--------------", error);
        res.json({
            status: false,
            message: error?.message ? error.message : "Something went wrong. Please try again.",
        });
    }
};

module.exports.payment_intent = async (req, res, next) => {
    let request_body = req.body;

    try {
        await StripePaymentIntent(request_body, function (error, response) {
            if (error) {
                return res.json(error);
            } else {
                return res.json(response);
            }
        });
    } catch (error) {
        console.log("payment_intent error----------", error);
    }
}

module.exports.UnPublishStore = async (req, res, next) => {
    const { store_id } = req.params;

    let findStore = await models.Stores.findOne({
        where: {
            id: store_id
        }
    });

    if (findStore) {
        let getTheme = {
            json: true,
            method: "GET",
            uri: `https://${findStore.store_name}.myshopify.com/admin/api/2022-01/themes.json`,
            headers: {
                "X-Shopify-Access-Token": findStore.store_token,
                "Content-Type": "application/json",
            },
        };
        await request(getTheme)
            .then(async function (response) {
                response.themes.forEach(async (element) => {
                    if (element.role.includes("main")) {

                        var theme_liquid = {
                            json: true,
                            method: "GET",
                            uri: `https://${findStore.store_name}.myshopify.com/admin/api/2022-10/themes/${element.id}/assets.json?asset[key]=layout/theme.liquid`,
                            headers: { "X-Shopify-Access-Token": findStore.store_token, "Content-Type": "application/json" },
                        };
                        await request(theme_liquid)
                            .then(async function (theme_response) {



                                let custom_script = `<script src="${process.env.APP_URL}/assets/js/shopify/checkout-integration.js" data-master-x-id="${store_id}"></script>`;
                                let checkScript = theme_response.asset.value.replace(custom_script, "");

                                let custom_script_with_type = `<script type="text/javascript" src="${process.env.APP_URL}/assets/js/shopify/checkout-integration.js" data-master-x-id="${store_id}"></script>`;
                                checkScript = checkScript.replace(custom_script_with_type, "");

                                var putThemeLiquid = {
                                    json: true,
                                    method: "PUT",
                                    uri: `https://${findStore.store_name}.myshopify.com/admin/api/2022-10/themes/${theme_response.asset.theme_id}/assets.json`,
                                    body: {
                                        asset: {
                                            key: "layout/theme.liquid",
                                            value: checkScript,
                                        },
                                    },
                                    headers: { "X-Shopify-Access-Token": findStore.store_token, "Content-Type": "application/json" },
                                };
                                await request(putThemeLiquid)
                                    .then(async (put_theme_response) => {
                                        findStore.customize_checkout_publish = false;
                                        findStore.save();

                                        res.redirect(`/${store_id}/manage-store`);
                                    })
                                    .catch(function (error) {
                                        console.log("putThemeLiquid error ------------", error);
                                    });
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
    }
};

module.exports.applepay_validateSession = async (req, res, next) => {
    let request_body = req.body;

    try {
        let payment_method = await models.PaymentMethods.findOne({
            where: {
                store_id: request_body?.store_id,
                method_name: "Apple pay",
            },
        });

        // let httpsAgent = new https.Agent({
        //     rejectUnauthorized: false,
        //     cert: fs.readFileSync(path.join(appRoot, '/src/applepay/certificate_sandbox.pem')),
        //     key: fs.readFileSync(path.join(appRoot, '/src/applepay/certificate_sandbox.key')),
        // });

        // let response = await axios.post(
        //     appleUrl,
        //     {
        //         merchantIdentifier: 'merchant.com.checkout.applepay',
        //         domainName: 'dev.checkout-master.com',
        //         displayName: 'Checkout Master',
        //     },
        //     {
        //         httpsAgent,
        //     }
        // );

        //////////////////////////////////// use set the certificates for the POST request
        let httpsAgent = new https.Agent({
            rejectUnauthorized: false,
            cert: fs.readFileSync(`${appRoot}/${payment_method?.apple_certificate_pem}`),
            key: fs.readFileSync(`${appRoot}/${payment_method?.apple_certificate_key}`),
        });

        let domain_name = "pay.checkout-master.com";
        if (process.env.Site_Environmental === "development") {
            domain_name = "dev.checkout-master.com";
        }

        let response = await axios.post(
            request_body?.appleUrl,
            {
                merchantIdentifier: payment_method?.apple_merchantIdentifier,
                domainName: domain_name,
                displayName: 'Checkout Master',
            },
            {
                httpsAgent,
            }
        );

        res.send(response.data);
    } catch (error) {
        console.error("applepay_validateSession error--------------", error?.message);
        res.json({
            status: false,
            message: error?.message ? error.message : "Something went wrong. Please try again.",
        });
    }
};