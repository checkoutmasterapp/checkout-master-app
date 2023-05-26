"use strict";

const models = require("../models");
const { ShippingRates, Stores, Countries } = require("../models");

module.exports.shipping_rates = async (req, res, next) => {
    const { store_id } = req.params;
    const { auth_user, auth_store } = req;

    if (req.method === "POST") {
        try {
            let request_body = req.body;

            let where_filter = {
                store_id: request_body?.store_id
            };

            let query_object = {
                where: where_filter,
                order: [["id", "DESC"]],
                offset: request_body.start,
                limit: request_body.length,
            };

            let shipping_rates = await models.ShippingRates.findAndCountAll(query_object);
            let client_data = [];
            if (shipping_rates.rows) {
                for (let shipping_rate of shipping_rates.rows) {

                    let shipping_amount = `n/a`;
                    if (shipping_rate?.shipping_rate_min_amount && shipping_rate?.shipping_rate_max_amount) {
                        shipping_amount = `from $${parseFloat(shipping_rate?.shipping_rate_min_amount).toFixed(2)} to $${parseFloat(shipping_rate?.shipping_rate_max_amount).toFixed(2)}`;
                    } else {
                        if (shipping_rate?.shipping_rate_min_amount && shipping_rate?.shipping_rate_min_amount !== "null" && shipping_rate?.shipping_rate_min_amount !== null) {
                            shipping_amount = `from $${parseFloat(shipping_rate?.shipping_rate_min_amount).toFixed(2)} `;
                        }
                        if (shipping_rate?.shipping_rate_max_amount && shipping_rate?.shipping_rate_max_amount !== "null" && shipping_rate?.shipping_rate_max_amount !== null) {
                            shipping_amount = `up to $${parseFloat(shipping_rate?.shipping_rate_max_amount).toFixed(2)} `;
                        }
                    }

                    let shipping_weight = `n/a`;
                    if (shipping_rate?.shipping_rate_min_weight && shipping_rate?.shipping_rate_max_weight) {
                        shipping_weight = `from ${parseFloat(shipping_rate?.shipping_rate_min_weight).toFixed(1)} Kg to ${parseFloat(shipping_rate?.shipping_rate_max_weight).toFixed(1)} Kg`;
                    } else {
                        if (shipping_rate?.shipping_rate_min_weight && shipping_rate?.shipping_rate_min_weight !== "null" && shipping_rate?.shipping_rate_min_weight !== null) {
                            shipping_weight = `from ${parseFloat(shipping_rate?.shipping_rate_min_weight).toFixed(1)} Kg`;
                        }
                        if (shipping_rate?.shipping_rate_max_weight && shipping_rate?.shipping_rate_max_weight !== "null" && shipping_rate?.shipping_rate_max_weight !== null) {
                            shipping_weight = `up to ${parseFloat(shipping_rate?.shipping_rate_max_weight).toFixed(1)} Kg`;
                        }
                    }


                    let shipping_countries = "All Countries Selected"
                    if (shipping_rate.country_codes.length != "243" && shipping_rate.country_codes.length > 0) {

                        let other_country_count = "";

                        if (shipping_rate.country_codes.length > 1) {
                            other_country_count = `
                                <div class="mr-3 d-none d-md-block count">
                                    + ${shipping_rate.country_codes.length - 1} others
                                </div>
                            `;
                        }

                        if (shipping_rate.country_codes.length > 2) {
                            other_country_count = `
                                <div class="mr-3 d-none d-md-block count">
                                    + ${shipping_rate.country_codes.length - 1} others
                                </div>
                            `
                        }

                        shipping_countries = `
                            <div class="d-flex justify-content-start w-100">
                                <div class="text-truncate mr-3">
                                    <span class="flags-icons fi fi-${shipping_rate.country_codes[0].toLowerCase()}"></span>
                                </div>
                                ${other_country_count}
                            </div>
                        `
                    }

                    client_data.push({
                        shipping_rate_name: shipping_rate?.shipping_rate_name,
                        shipping_rate_price: shipping_rate?.shipping_rate_price,
                        price_range: shipping_amount,
                        weight_range: shipping_weight,
                        shipping_countrys: shipping_countries,
                        action: `
                            <div class="d-flex">
                                <a
                                    href="${process.env.APP_URL}/${shipping_rate?.store_id}/edit-shipping-rate/${shipping_rate?.id}"
                                    class="btn"
                                ><i class="bi bi-pencil-square"></i></a>
                            </div>
                            <a
                                href="javascript:void(0);"
                                class="btn shipping_rate_delete"
                                shipping_rate_id="${shipping_rate?.id}"
                            >
                                <i class="bi bi-trash"></i>
                            </a>
                        `,
                    })
                }
            }

            return res.json({
                data: client_data,
                draw: request_body["draw"],
                recordsTotal: shipping_rates.count,
                recordsFiltered: shipping_rates.count,
            });
        } catch (error) {
            console.error("shipping_rates error-----------", error);
            return res.json({
                status: false,
                message: error?.message ? error.message : "Something went wrong. Please try again.",
            });
        }
    }

    res.render("backend/ShippingRate/shipping_rates", {
        store_id: store_id,
        auth_user: auth_user,
        auth_store: auth_store,
        active_menu: "shipping-rates",
    });
};

