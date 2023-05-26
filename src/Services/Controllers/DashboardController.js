const Sq = require("sequelize");
const moment = require("moment");

const models = require("../models");

module.exports.dashboard = async (req, res, next) => {
    const { store_id } = req.params;
    const { auth_user, auth_store } = req;

    let store_details = await models.Stores.findAll({
        where: {
            user_id: auth_user.id,
        },
    });
    if (store_details) {
        req.session.store_details = store_details;
    }

    let shipping_rate_count = await models.ShippingRates.count({
        where: {
            store_id: store_id,
            user_id: auth_user.id,
        },
    });

    let payment_method_count = await models.PaymentMethods.count({
        where: {
            store_id: store_id,
            user_id: auth_user.id,
        },
    });

    let user_subscriptions = await models.UserSubscriptionBillings.count({
        where: {
            user_id: auth_user.id,
        },
    });

    req.session.store_id = store_id;
    req.session.save();
    res.cookie('store_id', store_id);

    return res.render("backend/Dashboard/index", {
        store_id: store_id,
        auth_user: auth_user,
        auth_store: auth_store,
        active_menu: "dashboard",

        user_subscriptions: user_subscriptions,
        shipping_rate_count: shipping_rate_count,
        payment_method_count: payment_method_count,
    });
};


module.exports.dashboard_filter = async (req, res, next) => {
    try {
        let { store_id } = req.body;

        let startDate = moment(req.body?.startDate).startOf("day").format();
        let endDate = moment(req.body?.endDate).endOf("day").format();


        let customize_checkout = await models.CustomizeCheckout.findOne({
            attributes: ["money_format", "store_logo", "favicon", "security_badge"],
            where: { store_id: store_id },
        });

        /////////////////////////////////////////// Get Upsell Metrics
        let upsell_performances = await models.UpsellPerformance.findAll({
            where: {
                store_id: store_id,
                created_at: {
                    [Sq.Op.between]: [startDate, endDate]
                },
            },
        });

        let upsell_performance_details = {
            upsell_revenue: 0.00,
            upsell_shown: 0,
            upsell_added: 0,
            upsell_purchased: 0
        };
        // Shown Upsell
        upsell_performance_details.upsell_shown = upsell_performances.length;
        for (let upsell_performance of upsell_performances) {

            // UPSELLS AMOUNT
            let upsell_revenue = parseFloat(upsell_performance?.upsell_revenue || 0.00);
            upsell_performance_details.upsell_revenue += upsell_revenue;

            // Added Upsell
            if (upsell_performance?.purchased_count > 0) {
                upsell_performance_details.upsell_added = parseInt(upsell_performance_details?.upsell_added) + 1;
            }

            // Purchased Upsell
            upsell_performance_details.upsell_purchased += parseInt(upsell_performance?.purchased_count || 0.00)
        }

        /////////////////////////////////////////// Get CartPerformance Metrics
        let cart_performances = await models.CartPerformance.findAll({
            where: {
                store_id: store_id,
                created_at: {
                    [Sq.Op.between]: [startDate, endDate]
                },
            },
        });
        let cart_performance = { email_recovery_count: 0.00 };
        if (cart_performances && cart_performances.length) {
            cart_performances.forEach(async (cartPerformance) => {
                let purchaseAmount = parseFloat(cartPerformance?.purchased_amount || 0.00)
                cart_performance.email_recovery_count += purchaseAmount;
            })
        }

        /////////////////////////////////////////// Get Checkout Metrics

        let checkout_data = await models.Checkouts.findAll({
            where: {
                shop_id: store_id,
                updated_at: {
                    [Sq.Op.between]: [startDate, endDate]
                },
            },
        });

        let checkout_detail = {
            completed_checkout: 0,
            reached_checkout: 0,
            all_checkout: 0
        };
        let not_purchased_cart = []
        if (checkout_data && checkout_data.length) {
            checkout_detail.all_checkout = checkout_data.length
            checkout_data.forEach(async (checkout) => {
                let purchased_count = checkout?.is_purchase ? 1 : 0
                checkout_detail.completed_checkout += parseInt(purchased_count)
                checkout_detail.reached_checkout += !checkout?.is_purchase && checkout.reached_checkout ? 1 : 0
                if (!checkout?.is_purchase) {
                    not_purchased_cart.push(checkout.id)
                }
                if (!checkout?.is_purchase && checkout.reached_checkout === null) {
                    let cart_exist = await models.Cart.findAll({
                        where: {
                            store_id: store_id,
                            checkout_id: checkout.id,
                        },
                    });
                    if (!cart_exist.length) {
                        checkout_detail.all_checkout -= 1;
                    }
                }
            })
        }

        /////////////////////////////////////////// Get Cart Metrics
        let cart_data = await models.Cart.findAll({
            where: {
                store_id: store_id,
                checkout_id: { [Sq.Op.in]: not_purchased_cart },
                created_at: {
                    [Sq.Op.between]: [startDate, endDate]
                },
            },
        });

        let all_cart = await models.Cart.findAll({
            where: {
                store_id: store_id,
                created_at: {
                    [Sq.Op.between]: [startDate, endDate]
                },
            },
        });

        return res.json({
            store_id: store_id,

            customize_checkout: customize_checkout,
            money_format: customize_checkout?.money_format ? customize_checkout?.money_format.substring(0, 1) : "$",

            cart_data: cart_data,
            all_cart: all_cart,
            checkout_detail: checkout_detail,
            cart_performance: cart_performance,
            upsell_performance: upsell_performance_details,
        });
    } catch (error) {
        console.error("dashboard_filter error -------", error);
        return res.json({
            status: false,
            message: error?.message ? error.message : "Something went wrong. Please try again.",
        });
    }
}