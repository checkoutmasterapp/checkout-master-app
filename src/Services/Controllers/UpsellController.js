
const Sq = require("sequelize");
const moment = require("moment");
const request = require("request-promise");

const models = require("../models");

module.exports.upsell = async (req, res, next) => {
    const { store_id } = req.params;
    const { auth_user, auth_store } = req;

    if (req.method === "POST") {
        try {
            let request_body = req.body;

            let where_filter = {
                store_id: request_body?.store_id
            };

            let query_object = {
                distinct: true,
                where: where_filter,
                order: [["id", "DESC"]],
                offset: request_body.start,
                limit: request_body.length,
                include: [
                    {
                        as: "upsell_triggers",
                        model: models.UpsellTrigger,
                        attributes: ["id", "upsell_trigger_uuid", "trigger_title", "trigger_image"],
                    },
                    {
                        as: "upsell_trigger_offers",
                        model: models.UpsellTriggerOffer,
                    },
                ],
            };

            let upsell_lists = await models.Upsell.findAndCountAll(query_object);

            let client_data = [];
            if (upsell_lists.rows) {
                for (let upsell_list of upsell_lists.rows) {

                    //// Upsell trigger html start
                    let trigger_count = "";
                    let other_trigger_html = "";
                    let first_trigger_image = "";
                    let first_trigger_title = "";
                    upsell_list?.upsell_triggers.forEach((upsell_trigger, upsell_trigger_key) => {
                        if (upsell_trigger_key == 0) {
                            first_trigger_title = upsell_trigger?.trigger_title;
                            first_trigger_image = upsell_trigger?.trigger_image;
                        } else {
                            trigger_count = `[${upsell_trigger_key} more]`;
                            other_trigger_html += `
                                <div class="upsell_trigger">
                                    <div class="trigger_image"><img src="${upsell_trigger?.trigger_image}" /></div>
                                    <div class="trigger_title">${upsell_trigger?.trigger_title}</div>
                                </div>
                            `;
                        }
                    });
                    let upsell_triggers_html = `
                        <div class="trigger_td">
                            <div class="trigger_left"><img src="${first_trigger_image}"/></div>
                            <div class="trigger_right">
                                <div class="trigger_title">${first_trigger_title}</div>
                                <div class="trigger_more">
                                    <span class="show-item">${trigger_count}</span>
                                    <div class="has-inline-tooltip">
                                        ${other_trigger_html}
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    //// Upsell trigger html End

                    //// Upsell offer html Start
                    let upsell_offers_html = `<div class="upsell_offer_td">`;
                    upsell_list?.upsell_trigger_offers.forEach((trigger_offer, trigger_offer_key) => {
                        upsell_offers_html += (trigger_offer_key > 0) ? `<i class="bi bi-chevron-right"></i>` : "";
                        upsell_offers_html += `
                            <div class="upsell_offer">
                                <img src="${trigger_offer?.product_image}" />                
                            </div>
                        `
                    });
                    upsell_offers_html += `</div>`
                    //// Upsell offer html End

                    client_data.push({
                        upsell_triggers: `${upsell_triggers_html}`,
                        upsell_offers: `${upsell_offers_html}`,
                        created_at: moment(upsell_list?.created_at).format('DD MMM YYYY'),
                        status: upsell_list?.status ? "<span class='upsell_active'>Active</span>" : "<span class='upsell_inactive'>Inactive</span>",
                        action: `
                            <div class="d-flex">
                                <a
                                    href="${process.env.APP_URL}/${upsell_list?.store_id}/upsells/${upsell_list?.upsell_uuid}/edit"
                                    class="btn"
                                >
                                    <i class="bi bi-pencil-square"></i>
                                </a>
                                <a
                                    href="javascript:void(0);"
                                    class="btn delete_upsell"
                                    upsell_id="${upsell_list?.id}"
                                    upsell_uuid="${upsell_list?.upsell_uuid}"
                                >
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
                recordsTotal: upsell_lists.count,
                recordsFiltered: upsell_lists.count,
            });
        } catch (error) {
            console.error("upsell error-----------", error);
            return res.json({
                status: false,
                message: error?.message ? error.message : "Something went wrong. Please try again.",
            });
        }
    }

    res.render("backend/Upsell/upsell.pug", {
        store_id: store_id,
        auth_user: auth_user,
        auth_store: auth_store,
        active_menu: "upsell",
    });
};