module.exports.add_shipping_rate = async (req, res, next) => {
    const { store_id } = req.params;
    const { auth_user, auth_store } = req;

    if (req.method === "POST") {
        try {
            let request_body = req.body;
            request_body.user_id = auth_user?.id;
            request_body.created_by = auth_user?.id;

            request_body.shipping_rate_min_amount = request_body?.shipping_rate_min_amount || null;
            request_body.shipping_rate_max_amount = request_body?.shipping_rate_max_amount || null;
            request_body.shipping_rate_min_weight = request_body?.shipping_rate_min_weight || null;
            request_body.shipping_rate_max_weight = request_body?.shipping_rate_max_weight || null;

            await ShippingRates.create(request_body);

            await Stores.update(
                { shipping_rate: true },
                {
                    where: {
                        id: request_body?.store_id,
                    },
                }
            );

            return res.json({
                status: true,
                message: "Shipping rates added Successfully",
                redirect_url: `${process.env.APP_URL}/${request_body?.store_id}/shipping-rates`,
            });
        } catch (error) {
            console.log("add_shipping_rate error------------", error);
            return res.json({
                status: false,
                message: "Something went wrong!Please try again.",
            });
        }
    }

    res.render("backend/ShippingRate/add_shipping_rate", {
        store_id: store_id,
        auth_user: auth_user,
        auth_store: auth_store,
        active_menu: "shipping-rates",
    });
};

module.exports.edit_shipping_rate = async (req, res, next) => {
    const { store_id, id } = req.params;
    const { auth_user, auth_store } = req;

    if (req.method === "POST") {
        try {
            let request_body = req.body;
            request_body.user_id = auth_user?.id;
            request_body.updated_by = auth_user?.id;

            request_body.shipping_rate_min_amount = request_body?.shipping_rate_min_amount || null;
            request_body.shipping_rate_max_amount = request_body?.shipping_rate_max_amount || null;
            request_body.shipping_rate_min_weight = request_body?.shipping_rate_min_weight || null;
            request_body.shipping_rate_max_weight = request_body?.shipping_rate_max_weight || null;

            let shipping_rate_id = request_body?.shipping_rate_id;
            delete request_body?.shipping_rate_id;

            if (request_body.country_codes.length > 0) {
                request_body.country_codes = request_body.country_codes.filter((val) => val !== "0");
            }

            await ShippingRates.update(request_body, {
                where: {
                    id: shipping_rate_id,
                },
            });

            return res.json({
                status: true,
                message: "Shipping Rate Updated Successfully",
                redirect_url: `${process.env.APP_URL}/${request_body?.store_id}/shipping-rates`,
            });
        } catch (error) {
            console.log("edit_shipping_rate error------------", error);
            return res.json({
                status: false,
                message: "Something went wrong!Please try again.",
            });
        }
    }

    try {
        let shipping_rate = await ShippingRates.findOne({
            where: {
                id: id,
                store_id: store_id,
            },
        }).then((response) => {
            return response;
        });
        let countries = await Countries.findAll().then((response) => {
            return response;
        });
        if (!shipping_rate) {
            return res.render("backend/Dashboard/index", {
                store_id: store_id,
                auth_user: auth_user,
                auth_store: auth_store,
                active_menu: "dashboard",
            });
        }

        let shipping_rates = await ShippingRates.findAll({
            where: {
                store_id: store_id,
            },
        }).then((response) => {
            return response;
        });

        let last_shipping_rate = false;
        if (shipping_rates.length == 1) {
            last_shipping_rate = true;
        }

        res.render("backend/ShippingRate/edit_shipping_rate", {
            store_id: store_id,
            auth_user: auth_user,
            auth_store: auth_store,
            active_menu: "shipping-rates",

            shipping_rate: shipping_rate,
            countries: countries,
            last_shipping_rate: last_shipping_rate,
        });
    } catch (error) {
        console.error("edit_shipping_rate error -----------", error);
        res.render("404");
    }
};

module.exports.delete_shipping_rate = async (req, res, next) => {
    if (req.method === "DELETE") {
        let request_body = req.body;

        try {
            await ShippingRates.destroy({
                where: {
                    id: request_body?.shipping_rate_id,
                },
            });
            return res.json({
                status: true,
                message: "Shipping Rate deleted successfully",
                redirect_url: `${process.env.APP_URL}/${request_body?.store_id}/shipping-rates`,
            });
        } catch (error) {
            console.log("delete_shipping_rate error------------", error);
            return res.json({
                status: false,
                message: "Something went wrong!Please try again.",
            });
        }
    }
};