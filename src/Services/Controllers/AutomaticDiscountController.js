"use strict";

const moment = require('moment');
const sequelize = require('sequelize');
const request = require("request-promise");

const Op = sequelize.Op;

const models = require("../models");
const ShopifyHelper = require("../../libs/ShopifyHelper");
const { AutomaticDiscounts, Stores } = require("../models");


const array_column = (array, column) => {
    return array?.map((item) => item[column]);
};

module.exports.discount_listing = async (req, res, next) => {
    const { store_id } = req.params;
    const { auth_user, auth_store } = req;

    if (req.method === "POST") {
        try {
            let request_body = req.body;

            // Get Store Detail
            let store_detail = await Stores.findOne({
                where: {
                    id: request_body?.store_id,
                },
            });

            // Get Automatic Discounts
            let where_filter = {
                store_id: request_body?.store_id
            };

            let query_object = {
                distinct: true,
                where: where_filter,
                order: [["id", "DESC"]],
                offset: request_body.start,
                limit: request_body.length,
            };

            let automatic_discounts = await models.AutomaticDiscounts.findAndCountAll(query_object);

            let client_data = [];
            if (automatic_discounts.rows) {
                for (let automatic_discount of automatic_discounts.rows) {

                    let discount_triggers = "";
                    if (automatic_discount?.discount_type === "buy_x_get_y") {
                        let specific_order_count = 0;
                        let select_product_detail = {};

                        if (automatic_discount?.customer_get_product_items) {
                            let customer_get_product_items = automatic_discount?.customer_get_product_items;

                            if (specific_order_count === 0 && customer_get_product_items.length > 0) {
                                select_product_detail = await ShopifyHelper.ShopifyGetProductByID(
                                    store_detail,
                                    parseInt(customer_get_product_items[0])
                                );
                            }

                            specific_order_count = parseInt(specific_order_count) + parseInt(customer_get_product_items.length);
                        }

                        if (automatic_discount?.customer_get_collection_items) {
                            let customer_get_collection_items = automatic_discount?.customer_get_collection_items;

                            if (specific_order_count === 0 && customer_get_collection_items.length > 0) {
                                select_product_detail = await ShopifyHelper.ShopifyGetCollectionByID(
                                    store_detail,
                                    parseInt(customer_get_collection_items[0])
                                );
                            }

                            specific_order_count = parseInt(specific_order_count) + parseInt(customer_get_collection_items.length);
                        }

                        specific_order_count = parseInt(specific_order_count) - 1;

                        let trigger_more = "";
                        if (specific_order_count > 0) {
                            trigger_more = `
                                <div class="trigger_more">
                                    <span class="show-item">[2 more]</span>
                                </div>
                            `
                        }

                        discount_triggers = `
                            <div class="trigger_td">
                                <div class="trigger_left">
                                    <img src="${select_product_detail?.image?.src}">
                                </div>
                                <div class="trigger_right">
                                    <div class="trigger_title">${select_product_detail?.title}</div>
                                    ${trigger_more}
                                </div>
                            </div>
                        `;
                    }

                    if (automatic_discount?.discount_type === "percentage" || automatic_discount?.discount_type === "fixed_amount") {
                        if (automatic_discount?.specific_order_bool === true) {

                            let specific_order_count = 0;
                            let select_product_detail = {};

                            if (automatic_discount?.customer_discount_product_items) {
                                let customer_discount_product_items = automatic_discount?.customer_discount_product_items;

                                if (specific_order_count === 0 && customer_discount_product_items.length > 0) {
                                    select_product_detail = await ShopifyHelper.ShopifyGetProductByID(
                                        store_detail,
                                        parseInt(customer_discount_product_items[0])
                                    );
                                }

                                specific_order_count = parseInt(specific_order_count) + parseInt(customer_discount_product_items.length);
                            }

                            if (automatic_discount?.customer_discount_collection_items) {
                                let customer_discount_collection_items = automatic_discount?.customer_discount_collection_items;

                                if (specific_order_count === 0 && customer_discount_collection_items.length > 0) {
                                    select_product_detail = await ShopifyHelper.ShopifyGetCollectionByID(
                                        store_detail,
                                        parseInt(customer_discount_collection_items[0])
                                    );
                                }

                                specific_order_count = parseInt(specific_order_count) + parseInt(customer_discount_collection_items.length);
                            }

                            specific_order_count = parseInt(specific_order_count) - 1;

                            let trigger_more = "";
                            if (specific_order_count > 0) {
                                trigger_more = `
                                    <div class="trigger_more">
                                        <span class="show-item">[2 more]</span>
                                    </div>
                                `
                            }

                            discount_triggers = `
                                <div class="trigger_td">
                                    <div class="trigger_left">
                                        <img src="${select_product_detail?.image?.src}">
                                    </div>
                                    <div class="trigger_right">
                                        <div class="trigger_title">${select_product_detail?.title}</div>
                                        ${trigger_more}
                                    </div>
                                </div>
                            `;

                        } else {
                            discount_triggers = "Entire order";
                        }
                    }

                    if (automatic_discount?.discount_type === "free_shipping") {
                        discount_triggers = "Free shipping";
                    }

                    let discount_date = `${moment(automatic_discount?.active_from_date).format('DD MMM YYYY')}`;
                    if (automatic_discount?.is_end_date === true) {
                        discount_date = `Expired on ${moment(automatic_discount?.active_to_date).format('DD MMM YYYY')}`;
                    }


                    let discount_usage = "";
                    if (automatic_discount.discount_usage_bool && automatic_discount.discount_usage > 0) {
                        discount_usage = `
                            <p>
                                ${automatic_discount.total_discount_usage + ' times'}/ <span class="grey_text"> ${automatic_discount.discount_usage + 'max'} </span>
                            </p>
                        `
                    } else {
                        discount_usage = `<p>${automatic_discount.total_discount_usage + ' times'}</p>`
                    }

                    let discount_status = `<span class="discount-active"> Active</span>`
                    let check_discount_condition = true
                    
                    // Check Start date is Valid or Not
                    let active_from_date = moment(automatic_discount?.active_from_date);
                    check_discount_condition = moment().diff(active_from_date, "minutes") > 0;

                    if(automatic_discount?.is_end_date){
                        let active_to_date = moment(automatic_discount?.active_to_date);
                        check_discount_condition = moment().diff(active_to_date, "hours") < 0;
                        if(check_discount_condition){
                            discount_status = (automatic_discount.discount_usage_bool && automatic_discount.discount_usage <= automatic_discount.total_discount_usage && automatic_discount.discount_usage > 0 ?
                                `<span class="discount-exceeded"> <img src="/assets/img/inactive.png"> Exceeded</span>`
                                :
                                `<span class="discount-active"> <img src="/assets/img/active.png"> Active</span>`);
                        }else{
                            discount_status = `<span class="discount-expired"> <img src="/assets/img/inactive.png"> Inactive</span>`
                        }
                    }
                    if(!automatic_discount?.is_end_date){
                    discount_status = (automatic_discount.discount_usage_bool && automatic_discount.discount_usage <= automatic_discount.total_discount_usage && automatic_discount.discount_usage > 0 ?
                                `<span class="discount-exceeded"> <img src="/assets/img/inactive.png"> Exceeded</span>`
                                :
                                `<span class="discount-active"> <img src="/assets/img/active.png"> Active</span>`);
                    }

                    // let discount_status = (automatic_discount?.is_end_date ?
                    //     (automatic_discount?.active_from_date <= moment().toDate() && automatic_discount.active_to_date >= moment().toDate() ?
                    //         (automatic_discount.discount_usage_bool && automatic_discount.discount_usage <= automatic_discount.total_discount_usage && automatic_discount.discount_usage > 0 ?
                    //             `<span class="discount-exceeded"> Exceeded</span>`
                    //             :
                    //             `<span class="discount-active"> Active </span>`)
                    //         :
                    //         `<span class="discount-expired">Inactive</span>`)
                    //     :
                    //     (automatic_discount.discount_usage_bool && automatic_discount.discount_usage <= automatic_discount.total_discount_usage && automatic_discount.discount_usage > 0 ?
                    //         `<span class="discount-exceeded"> Exceeded</span>`
                    //         :
                    //         `<span class="discount-active"> Active</span>`));


                    client_data.push({
                        discount_title: `
                            <div class="td_discount_title">
                                <span>${automatic_discount.discount_title}</span>
                                
                            </div>
                        `,
                        discount_triggers: discount_triggers,
                        discount_date: discount_date,
                        discount_usage: discount_usage,
                        discount_status: discount_status,
                        action: `
                            <div class="d-flex">
                                <a
                                    class="btn"
                                    href="${process.env.APP_URL}/${automatic_discount?.store_id}/discount/${automatic_discount?.automatic_discount_uuid}/edit"
                                >
                                    <i class="bi bi-pencil-square"></i>
                                </a>
                                <a href="javascript:void(0);" class="btn delete_automatic_discount" discount_id="${automatic_discount?.id}">
                                    <i class="bi bi-trash"></i>
                                </a>
                            </div>
                        `,
                    });
                }
            }

            return res.json({
                data: client_data,
                draw: request_body["draw"],
                recordsTotal: automatic_discounts.count,
                recordsFiltered: automatic_discounts.count,
            });
        } catch (error) {
            console.error("upsell error-----------", error);
            return res.json({
                status: false,
                message: error?.message ? error.message : "Something went wrong. Please try again.",
            });
        }
    }

    let automatic_discount_count = await models.AutomaticDiscounts.count({
        where: {
            store_id: store_id,
        },
    });

    return res.render("backend/AutomaticDiscount/discount_listing", {
        store_id: store_id,
        auth_user: auth_user,
        auth_store: auth_store,
        active_menu: "discounts",

        automatic_discount_count: automatic_discount_count
    });
};