module.exports.upsell_create = async (req, res, next) => {
    const { store_id } = req.params;
    const { auth_user, auth_store } = req;

    //////////////////////////////////// Post Request
    if (req.method === "POST") {
        let request_body = req.body;
        try {

            //////////////////////////////////// Upsell Offer 
            const upsell_detail = await models.Upsell.create({
                user_id: auth_user?.id,
                store_id: request_body?.store_id,
                upsell_title: request_body?.upsell_title,
                status: request_body?.upsell_status,
            });

            //////////////////////////////////// Upsell Triggers
            let upsell_triggers = JSON.parse(request_body?.upsell_triggers);
            upsell_triggers.forEach((upsell_trigger) => {
                upsell_trigger.user_id = auth_user?.id;
                upsell_trigger.store_id = request_body?.store_id;
                upsell_trigger.upsell_id = upsell_detail?.id;
            });
            await models.UpsellTrigger.bulkCreate(upsell_triggers);

            //////////////////////////////////// Post-Purchase Upsell Offers
            let upsell_trigger_offer_option = [];
            let upsell_trigger_offers = JSON.parse(request_body?.upsell_trigger_offers);
            upsell_trigger_offers.forEach((upsell_trigger_offer) => {
                if (upsell_trigger_offer?.product_id) {
                    upsell_trigger_offer.user_id = auth_user?.id;
                    upsell_trigger_offer.store_id = request_body?.store_id;
                    upsell_trigger_offer.upsell_id = upsell_detail?.id;

                    upsell_trigger_offer_option.push(upsell_trigger_offer);
                }
            });
            await models.UpsellTriggerOffer.bulkCreate(upsell_trigger_offer_option);


            return res.json({
                status: true,
                message: "Upsell Created Successfully",
                redirect_url: `${process.env.APP_URL}/${request_body?.store_id}/upsells/${upsell_detail?.upsell_uuid}/edit`
            });
        } catch (error) {
            console.error("upsell_create error-----------", error);
            return res.json({
                status: false,
                message: error?.message ? error.message : "Something went wrong. Please try again.",
            });
        }
    }

    //////////////////////////////////// Get Request
    try {
        // Check user subscription
        const store_detail = await models.Stores.findOne({
            where: {
                id: store_id
            },
        });

        var product_details;
        var collection_details;
        if (store_detail) {

            //////////////////////////////////// Get Shopify Product Lists
            var product_option = {
                json: true,
                method: "GET",
                url: `https://${store_detail.store_name}.myshopify.com/admin/api/2022-10/products.json?limit=250`,
                headers: {
                    "Content-Type": "application/json",
                    "X-Shopify-Access-Token": store_detail.store_token,
                },
            };
            await request(product_option, function (error, response) {
                if (error) {
                    console.log("upsell_create error--------", error?.message)
                } else {
                    product_details = response?.body?.products;
                }
            });

            //////////////////////////////////// Get Shopify Collections Lists
            var collection_option = {
                json: true,
                method: "GET",
                url: `https://${store_detail.store_name}.myshopify.com/admin/api/2022-10/custom_collections.json`,
                headers: {
                    "X-Shopify-Access-Token": store_detail.store_token,
                    "Content-Type": "application/json",
                },
            };
            await request(collection_option, function (error, response) {
                if (error) {
                    console.log("upsell_create error--------", error?.message)
                } else {
                    collection_details = response?.body?.custom_collections;
                }
            });
        }

        // Get All Existing Upsell
        let exist_upsell_lists = await models.Upsell.findAll({
            where: { store_id: store_id },
            include: [
                {
                    as: "upsell_triggers",
                    model: models.UpsellTrigger,
                },
                {
                    as: "upsell_trigger_offers",
                    model: models.UpsellTriggerOffer
                },
                {
                    as: "upsell_performances",
                    model: models.UpsellPerformance
                }
            ]
        });

        return res.render("backend/Upsell/upsell_create", {
            store_id: store_id,
            auth_user: auth_user,
            auth_store: auth_store,
            active_menu: "upsell",

            product_details: product_details,
            collection_details: collection_details,
            exist_upsell_lists: exist_upsell_lists,

            upsell_triggers: [],
            upsell_trigger_offers: [{}, {}, {}],
        });
    } catch (error) {
        console.error("add_upsell error -----------", error?.message);
        res.render("404");
    }
};

