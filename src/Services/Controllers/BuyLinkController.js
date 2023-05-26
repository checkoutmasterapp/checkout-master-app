const moment = require("moment");
const request = require("request-promise");

const models = require("../models");

module.exports.buylink_list = async (req, res, next) => {
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
            };

            let buy_links = await models.BuyLinks.findAndCountAll(query_object);

            let client_data = [];
            if (buy_links.rows) {
                for (let buy_link of buy_links.rows) {
                    client_data.push({
                        buylink_url: `
                            <div class="input-group">
                                <input
                                    class="form-control"
                                    value="${buy_link?.buylink_url}"
                                />
                                <span class="input-group-text cursor-pointer clipboard_buylink_url">
                                    <img src="/assets/img/copy_icon.svg">
                                </span>
                            </div>
                        `,
                        discount_code: buy_link?.discount_code ? buy_link.discount_code : "-",
                        created_at: moment(buy_link?.created_at).format("DD MMM YYYY"),
                        action: `
                            <div class="d-flex">
                                <a
                                    href="javascript:void(0);"
                                    class="btn delete_buylink"
                                    buylink_id="${buy_link?.id}"
                                    buylink_uuid="${buy_link?.buylink_uuid}"
                                >
                                    <i class="bi bi-trash"></i>
                                </a>
                            </div>
                        `,
                    })
                }
            }

            return res.json({
                data: client_data,
                draw: request_body["draw"],
                recordsTotal: buy_links.count,
                recordsFiltered: buy_links.count,
            });
        } catch (error) {
            console.error("buylink_list error-----------", error);
            return res.json({
                status: false,
                message: error?.message ? error.message : "Something went wrong. Please try again.",
            });
        }
    }

    res.render("backend/BuyLink/buylink_list", {
        store_id: store_id,
        auth_user: auth_user,
        auth_store: auth_store,
        active_menu: "buy-link"
    });
};

module.exports.buylink_create = async (req, res, next) => {
    const { store_id } = req.params;
    const { auth_user, auth_store } = req;

    if (req.method === "POST") {
        try {
            let request_body = req.body;
            let buylink_products = JSON.parse(request_body?.buylink_products);

            let buy_link_option = {
                user_id: auth_user?.id,
                store_id: request_body?.store_id,
                buylink_products: buylink_products,
                discount_code: request_body?.discount_code,
                buylink_url: request_body?.buylink_url
            }
            await await models.BuyLinks.create(buy_link_option);

            return res.json({
                status: true,
                message: "Buylink Created Successfully",
                redirect_url: `${process.env.APP_URL}/${request_body?.store_id}/buylink/list`
            });
        } catch (error) {
            console.error("buylink_create error-----------", error);
            return res.json({
                status: false,
                message: error?.message ? error.message : "Something went wrong. Please try again.",
            });
        }
    }

    let product_option = {
        json: true,
        method: "GET",
        url: `https://${auth_store.store_domain}/admin/api/2022-10/products.json?limit=250`,
        headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": auth_store.store_token,
        },
    };
    let product_details;
    await request(product_option, function (error, response) {
        product_details = response?.body?.products;
    });

    res.render("backend/BuyLink/buylink_create", {
        store_id: store_id,
        auth_user: auth_user,
        auth_store: auth_store,
        active_menu: "buy-link",

        product_details: product_details,
    });
}

module.exports.buylink_delete = async (req, res, next) => {
    let request_body = req.body;

    try {
        await models.BuyLinks.destroy({
            where: {
                store_id: request_body?.store_id,
                buylink_uuid: request_body?.buylink_uuid,
            },
        });

        return res.json({
            status: true,
            message: "Buylink deleted Successfully",
            redirect_url: `${process.env.APP_URL}/${request_body?.store_id}/buylink/list`,
        });
    } catch (error) {
        console.error("delete_Upsell error------------", error);
        return res.json({
            status: false,
            message: error?.message ? error.message : "Something went wrong. Please try again.",
        });
    }
};