module.exports.add_discount = async (req, res, next) => {
    const { auth_user, auth_store } = req;
    const { store_id } = req.params;

    //////////////////////////////////// Post Request
    if (req.method === "POST") {
        console.log("add_discount",req.body)

        try {
            let request_body = req.body;

            if (!request_body?.discount_title) {
                return res.json({
                    status: false,
                    message: "Please enter discount title",
                });
            }
            
            if (request_body?.active_to_date) {
                let todates = request_body?.active_to_date;
                let from = moment(request_body?.active_from_date);
                let to = moment(todates);
                let date_diff = from.diff( to, "seconds" );
                
                if (date_diff>0) {
                    return res.json({
                        status: false,
                        message: "Start date can't be greater than end date"
                    });
                }
                
            }

            // If Discount type is Buy X Get Y
            if (request_body.discount_type === "buy_x_get_y") {
                let { customer_buy_product_items, customer_buy_collection_items, customer_get_product_items, customer_get_collection_items } = request_body

                customer_buy_product_items = JSON.parse(customer_buy_product_items)
                customer_buy_collection_items = JSON.parse(customer_buy_collection_items)

                customer_get_product_items = JSON.parse(customer_get_product_items)
                customer_get_collection_items = JSON.parse(customer_get_collection_items)

                if (customer_buy_product_items.length == 0 && customer_buy_collection_items.length == 0) {
                    return res.json({
                        status: false,
                        message: "Please select discount applies when items",
                    });
                }

                if (customer_get_product_items.length == 0 && customer_get_collection_items.length == 0) {
                    return res.json({
                        status: false,
                        message: "Please select customer will get items",
                    });
                }

                // Customer buys - Get Specific products ID's
                if (request_body?.customer_buy_product_items.length > 0) {
                    let buy_product_ids = [];
                    let buy_product_varient_ids = [];
                    let customer_buy_product_items = JSON.parse(request_body?.customer_buy_product_items);
                    for (let customer_buy_product_item of customer_buy_product_items) {
                        buy_product_ids.push(customer_buy_product_item?.product_id);
                        buy_product_varient_ids = [...buy_product_varient_ids, ...customer_buy_product_item?.selected_product_variants]
                    }
                    request_body.customer_buy_product_items = buy_product_ids;
                    request_body.customer_buy_product_varient_items = buy_product_varient_ids;
                } else {
                    request_body.customer_buy_product_items = null;
                    request_body.customer_buy_product_varient_items = null;
                }

                // Customer buys - Get Specific collections ID's
                if (request_body?.customer_buy_collection_items.length > 0) {
                    let customer_buy_collection_items = JSON.parse(request_body?.customer_buy_collection_items);
                    customer_buy_collection_items = array_column(customer_buy_collection_items, "product_id");
                    request_body.customer_buy_collection_items = customer_buy_collection_items;
                } else {
                    request_body.customer_buy_collection_items = null;
                }


                // Customer will get - Get Specific products ID's
                if (request_body?.customer_get_product_items.length > 0) {
                    let get_product_ids = [];
                    let get_product_varient_ids = [];
                    let customer_get_product_items = JSON.parse(request_body?.customer_get_product_items);
                    for (let customer_get_product_item of customer_get_product_items) {
                        get_product_ids.push(customer_get_product_item?.product_id);
                        get_product_varient_ids = [...get_product_varient_ids, ...customer_get_product_item?.selected_product_variants]
                    }

                    request_body.customer_get_product_items = get_product_ids;
                    request_body.customer_get_product_varient_items = get_product_varient_ids;
                } else {
                    request_body.customer_get_product_items = null;
                    request_body.customer_get_product_varient_items = null;
                }

                // Customer will get - Get Specific collections ID's
                if (request_body?.customer_get_collection_items.length > 0) {
                    let customer_get_collection_items = JSON.parse(request_body?.customer_get_collection_items);
                    customer_get_collection_items = array_column(customer_get_collection_items, "product_id");
                    request_body.customer_get_collection_items = customer_get_collection_items;
                } else {
                    request_body.customer_get_collection_items = null;
                }

            } else {
                request_body.customer_buy_product_items = null;
                request_body.customer_buy_product_varient_items = null;
                request_body.customer_buy_collection_items = null;

                request_body.customer_get_product_items = null;
                request_body.customer_get_product_varient_items = null;
                request_body.customer_get_collection_items = null;
            }

            // If Discount type is percentage and Fixed Amount
            if (request_body?.discount_type == "percentage" || request_body?.discount_type == "fixed_amount") {

                let { customer_discount_product_items, customer_discount_collection_items, } = request_body
                customer_discount_product_items = JSON.parse(customer_discount_product_items)
                customer_discount_collection_items = JSON.parse(customer_discount_collection_items)

                if (
                    request_body?.discount_on == "specific_order_bool"
                    && customer_discount_product_items.length == 0
                    && customer_discount_collection_items.length == 0
                ) {
                    return res.json({
                        status: false,
                        message: "Please select specific products or collections"
                    });
                }

                if (request_body?.discount_on == "specific_order_bool") {
                    // Get Specific products ID's
                    if (request_body?.customer_discount_product_items.length > 0) {
                        let discount_product_ids = [];
                        let discount_product_varient_ids = [];
                        let customer_discount_product_items = JSON.parse(request_body?.customer_discount_product_items);
                        for (let customer_discount_product_item of customer_discount_product_items) {
                            discount_product_ids.push(customer_discount_product_item?.product_id);
                            discount_product_varient_ids = [...discount_product_varient_ids, ...customer_discount_product_item?.selected_product_variants]
                        }

                        request_body.customer_discount_product_items = discount_product_ids;
                        request_body.customer_discount_product_varient_items = discount_product_varient_ids;
                    } else {
                        request_body.customer_discount_product_items = null;
                        request_body.customer_discount_product_varient_items = null;
                    }

                    // Get Specific collections ID's
                    if (request_body?.customer_discount_collection_items.length > 0) {
                        let customer_discount_collection_items = JSON.parse(request_body?.customer_discount_collection_items);
                        customer_discount_collection_items = array_column(customer_discount_collection_items, "product_id");
                        request_body.customer_discount_collection_items = customer_discount_collection_items;
                    } else {
                        request_body.customer_discount_collection_items = null;
                    }
                } else {
                    request_body.customer_discount_product_items = null;
                    request_body.customer_discount_product_varient_items = null;
                    request_body.customer_discount_collection_items = null;
                }
            } else {
                request_body.customer_discount_product_items = null;
                request_body.customer_discount_product_varient_items = null;
                request_body.customer_discount_collection_items = null;
            }

            request_body.user_id = auth_user?.id;
            request_body.store_id = request_body?.store_id;

            if (request_body.active_from_date && request_body.active_start_time) {
                request_body.active_from_date = moment(request_body.active_from_date + " " + request_body.active_start_time);
            }

            if (request_body.is_end_date) {
                request_body.is_end_date = true;
            } else {
                request_body.is_end_date = false;
            }

            if (request_body.active_to_date && request_body.active_end_time) {
                request_body.active_to_date = moment(request_body.active_to_date + " " + request_body.active_end_time);
            }

            if (request_body.discount_usage_bool) {
                request_body.discount_usage_bool = true;
            } else {
                request_body.discount_usage_bool = false;
            }

            // When Customer Buy
            //// Minimum quantity reached in cart
            if (request_body.cart_minimum_quantity_bool) {
                request_body.cart_minimum_quantity = request_body.cart_minimum_quantity;
                request_body.cart_minimum_quantity_bool = request_body.cart_minimum_quantity_bool;
            } else {
                request_body.cart_minimum_quantity = null;
                request_body.cart_minimum_quantity_bool = false;
            }

            //// Minimum amount reached in cart
            if (request_body.cart_amount_quantity_bool) {
                request_body.cart_minimum_amount = request_body.cart_minimum_amount;
                request_body.cart_amount_quantity_bool = request_body.cart_amount_quantity_bool;
            } else {
                request_body.cart_minimum_amount = null
                request_body.cart_amount_quantity_bool = false;
            }

            // Customer will get
            if (request_body.customer_free_discount_bool == 'on') {
                request_body.customer_percentage_discount = null;
                request_body.customer_percentage_discount_bool = false;
            } else {
                request_body.customer_free_discount_bool = false;
                request_body.customer_percentage_discount = request_body.customer_percentage_discount;
            }

            // For how many items the discount applies
            request_body.maximum_discount_usage = request_body?.maximum_discount_usage || 0;

            // Additional options
            if (request_body.discount_additional_options_bool == 'on') {
                request_body.discount_additional_options_bool = true;
                request_body.maximum_discount_usage_per_order = request_body.maximum_discount_usage_per_order;
            } else {
                request_body.discount_additional_options_bool = false;
                request_body.maximum_discount_usage_per_order = null;
            }

            //Discount Setup
            //// Minimum quantity reached in cart 
            if (request_body.cart_mini_quantity_bool) {
                request_body.cart_minimum_quantity = request_body.cart_mini_quantity;
                request_body.cart_minimum_quantity_bool = request_body.cart_mini_quantity_bool;
            } else {
                request_body.cart_minimum_quantity_bool = false;
            }

            // Minimum amount reached in cart 
            if (request_body.cart_mini_amount_bool) {
                request_body.cart_minimum_amount = request_body.cart_amt_quantity;
                request_body.cart_mini_amount_bool = request_body.cart_mini_amount_bool;
            } else {
                request_body.cart_mini_amount_bool = false;
            }

            //Discount applies on
            request_body.percentage_discount_value = request_body?.percentage_discount_value || 0;
            if (request_body.discount_on == "entire_order_bool") {
                request_body.entire_order_bool = true;
            } else {
                request_body.entire_order_bool = false;
            }

            if (request_body.discount_on == "specific_order_bool") {
                request_body.specific_order_bool = true;
            } else {
                request_body.specific_order_bool = false;
            }
            request_body.exclude_shipping_amount = request_body?.exclude_shipping_amount || 0;


            request_body.total_discount_usage = 0;
            let automatic_discount = await AutomaticDiscounts.create(request_body);

            return res.json({
                status: true,
                message: "Discount Created Successfully",
                // redirect_url: `${process.env.APP_URL}/${request_body?.store_id}/discounts`,
                redirect_url: `${process.env.APP_URL}/${request_body?.store_id}/discount/${automatic_discount?.automatic_discount_uuid}/edit`,
            });
        } catch (error) {
            console.error("add_discount error------------", error);
            return res.json({
                status: false,
                message: error?.message ? error.message : "Something went wrong. Please try again.",
            });
        }
    }

    //////////////////////////////////// Get Request
    try {
        let store_detail = await Stores.findOne({
            where: {
                id: store_id,
            },
        });

        var product_details;
        var collection_details;
        if (store_detail) {

            //////////////////////////////////// Get Shopify Product Lists
            var product_option = {
                json: true,
                method: "GET",
                uri: `https://${store_detail.store_name}.myshopify.com/admin/products.json`,
                headers: {
                    "Content-Type": "application/json",
                    "X-Shopify-Access-Token": `${store_detail.store_token}`,
                },
            };
            await request(product_option, function (error, response) {
                console.log(error);
                if (error) throw new Error(error);
                product_details = response?.body?.products;
            });

            //////////////////////////////////// Get Shopify Collections Lists
            var collection_option = {
                json: true,
                method: "GET",
                uri: `https://${store_detail.store_name}.myshopify.com/admin/custom_collections.json`,
                headers: {
                    "Content-Type": "application/json",
                    "X-Shopify-Access-Token": `${store_detail.store_token}`,
                },
            };
            await request(collection_option, function (error, response) {
                if (error) throw new Error(error);
                collection_details = response?.body?.custom_collections;
            });
        }

        return res.render("backend/AutomaticDiscount/add_discount", {
            store_id: store_id,
            auth_user: auth_user,
            auth_store: auth_store,
            active_menu: "discounts",

            moment: moment,
            product_details: product_details,
            collection_details: collection_details,

            automatic_discount: {},
            discount_type: "percentage",

            customer_buy_product_items: [],
            customer_buy_collection_items: [],

            customer_get_product_items: [],
            customer_get_collection_items: [],

            customer_discount_product_items: [],
            customer_discount_collection_items: [],
        });
    } catch (error) {
        console.error("add_discount error -----------", error);
        res.render("404");
    }
};

