"use strict";

const fs = require("fs");
const Sq = require("sequelize");
const moment = require("moment");
const sequelize = require("../dbconfig");

const Users = require("./Users");
const UserSubscriptions = require("./UserSubscriptions");
const SubscriptionPackage = require("./SubscriptionPackage");

const Translations = require("./Translations");
const CheckoutTemplates = require("./CheckoutTemplates");
const CustomizeCheckout = require("./CustomizeCheckout");

const { ChangeLanguage } = require("../../libs/Helper");

const Stores = sequelize.define(
    "stores",
    {
        id: {
            allowNull: false,
            primaryKey: true,
            type: Sq.UUID,
            defaultValue: Sq.UUIDV4,
        },
        user_id: Sq.INTEGER,
        store_type: {
            defaultValue: "shopify",
            type: Sq.ENUM("shopify", "woocommerce"),
        },
        store_name: {
            defaultValue: null,
            type: Sq.STRING,
        },
        store_domain: {
            defaultValue: null,
            type: Sq.STRING,
        },
        store_token: {
            defaultValue: null,
            type: Sq.STRING,
        },
        store_currency: {
            defaultValue: null,
            type: Sq.STRING,
        },
        money_format: {
            defaultValue: null,
            type: Sq.STRING,
        },
        store_status: {
            defaultValue: false,
            type: Sq.BOOLEAN,
        },
        user_subscription_id: {
            defaultValue: null,
            type: Sq.INTEGER,
        },
        shipping_rate: {
            defaultValue: false,
            type: Sq.BOOLEAN,
        },
        payment_method: {
            defaultValue: false,
            type: Sq.BOOLEAN,
        },
        customize_checkout_preview: {
            defaultValue: false,
            type: Sq.BOOLEAN,
        },
        customize_checkout_publish: {
            defaultValue: false,
            type: Sq.BOOLEAN,
        },
        customize_checkout_publish_email_flow: {
            defaultValue: 0,
            type: Sq.INTEGER,
        }
    },
    {
        paranoid: true,
        timestamps: true,
        freezeTableName: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
        deletedAt: "deleted_at",
    }
);

module.exports = Stores;

Stores.belongsTo(Users, {
    foreignKey: "user_id",
});

Stores.beforeDestroy(async (response, options) => {
    console.log("Stores.beforeDestroy response ---------", response);

    await Translations.destroy({
        where: {
            store_id: response?.id,
        },
        individualHooks: true,
    });

    await CustomizeCheckout.destroy({
        where: {
            store_id: response?.id,
        },
        individualHooks: true,
    });

    await UserSubscriptions.destroy({
        where: {
            store_id: response?.id,
        },
        individualHooks: true,
    });
});

Stores.afterCreate(async (response, options) => {
    let store_id = response?.id;

    ////////////////////// Create Dummy store Subscription Start
    // let subscription_package = await SubscriptionPackage.findOne({
    //     where: { is_freetrail: true },
    // });

    // let start_date = moment().format("YYYY-MM-DD");
    // let end_date = moment(start_date).add(1, subscription_package.billing_cycle).format("YYYY-MM-DD");

    // let user_subscription = await UserSubscriptions.create({
    //     user_id: response?.user_id,
    //     store_id: response?.id,
    //     subscription_package_id: subscription_package?.id,
    //     start_date: start_date,
    //     end_date: end_date,
    //     status: true
    // });

    let user_subscription = await UserSubscriptions.findOne({
        where: {
            user_id: response?.user_id,
        },
    });

    await Stores.update(
        {
            user_subscription_id: user_subscription?.id,
            updated_by: response?.user_id,
        },
        {
            where: {
                id: response?.id,
            },
        }
    );

    ////////////////////// Create checkout template css Start
    let checkout_template = await CheckoutTemplates.findOne();

    let template_code = checkout_template?.template_code;
    let replace_parametars = {
        font_size: `${checkout_template?.font_size}px`,
        accent_color: checkout_template?.accent_color,
        button_color: checkout_template?.button_color,
        error_color: checkout_template?.error_color,
    };

    let checkout_template_css = await fs.readFileSync(`${appRoot}/public/assets/css/checkout-template/checkout-template-${template_code}-dummy.css`, "utf8");
    checkout_template_css = checkout_template_css.replace(/font_size|accent_color|button_color|error_color/gi, function (matched) {
        return replace_parametars[matched];
    });

    let checkout_template_writeStream = await fs.createWriteStream(`${appRoot}/public/assets/css/store-css/checkout-template-${store_id}.css`);
    checkout_template_writeStream.write(checkout_template_css);
    checkout_template_writeStream.end();

    let checkout_thankyou_css = await fs.readFileSync(`${appRoot}/public/assets/css/checkout-template/checkout-thankyou-${template_code}-dummy.css`, "utf8");
    checkout_thankyou_css = checkout_thankyou_css.replace(/font_size|accent_color|button_color|error_color/gi, function (matched) {
        return replace_parametars[matched];
    });

    let checkout_thankyou_writeStream = await fs.createWriteStream(`${appRoot}/public/assets/css/store-css/checkout-thankyou-${store_id}.css`);
    checkout_thankyou_writeStream.write(checkout_thankyou_css);
    checkout_thankyou_writeStream.end();

    ////////////////////// Create CustomizeCheckout default value Against the store
    await CustomizeCheckout.create({
        user_id: response?.user_id,
        store_id: response?.id,

        template_id: checkout_template?.id,
        template_code: checkout_template?.template_code,

        font_size: checkout_template?.font_size,
        accent_color: checkout_template?.accent_color,
        button_color: checkout_template?.button_color,
        error_color: checkout_template?.error_color,

        require_phone_number: true,
        require_address_number: true,
        check_accepts_marketing: true,
        display_timer: true,
        display_branding: true,
        display_discount: true,
    });

    ////////////////////// Create Translations default value Against the store
    let default_language = await ChangeLanguage("english");
    default_language = {
        ...default_language,
        user_id: response?.user_id,
        store_id: response?.id,
        translation_language: "english",
    };
    await Translations.create(default_language);
});