module.exports.upsell_edit = async (req, res, next) => {
    const { auth_user, auth_store } = req;
    const { store_id, upsell_id } = req.params;

    //////////////////////////////////// Post Request
    if (req.method === "POST") {
        try {
            let request_body = req.body;

            //////////////////////////////////// Update Upsell Offer 
            await models.Upsell.update({
                upsell_title: request_body?.upsell_title,
                status: request_body?.upsell_status,
            }, {
                where: {
                    id: request_body.upsell_id,
                    store_id: request_body.store_id,
                },
            });

            //////////////////////////////////// Upsell Triggers
            let upsell_trigger_options = [];
            let upsell_triggers = JSON.parse(request_body?.upsell_triggers);
            if (upsell_triggers.length > 0) {
                upsell_triggers.forEach((upsell_trigger) => {
                    if (upsell_trigger?.upsell_trigger_uuid === "undefined" || upsell_trigger?.upsell_trigger_uuid === undefined) {
                        upsell_trigger.user_id = auth_user?.id;
                        upsell_trigger.store_id = request_body?.store_id;
                        upsell_trigger.upsell_id = request_body?.upsell_id;
                        upsell_trigger_options.push(upsell_trigger);
                    }
                });
                await models.UpsellTrigger.bulkCreate(upsell_trigger_options);
            }


            //////////////////////////////////// Delete Extra Upsell Triggers
            let upsell_trigger_delete = JSON.parse(request_body?.upsell_trigger_delete);
            if (upsell_trigger_delete) {
                await models.UpsellTrigger.destroy({
                    where: {
                        id: upsell_trigger_delete,
                        store_id: request_body?.store_id,
                    },
                });
            }

            //////////////////////////////////// Update Post-Purchase Upsell Offers
            let upsell_trigger_offers = JSON.parse(request_body?.upsell_trigger_offers);
            upsell_trigger_offers.forEach(async (upsell_trigger_offer) => {
                if (upsell_trigger_offer?.upsell_trigger_offer_uuid) {
                    let upsell_trigger_offer_id = upsell_trigger_offer?.id;

                    delete upsell_trigger_offer?.id;
                    delete upsell_trigger_offer?.upsell_trigger_offer_uuid;

                    await models.UpsellTriggerOffer.update(upsell_trigger_offer, {
                        where: {
                            id: upsell_trigger_offer_id,
                        },
                    });
                } else {
                    if (upsell_trigger_offer?.product_id) {
                        upsell_trigger_offer.user_id = auth_user?.id;
                        upsell_trigger_offer.store_id = request_body?.store_id;
                        upsell_trigger_offer.upsell_id = request_body.upsell_id;
                        models.UpsellTriggerOffer.create(upsell_trigger_offer);
                    }
                }
            });

            //////////////////////////////////// Delete Extra Upsell Offers
            let upsell_trigger_offers_delete = JSON.parse(request_body?.upsell_trigger_offers_delete);
            if (upsell_trigger_offers_delete) {
                console.log("upsell_trigger_offers_delete--------", upsell_trigger_offers_delete);
                await models.UpsellTriggerOffer.destroy({
                    where: {
                        store_id: request_body?.store_id,
                        id: upsell_trigger_offers_delete,
                    },
                });
            }

            return res.json({
                status: true,
                message: "Upsell Update Successfully"
            });
        } catch (error) {
            console.error("upsell_edit error-----------", error);
            return res.json({
                status: false,
                message: error?.message ? error.message : "Something went wrong. Please try again.",
            });
        }
    }


    //////////////////////////////////// Get Request
    try {
        const store_detail = await models.Stores.findOne({
            where: {
                id: store_id
            },
        });

        var product_details;
        var collection_details;
        if (store_detail) {

            //////////////////////////////////// Get Shopify Product Lists
            var product_option = {
                json: true,
                method: "GET",
                url: `https://${store_detail.store_name}.myshopify.com/admin/api/2022-10/products.json?limit=250`,
                headers: {
                    "X-Shopify-Access-Token": store_detail.store_token,
                    "Content-Type": "application/json",
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
                url: `https://${store_detail.store_name}.myshopify.com/admin/api/2022-10/custom_collections.json`,
                headers: {
                    "X-Shopify-Access-Token": store_detail.store_token,
                    "Content-Type": "application/json",
                },
            };
            await request(collection_option, function (error, response) {
                if (error) throw new Error(error);
                collection_details = response?.body?.custom_collections;
            });
        }

        //////////////////////////////////// Get Upsell from Database
        const upsell_detail = await models.Upsell.findOne({
            where: {
                upsell_uuid: upsell_id
            },
        });

        const upsell_triggers = await models.UpsellTrigger.findAll({
            where: {
                upsell_id: upsell_detail?.id
            },
        });

        const upsell_trigger_offers = await models.UpsellTriggerOffer.findAll({
            order: [['sort_order', 'ASC']],
            where: {
                upsell_id: upsell_detail?.id
            },
        });
        if (upsell_trigger_offers?.length === 0) { upsell_trigger_offers.push({}, {}, {}); }
        if (upsell_trigger_offers?.length === 1) { upsell_trigger_offers.push({}, {}); }
        if (upsell_trigger_offers?.length === 2) { upsell_trigger_offers.push({}); }


        //////////////////////////////////// Upsell Performance Records
        let upsell_performance_record = {
            upsell_conversion_rate: 0,
            upsell_times_shown: 0,
            upsell_purchased: 0,
            upsell_revenue: 0
        };
        const upsell_performances = await models.UpsellPerformance.findAll({
            where: {
                upsell_id: upsell_detail?.id
            },
        });
        if (upsell_performances.length > 0) {
            let upsell_revenue = 0;
            let purchased_count = 0;
            for (let upsell_performance of upsell_performances) {
                upsell_revenue = parseFloat(upsell_revenue) + parseFloat(upsell_performance?.upsell_revenue);
                purchased_count = parseFloat(purchased_count) + parseFloat(upsell_performance?.purchased_count);
            }
            upsell_performance_record.upsell_revenue = upsell_revenue;
            upsell_performance_record.upsell_purchased = purchased_count;
            upsell_performance_record.upsell_times_shown = upsell_performances.length;
            upsell_performance_record.upsell_conversion_rate = (purchased_count / upsell_performances.length) * 100;
        }

        // Get All Existing Upsell
        let exist_upsell_lists = await models.Upsell.findAll({
            where: {
                store_id: store_id,
                id: { [Sq.Op.notIn]: [upsell_detail?.id] }
            },
            include: [
                {
                    as: "upsell_triggers",
                    model: models.UpsellTrigger,
                },
                {
                    as: "upsell_trigger_offers",
                    model: models.UpsellTriggerOffer
                },
                {
                    as: "upsell_performances",
                    model: models.UpsellPerformance
                }
            ]
        });

        return res.render("backend/Upsell/upsell_edit", {
            store_id: store_id,
            auth_user: auth_user,
            auth_store: auth_store,
            active_menu: "upsell",

            product_details: product_details,
            collection_details: collection_details,
            exist_upsell_lists: exist_upsell_lists,

            upsell_detail: upsell_detail,
            upsell_triggers: upsell_triggers,
            upsell_trigger_offers: upsell_trigger_offers,
            upsell_performance_record: upsell_performance_record,
        });
    } catch (error) {
        console.error("upsell_edit error-----------", error);
        res.render("404");
    }
};

module.exports.upsell_performance = async (req, res, next) => {
    let request_body = req.body;

    try {

        let performance_start = moment(request_body?.performance_start).startOf("day");
        let performance_end = moment(request_body?.performance_end).endOf("day");

        let upsell_performance_record = {
            upsell_conversion_rate: 0,
            upsell_times_shown: 0,
            upsell_purchased: 0,
            upsell_revenue: 0
        };

        const upsell_performances = await models.UpsellPerformance.findAll({
            where: {
                store_id: request_body?.store_id,
                upsell_id: request_body?.upsell_id,
                created_at: {
                    [Sq.Op.between]: [performance_start, performance_end]
                },
            },
        });
        if (upsell_performances.length > 0) {
            let upsell_revenue = 0;
            let purchased_count = 0;
            for (let upsell_performance of upsell_performances) {
                upsell_revenue = parseFloat(upsell_revenue) + parseFloat(upsell_performance?.upsell_revenue);
                purchased_count = parseFloat(purchased_count) + parseFloat(upsell_performance?.purchased_count);
            }
            upsell_performance_record.upsell_revenue = upsell_revenue;
            upsell_performance_record.upsell_purchased = purchased_count;
            upsell_performance_record.upsell_times_shown = upsell_performances.length;
            upsell_performance_record.upsell_conversion_rate = (purchased_count / upsell_performances.length) * 100;
        }

        return res.json({
            status: true,
            data: upsell_performance_record,
            message: "Upsell performance records",
        });
    } catch (error) {
        console.error("upsell_performance error------------", error);
        return res.json({
            status: false,
            message: error?.message ? error.message : "Something went wrong. Please try again.",
        });
    }
};

module.exports.upsell_preview = async (req, res, next) => {
    const { auth_user, auth_store } = req;
    const { store_id, upsell_uuid } = req.params;

    try {
        const store_detail = await models.Stores.findOne({
            where: {
                id: store_id
            },
        });

        //////////////////////////////////// Get Store Customize Checkout
        let customize_checkout = await models.CustomizeCheckout.findOne({
            where: {
                store_id: store_id,
                user_id: auth_user?.id,
            }
        });

        //////////////////////////////////// Get Upsell from Database
        const upsell_detail = await models.Upsell.findOne({
            where: {
                store_id: store_id,
                upsell_uuid: upsell_uuid
            },
        });

        //////////////////////////////////// Get Upsell Triggersn Offer from Database
        let upsell_trigger_offers = await models.UpsellTriggerOffer.findAll({
            where: {
                store_id: store_id,
                upsell_id: upsell_detail?.id
            },
        });

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

            upsell_trigger_lists.push(upsell_trigger_offer)
        };

        return res.render("backend/Upsell/upsell_preview", {
            right_sides: [],
            store_id: store_id,
            auth_user: auth_user,
            auth_store: auth_store,

            customize_checkout: customize_checkout,

            upsell_detail: upsell_detail,
            upsell_trigger_offers: upsell_trigger_lists,
        });
    } catch (error) {
        console.error("upsell_edit error-----------", error);
        res.render("404");
    }
};

