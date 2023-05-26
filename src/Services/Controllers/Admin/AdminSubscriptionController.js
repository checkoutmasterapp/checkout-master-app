const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const models = require("../../models");
const { SubscriptionProducts, SubscriptionPackage } = require("../../models");

module.exports.get_product = async (req, res, next) => {
    await SubscriptionProducts.findAll({
        attributes: ["id", "object_id", "name", "description"],
    })
        .then(async function (response) {
            return res.json({
                status: true,
                data: response,
            });
        })
        .catch((error) => {
            console.log("get_product error-----------", error);
            return res.json({
                error: error,
                status: false,
                message: "Something went wrong. Please try again.",
            });
        });
};

module.exports.create_product = async (req, res, next) => {
    const request_body = req.body;
    const auth_user = req.auth_user;

    try {
        let stripe_product = await stripe.products.create({
            name: request_body.name,
            description: request_body.description,
        });
        console.log("s stripe_product-----------", stripe_product);

        await SubscriptionProducts.create({
            object_id: response.id,
            name: request_body.name,
            description: request_body.description
        });
    } catch (error) {
        console.error("create_product error -------------", error);
        return res.json({
            status: false,
            message: error?.message ? error.message : "Something went wrong. Please try again.",
        });
    }
};

module.exports.get_subscription_packages = async (req, res, next) => {
    await SubscriptionPackage.findAll({
        order: [["id", "ASC"]],
        attributes: ["id", "subscription_product_id", "package_name", "billing_cycle", "price"],
    })
        .then(function (response) {
            return res.json({
                status: true,
                data: response,
            });
        })
        .catch((error) => {
            console.log("get_subscription_packages error-----------", error);
            return res.json({
                status: false,
                message: error?.message ? error.message : "Something went wrong. Please try again.",
            });
        });
};

module.exports.create_subscription_packages = async (req, res, next) => {
    const request_body = req.body;
    const auth_user = req.auth_user;

    try {
        let subscription_product = await SubscriptionProducts.findOne({
            where: {
                id: request_body.subscription_product_id,
            },
        });
        if (subscription_product) {

            let stripe_package = await stripe.prices.create({
                currency: "usd",
                product: subscription_product?.object_id,
                unit_amount: request_body.price * 100,
                nickname: request_body.package_name,
                recurring: { interval: request_body.billing_cycle },
            });
            console.log("create_subscription_packages stripe_package-------", stripe_package);

            let subscription_package = {
                stript_object_id: stripe_package.id,
                stript_object_type: stripe_package.object,

                price: request_body.price,
                subscription_product_id: request_body.subscription_product_id,
                package_name: request_body.package_name,
                package_description: request_body?.package_description,
                billing_cycle: request_body.billing_cycle,
            };
            console.log("create_subscription_packages subscription_package-------", subscription_package);
            // await SubscriptionPackage.create(subscription_package)

        } else {
            return res.json({
                status: false,
                message: "Bad request",
            });
        }
    } catch (error) {
        console.error("create_subscription_packages error -------------", error);
        return res.json({
            status: false,
            message: error?.message ? error.message : "Something went wrong. Please try again.",
        });
    }
};

module.exports.create_subscription_addon = async (req, res, next) => {
    const request_body = req.body;
    const { auth_user, auth_store } = req;

    try {
        let stripe_product_id = "prod_NLI1irvZd4GR1V";

        await stripe.prices.create({
            currency: "usd",
            product: stripe_product_id,
            nickname: request_body.addon_name,
            unit_amount: request_body.price * 100,
        }).then(async function (response) {
            return res.json({
                status: true,
                data: response,
            });
        }).catch((error) => {
            console.log("create_subscription_addon error -----------------", error);
            return res.json({
                error: error,
                status: false,
                message: "Something went wrong. Please try again.",
            });
        });
    } catch (error) {
        console.log("create_subscription_addon error----------", error);
        return res.json({
            status: false,
            message: "Something went wrong. Please try again.",
        });
    }
};

module.exports.create_subscription = async (req, res, next) => {
    const request_body = req.body;

    try {

        //////////////////////////////////// Create Stripe Product
        const stripe_product = await stripe.products.create({
            name: request_body?.package_name,
        });

        let subscription_product = await models.SubscriptionProducts.create({
            object_id: stripe_product.id,
            name: stripe_product.name,
            description: request_body?.description,
        });


        //////////////////////////////////// Create Stripe Price (flat rate + metered usage)
        const stripe_flat_price = await stripe.prices.create({
            product: stripe_product?.id,
            unit_amount: parseFloat(request_body?.package_price) * 100,
            currency: "usd",
            recurring: {
                interval: request_body?.billing_cycle,
            },
        });

        const stripe_metered_price = await stripe.prices.create({
            nickname: `${request_body?.package_name} metered plan`,
            product: stripe_product?.id,
            unit_amount: parseFloat(request_body?.revenue_amount) * 100,
            currency: "usd",
            recurring: {
                interval: request_body?.billing_cycle,
                usage_type: "metered",
            },
        });

        let subscription_package = {
            stript_object_id: stripe_flat_price.id,
            stript_object_type: stripe_flat_price.object,

            subscription_product_id: subscription_product?.id,

            package_name: request_body?.package_name,
            price: request_body?.package_price,
            billing_cycle: request_body?.billing_cycle,
            package_description: request_body?.package_description,

            stripe_metered_price_id: stripe_metered_price?.id,
        };
        await SubscriptionPackage.create(subscription_package)

        return res.json({ status: true, message: "Subscription created" });
    } catch (error) {
        console.error("create_subscription error -------------", error);
        return res.json({
            status: false,
            message: error?.message ? error.message : "Something went wrong. Please try again.",
        });
    }
}