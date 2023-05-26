"use strict";

const Sq = require("sequelize");
const cookie = require("cookie");
const moment = require("moment");
const jwt = require("jsonwebtoken");

const models = require("../Services/models");

module.exports.frontend_authorize = async (req, res, next) => {
    let server_session = req?.cookies;

    if (server_session?.token && server_session?.user && server_session?.store_id) {
        return res.redirect(`/${server_session?.store_id}/dashboard`);
    }

    next();
};

module.exports.wed_authorize = async (req, res, next) => {
    let auth_token = req?.cookies?.token;
    let session_user = req?.cookies?.user;

    console.log("//////////////////////////////////////////////////////////////////////////////");
    console.log("wed_authorize auth_token------------", auth_token);
    console.log("wed_authorize session_user------------", session_user?.email);

    try {
        if (!auth_token) {
            if (req.method !== "GET") {
                return res.json({
                    status: false,
                    message: "User Not found",
                });
            } else {
                return res.redirect("/");
            }
        }

        auth_token = jwt.verify(auth_token, process.env.JWT_SECRET_TOKEN);

        // Check Auth user
        const auth_user = await models.Users.findOne({
            where: {
                id: auth_token.user_id,
            },
            raw: true,
        });

        if (session_user?.id !== auth_user?.id) {
            if (req.method !== "GET") {
                console.log("wed_authorize auth_user------------", auth_user);
                return res.json({
                    status: false,
                    message: "User Not found",
                });
            } else {
                return res.redirect("/logout");
            }
        }

        let store_details_auth = await models.Stores.findAll({
            where: {
                user_id: auth_user.id,
            },
        });
        if (store_details_auth) {
            req.session.store_details = store_details_auth;
        }

        let user_subscription = await models.UserSubscriptions.findOne({
            where: {
                user_id: auth_user.id,
            },
            include: [
                {
                    as: "subscription_package",
                    model: models.SubscriptionPackage,
                    attribute: ["id", "package_name"]
                },
            ],
        });
        auth_user.user_subscription = user_subscription;
        auth_user.custom_domain_menu = user_subscription?.subscription_package?.package_name?.includes("Scale plan");

        req.auth_user = auth_user;
    } catch (error) {
        console.error("wed_authorize error -----------------", error);
        return res.json({
            status: false,
            message: "Something went wrong. Please try again.",
        });
    }

    next();
};

module.exports.checksubscription = async (req, res, next) => {
    let { store_id } = req.params;
    const auth_user = req.auth_user;
    let server_session = req?.session;
    try {
        // Check Auth Store
        store_id = store_id ? store_id : server_session?.store_id;

        let user_store_where = { user_id: auth_user.id };
        if (store_id) {

            user_store_where = { ...user_store_where, id: store_id };
            let auth_store = await models.Stores.findOne({ where: user_store_where });

            if (auth_store) {
                req.auth_store = auth_store;
                req.session.auth_store = auth_store;

                // Check Store setup or not
                if (!auth_store?.store_token) {
                    if (req?.route?.path !== "/store-connect" && req?.route?.path !== "/store-connect/") {
                        return res.redirect("/store-connect");
                    }
                }
            } else {
                if (req?.route?.path !== "/store-connect" && req?.route?.path !== "/store-connect/") {
                    return res.redirect("/store-connect");
                }
            }
        }
    } catch (error) {
        console.error("middleware checksubscription error -----------------", error);
        return res.json({
            status: false,
            message: "Something went wrong. Please try again.",
        });
    }

    next();
};