module.exports.delete_upsell = async (req, res, next) => {
    let request_body = req.body;

    if (req.method === "DELETE") {
        try {
            await models.Upsell.destroy({
                where: {
                    upsell_uuid: request_body?.upsell_id,
                    store_id: request_body?.store_id,
                },
            });

            return res.json({
                status: true,
                message: "Upsell deleted successfully",
                redirect_url: `${process.env.APP_URL}/${request_body?.store_id}/upsell`,
            });
        } catch (error) {
            console.error("delete_Upsell error------------", error);
            return res.json({
                status: false,
                message: error?.message ? error.message : "Something went wrong. Please try again.",
            });
        }
    }
};

module.exports.delete_upsell_trigger = async (req, res, next) => {
    let request_body = req.body;

    if (req.method === "DELETE") {
        try {
            await models.UpsellTrigger.destroy({
                where: {
                    store_id: request_body?.store_id,
                    id: request_body?.upsell_trigger_id,
                },
            });
            return res.json({ status: true, message: "Upsell trigger deleted successfully" });
        } catch (error) {
            console.error("delete_upsell_trigger error------------", error);
            return res.json({
                status: false,
                message: error?.message ? error.message : "Something went wrong. Please try again.",
            });
        }
    }
};

module.exports.delete_upsell_offer = async (req, res, next) => {
    let request_body = req.body;

    if (req.method === "DELETE") {
        try {
            await models.UpsellTriggerOffer.destroy({
                where: {
                    store_id: request_body?.store_id,
                    id: request_body?.upsell_trigger_offer_id,
                },
            });

            return res.json({ status: true, message: "Upsell Offer deleted successfully" });
        } catch (error) {
            console.error("delete_upsell_offer error------------", error);
            return res.json({
                status: false,
                message: error?.message ? error.message : "Something went wrong. Please try again.",
            });
        }
    }
};