module.exports.edit_discount = async (req, res, next) => {
    const { auth_user, auth_store } = req;
    const { store_id, discount_id } = req.params;

    //////////////////////////////////// Post Request
    if (req.method === "POST") {
        try {
            let request_body = req.body;

            if (!request_body?.discount_title) {
                return res.json({
                    status: false,
                    message: "Please enter discount title",
                });
            }

            if (request_body?.active_to_date) {
                let todates = request_body?.active_to_date;
                let from = moment(request_body?.active_from_date);
                let to = moment(todates);
                let date_diff = from.diff( to, "seconds" );
     
                if (date_diff>0) {
                    return res.json({
                        status: false,
                        message: "Start date can't be greater than end date"
                    });
                }

            }

            // If Discount type is Buy X Get Y
            if (request_body.discount_type === "buy_x_get_y") {

                let { customer_buy_product_items, customer_buy_collection_items, customer_get_product_items, customer_get_collection_items } = request_body

                customer_buy_product_items = JSON.parse(customer_buy_product_items)
                customer_buy_collection_items = JSON.parse(customer_buy_collection_items)

                customer_get_product_items = JSON.parse(customer_get_product_items)
                customer_get_collection_items = JSON.parse(customer_get_collection_items)

                if (customer_buy_product_items.length == 0 && customer_buy_collection_items.length == 0) {
                    return res.json({
                        status: false,
                        message: "Please select discount applies when items",
                    });
                }

                if (customer_get_product_items.length == 0 && customer_get_collection_items.length == 0) {
                    return res.json({
                        status: false,
                        message: "Please select customer will get items",
                    });
                }

                // Customer buys - Get Specific products ID's
                if (request_body?.customer_buy_product_items.length > 0) {
                    let buy_product_ids = [];
                    let buy_product_varient_ids = [];
                    let customer_buy_product_items = JSON.parse(request_body?.customer_buy_product_items);
                    for (let customer_buy_product_item of customer_buy_product_items) {
                        buy_product_ids.push(customer_buy_product_item?.product_id);
                        buy_product_varient_ids = [...buy_product_varient_ids, ...customer_buy_product_item?.selected_product_variants]
                    }
                    request_body.customer_buy_product_items = buy_product_ids;
                    request_body.customer_buy_product_varient_items = buy_product_varient_ids;
                } else {
                    request_body.customer_buy_product_items = null;
                    request_body.customer_buy_product_varient_items = null;
                }

                // Customer buys - Get Specific collections ID's
                if (request_body?.customer_buy_collection_items.length > 0) {
                    let customer_buy_collection_items = JSON.parse(request_body?.customer_buy_collection_items);
                    customer_buy_collection_items = array_column(customer_buy_collection_items, "product_id");
                    request_body.customer_buy_collection_items = customer_buy_collection_items;
                } else {
                    request_body.customer_buy_collection_items = null;
                }


                // Customer will get - Get Specific products ID's
                if (request_body?.customer_get_product_items.length > 0) {
                    let get_product_ids = [];
                    let get_product_varient_ids = [];
                    let customer_get_product_items = JSON.parse(request_body?.customer_get_product_items);
                    for (let customer_get_product_item of customer_get_product_items) {
                        get_product_ids.push(customer_get_product_item?.product_id);
                        get_product_varient_ids = [...get_product_varient_ids, ...customer_get_product_item?.selected_product_variants]
                    }

                    request_body.customer_get_product_items = get_product_ids;
                    request_body.customer_get_product_varient_items = get_product_varient_ids;
                } else {
                    request_body.customer_get_product_items = null;
                    request_body.customer_get_product_varient_items = null;
                }

                // Customer will get - Get Specific collections ID's
                if (request_body?.customer_get_collection_items.length > 0) {
                    let customer_get_collection_items = JSON.parse(request_body?.customer_get_collection_items);
                    customer_get_collection_items = array_column(customer_get_collection_items, "product_id");
                    request_body.customer_get_collection_items = customer_get_collection_items;
                } else {
                    request_body.customer_get_collection_items = null;
                }

            } else {
                request_body.customer_buy_product_items = null;
                request_body.customer_buy_product_varient_items = null;
                request_body.customer_buy_collection_items = null;

                request_body.customer_get_product_items = null;
                request_body.customer_get_product_varient_items = null;
                request_body.customer_get_collection_items = null;
            }

            // If Discount type is percentage and Fixed Amount
            if (request_body?.discount_type == "percentage" || request_body?.discount_type == "fixed_amount") {
                
                let { customer_discount_product_items, customer_discount_collection_items, } = request_body
                customer_discount_product_items = JSON.parse(customer_discount_product_items)
                customer_discount_collection_items = JSON.parse(customer_discount_collection_items)
                
                if (
                    request_body?.discount_on == "specific_order_bool"
                    && customer_discount_product_items.length == 0
                    && customer_discount_collection_items.length == 0
                ) {
                    return res.json({
                        status: false,
                        message: "Please select specific products or collections"
                    });
                }

                if (request_body?.discount_on == "specific_order_bool") {
                    // Get Specific products ID's
                    if (request_body?.customer_discount_product_items.length > 0) {
                        let discount_product_ids = [];
                        let discount_product_varient_ids = [];
                        let customer_discount_product_items = JSON.parse(request_body?.customer_discount_product_items);
                        for (let customer_discount_product_item of customer_discount_product_items) {
                            discount_product_ids.push(customer_discount_product_item?.product_id);
                            discount_product_varient_ids = [...discount_product_varient_ids, ...customer_discount_product_item?.selected_product_variants]
                        }

                        request_body.customer_discount_product_items = discount_product_ids;
                        request_body.customer_discount_product_varient_items = discount_product_varient_ids;
                    } else {
                        request_body.customer_discount_product_items = null;
                        request_body.customer_discount_product_varient_items = null;
                    }

                    // Get Specific collections ID's
                    if (request_body?.customer_discount_collection_items.length > 0) {
                        let customer_discount_collection_items = JSON.parse(request_body?.customer_discount_collection_items);
                        customer_discount_collection_items = array_column(customer_discount_collection_items, "product_id");
                        request_body.customer_discount_collection_items = customer_discount_collection_items;
                    } else {
                        request_body.customer_discount_collection_items = null;
                    }
                } else {
                    request_body.customer_discount_product_items = null;
                    request_body.customer_discount_product_varient_items = null;
                    request_body.customer_discount_collection_items = null;
                }
            } else {
                request_body.customer_discount_product_items = null;
                request_body.customer_discount_product_varient_items = null;
                request_body.customer_discount_collection_items = null;
            }

            request_body.user_id = auth_user?.id;
            request_body.store_id = request_body?.store_id;

            if (request_body.active_from_date && request_body.active_start_time) {
                request_body.active_from_date = moment(request_body.active_from_date + " " + request_body.active_start_time);
            }

            if (request_body.is_end_date) {
                request_body.is_end_date = true;
            } else {
                request_body.is_end_date = false;
            }

            if (request_body.active_to_date && request_body.active_end_time) {
                request_body.active_to_date = moment(request_body.active_to_date + " " + request_body.active_end_time);
            }

            if (request_body.discount_usage_bool) {
                request_body.discount_usage_bool = true;
            } else {
                request_body.discount_usage_bool = false;
            }

            // When Customer Buy
            //// Minimum quantity reached in cart
            if (request_body.cart_minimum_quantity_bool) {
                request_body.cart_minimum_quantity = request_body.cart_minimum_quantity;
                request_body.cart_minimum_quantity_bool = request_body.cart_minimum_quantity_bool;
            } else {
                request_body.cart_minimum_quantity = null;
                request_body.cart_minimum_quantity_bool = false;
            }

            //// Minimum amount reached in cart
            if (request_body.cart_amount_quantity_bool) {
                request_body.cart_minimum_amount = request_body.cart_minimum_amount;
                request_body.cart_amount_quantity_bool = request_body.cart_amount_quantity_bool;
            } else {
                request_body.cart_minimum_amount = null
                request_body.cart_amount_quantity_bool = false;
            }

            // Customer will get
            if (request_body.customer_free_discount_bool == 'on') {
                request_body.customer_percentage_discount = null;
                request_body.customer_percentage_discount_bool = false;
            } else {
                request_body.customer_free_discount_bool = false;
                request_body.customer_percentage_discount = request_body.customer_percentage_discount;
            }

            // For how many items the discount applies
            request_body.maximum_discount_usage = request_body?.maximum_discount_usage || 0;

            // Additional options
            if (request_body.discount_additional_options_bool == 'on') {
                request_body.discount_additional_options_bool = true;
                request_body.maximum_discount_usage_per_order = request_body.maximum_discount_usage_per_order;
            } else {
                request_body.discount_additional_options_bool = false;
                request_body.maximum_discount_usage_per_order = null;
            }

            //Discount Setup
            //// Minimum quantity reached in cart 
            if (request_body.cart_mini_quantity_bool) {
                request_body.cart_minimum_quantity = request_body.cart_mini_quantity;
                request_body.cart_minimum_quantity_bool = request_body.cart_mini_quantity_bool;
            } else {
                request_body.cart_minimum_quantity_bool = false;
            }

            // Minimum amount reached in cart 
            if (request_body.cart_mini_amount_bool) {
                request_body.cart_minimum_amount = request_body.cart_amt_quantity;
                request_body.cart_mini_amount_bool = request_body.cart_mini_amount_bool;
            } else {
                request_body.cart_mini_amount_bool = false;
            }

            //Discount applies on
            request_body.percentage_discount_value = request_body?.percentage_discount_value || 0;
            if (request_body.discount_on == "entire_order_bool") {
                request_body.entire_order_bool = true;
            } else {
                request_body.entire_order_bool = false;
            }

            if (request_body.discount_on == "specific_order_bool") {
                request_body.specific_order_bool = true;
            } else {
                request_body.specific_order_bool = false;
            }
            request_body.exclude_shipping_amount = request_body?.exclude_shipping_amount || 0;

            // request_body.total_discount_usage = 0;

            let automatic_discount_id = request_body?.automatic_discount_id;
            let automatic_discount_uuid = request_body?.automatic_discount_uuid;

            delete request_body?.automatic_discount_id;
            delete request_body?.automatic_discount_uuid;
            await AutomaticDiscounts.update(request_body, {
                where: {
                    id: automatic_discount_id,
                },
            });

            return res.json({
                status: true,
                message: "Discount Update Successfully",
                redirect_url: `${process.env.APP_URL}/${request_body?.store_id}/discount/${automatic_discount_uuid}/edit`,
            });
        } catch (error) {
            console.error("edit_discount error------------", error);
            return res.json({
                status: false,
                message: error?.message ? error.message : "Something went wrong. Please try again.",
            });
        }
    }

    //////////////////////////////////// Get Request
    try {
        let store_detail = await Stores.findOne({
            where: {
                id: store_id,
            },
        });

        var product_details;
        var collection_details;
        if (store_detail) {
            //////////////////////////////////// Get Shopify Product Lists
            var product_option = {
                json: true,
                method: "GET",
                uri: `https://${store_detail.store_name}.myshopify.com/admin/products.json`,
                headers: {
                    "Content-Type": "application/json",
                    "X-Shopify-Access-Token": `${store_detail.store_token}`,
                },
            };
            await request(product_option, function (error, response) {
                console.log(error);
                if (error) throw new Error(error);
                product_details = response?.body?.products;
            });

            //////////////////////////////////// Get Shopify Collections Lists
            var collection_option = {
                json: true,
                method: "GET",
                uri: `https://${store_detail.store_name}.myshopify.com/admin/custom_collections.json`,
                headers: {
                    "Content-Type": "application/json",
                    "X-Shopify-Access-Token": `${store_detail.store_token}`,
                },
            };
            await request(collection_option, function (error, response) {
                if (error) throw new Error(error);
                collection_details = response?.body?.custom_collections;
            });
        }

        let automatic_discount = await AutomaticDiscounts.findOne({
            where: {
                store_id: store_id,
                automatic_discount_uuid: discount_id,
            },
        });

        let customer_buy_product_items = [];
        let customer_buy_collection_items = [];

        let customer_get_product_items = [];
        let customer_get_collection_items = [];
        // If Discount type is Buy X Get Y
        if (automatic_discount.discount_type === "buy_x_get_y") {

            // Customer buys - Get Specific products ID's
            if (automatic_discount?.customer_buy_product_items) {
                customer_buy_product_items = automatic_discount?.customer_buy_product_items;
                let customer_buy_product_varient_items = automatic_discount?.customer_buy_product_varient_items;

                let buy_product_items = [];
                customer_buy_product_items.forEach((product_id) => {
                    const product_found = product_details.find((product_detail) => product_detail.id == product_id);

                    let selected_product_variants = [];
                    product_found?.variants.map((variant) => {
                        if (customer_buy_product_varient_items.includes(variant?.id.toString())) {
                            selected_product_variants.push(variant?.id);
                        }
                    });

                    buy_product_items.push({
                        product_id: product_found?.id,
                        product_title: product_found?.title,
                        product_image: product_found?.image?.src,

                        product_variants: product_found?.variants,
                        selected_product_variants: selected_product_variants,
                    });

                });
                customer_buy_product_items = buy_product_items;
            }

            // Customer buys - Get Specific collections ID's
            if (automatic_discount?.customer_buy_collection_items) {
                customer_buy_collection_items = automatic_discount?.customer_buy_collection_items;
                let buy_collection_items = [];
                customer_buy_collection_items.forEach((collection_id) => {
                    const product_found = collection_details.find((collection_detail) => collection_detail.id == collection_id);
                    buy_collection_items.push({
                        product_id: product_found?.id,
                        product_title: product_found?.title,
                        product_image: product_found?.image?.src,
                    });
                });
                customer_buy_collection_items = buy_collection_items;
            }

            // Customer will get - Get Specific products ID's
            if (automatic_discount?.customer_get_product_items) {
                customer_get_product_items = automatic_discount?.customer_get_product_items;
                let customer_get_product_varient_items = automatic_discount?.customer_get_product_varient_items;

                let get_product_items = [];
                customer_get_product_items.forEach((product_id) => {
                    const product_found = product_details.find((product_detail) => product_detail.id == product_id);

                    let selected_product_variants = [];
                    product_found?.variants.map((variant) => {
                        if (customer_get_product_varient_items.includes(variant?.id.toString())) {
                            selected_product_variants.push(variant?.id);
                        }
                    });

                    get_product_items.push({
                        product_id: product_found?.id,
                        product_title: product_found?.title,
                        product_image: product_found?.image?.src,

                        product_variants: product_found?.variants,
                        selected_product_variants: selected_product_variants,
                    });

                });
                customer_get_product_items = get_product_items;
            }

            // Customer will get - Get Specific collections ID's
            if (automatic_discount?.customer_get_collection_items) {
                customer_get_collection_items = automatic_discount?.customer_get_collection_items;
                let get_collection_items = [];
                customer_get_collection_items.forEach((collection_id) => {
                    const product_found = collection_details.find((collection_detail) => collection_detail.id == collection_id);
                    get_collection_items.push({
                        product_id: product_found?.id,
                        product_title: product_found?.title,
                        product_image: product_found?.image?.src,
                    });
                });
                customer_get_collection_items = get_collection_items;
            }
        }


        let customer_discount_product_items = [];
        let customer_discount_collection_items = [];
        // If Discount type is percentage and Fixed Amount
        if (automatic_discount?.discount_type == "percentage" || automatic_discount?.discount_type == "fixed_amount") {
            // Get Specific products ID's
            if (automatic_discount?.customer_discount_product_items) {
                customer_discount_product_items = automatic_discount?.customer_discount_product_items;
                let customer_discount_product_varient_items = automatic_discount?.customer_discount_product_varient_items;

                let discount_product_items = [];
                customer_discount_product_items.forEach((product_id) => {
                    const product_found = product_details.find((product_detail) => product_detail.id == product_id);

                    let selected_product_variants = [];
                    product_found?.variants.map((variant) => {
                        if (customer_discount_product_varient_items.includes(variant?.id.toString())) {
                            selected_product_variants.push(variant?.id);
                        }
                    });

                    discount_product_items.push({
                        product_id: product_found?.id,
                        product_title: product_found?.title,
                        product_image: product_found?.image?.src,

                        product_variants: product_found?.variants,
                        selected_product_variants: selected_product_variants,
                    });
                });
                customer_discount_product_items = discount_product_items;
            }

            // Get Specific collections ID's
            if (automatic_discount?.customer_discount_collection_items) {
                customer_discount_collection_items = automatic_discount?.customer_discount_collection_items;
                let discount_collection_items = [];
                customer_discount_collection_items.forEach((collection_id) => {
                    const product_found = collection_details.find((collection_detail) => collection_detail.id == collection_id);
                    discount_collection_items.push({
                        product_id: product_found?.id,
                        product_title: product_found?.title,
                        product_image: product_found?.image?.src,
                    });
                });
                customer_discount_collection_items = discount_collection_items;
            }
        }


        return res.render("backend/AutomaticDiscount/edit_discount", {
            store_id: store_id,
            auth_user: auth_user,
            auth_store: auth_store,
            active_menu: "discounts",

            moment: moment,
            product_details: product_details,
            collection_details: collection_details,

            automatic_discount: automatic_discount,
            discount_type: automatic_discount?.discount_type,

            customer_buy_product_items: customer_buy_product_items,
            customer_buy_collection_items: customer_buy_collection_items,
            customer_get_product_items: customer_get_product_items,
            customer_get_collection_items: customer_get_collection_items,

            customer_discount_product_items: customer_discount_product_items,
            customer_discount_collection_items: customer_discount_collection_items,
        });
    } catch (error) {
        console.error("edit_discount error -----------", error);
        res.render("404");
    }
};

module.exports.delete_discount = async (req, res, next) => {
    let request_body = req.body;
    try {
        await AutomaticDiscounts.destroy({
            where: {
                id: request_body.id,
            },
        });
        return res.json({
            status: true,
            message: "Automatic Discount Deleted Successfully",
            redirect_url: `${process.env.APP_URL}/${request_body?.store_id}/discounts`,
        });
    } catch (error) {
        console.error("delete_discount error------------", error);
        return res.json({
            status: false,
            message: "Failed to delete discount",
        });
    }
};