module.exports.upsell_update = async (req, res, next) => {
    let request_body = req.body;

    try {

        if (request_body?.action === "change_upsell_status") {
            await models.Upsell.update({
                status: request_body?.upsell_status,
            }, {
                where: {
                    id: request_body.upsell_id,
                    store_id: request_body.store_id,
                },
            });
        }


        return res.json({ status: true, message: "Upsell update successfully" });
    } catch (error) {
        console.error("upsell_update error------------", error);
        return res.json({
            status: false,
            message: error?.message ? error.message : "Something went wrong. Please try again.",
        });
    }
};

module.exports.upsell_lists = async (req, res, next) => {
    let request_query = req.query;

    try {
        let upsell_detail = await models.Upsell.findAll({
            where: {
                store_id: request_query?.store_id,
            },
            include: [
                {
                    as: "upsell_triggers",
                    model: models.UpsellTrigger,
                },
                {
                    as: "upsell_trigger_offers",
                    model: models.UpsellTriggerOffer
                },
                {
                    as: "upsell_performances",
                    model: models.UpsellPerformance
                }
            ]
        });

        return res.json({
            status: true,
            data: upsell_detail,
            message: "Upsell Offer deleted successfully"
        });
    } catch (error) {
        console.error("upsell_lists error------------", error);
        return res.json({
            status: false,
            message: error?.message ? error.message : "Something went wrong. Please try again.",
        });
    }
};