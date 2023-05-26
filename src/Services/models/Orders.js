"use strict";

const Sq = require("sequelize");
const sequelize = require("../dbconfig");

const Orders = sequelize.define(
    "orders",
    {
        id: {
            type: Sq.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        order_uuid: {
            allowNull: false,
            type: Sq.UUID,
            defaultValue: Sq.UUIDV4,
        },
        shop_id: {
            type: Sq.UUID,
            // references: {
            //     key: "id",
            //     model: "stores",
            // },
        },
        customer_id: {
            type: Sq.INTEGER,
            references: {
                key: "id",
                model: "customers",
            },
        },
        checkout_id: {
            type: Sq.INTEGER,
            references: {
                key: "id",
                model: "checkouts",
            },
        },
        parent_order_id: {
            defaultValue: null,
            type: Sq.INTEGER,
        },
        parent_order_uuid: {
            defaultValue: null,
            type: Sq.UUID,
        },
        shopify_order_id: {
            defaultValue: null,
            type: Sq.STRING,
        },
        first_name: {
            defaultValue: null,
            type: Sq.STRING,
        },
        last_name: {
            defaultValue: null,
            type: Sq.STRING,
        },
        email: {
            type: Sq.STRING,
        },
        phone: {
            defaultValue: null,
            type: Sq.STRING,
        },
        address: {
            defaultValue: null,
            type: Sq.STRING,
        },
        zipcode: {
            defaultValue: null,
            type: Sq.STRING,
        },
        city: {
            defaultValue: null,
            type: Sq.STRING,
        },
        country: {
            defaultValue: null,
            type: Sq.STRING,
        },
        state: {
            defaultValue: null,
            type: Sq.STRING,
        },
        billing_status: {
            defaultValue: false,
            type: Sq.BOOLEAN,
        },
        billing_first_name: {
            defaultValue: null,
            type: Sq.STRING,
        },
        billing_last_name: {
            defaultValue: null,
            type: Sq.STRING,
        },
        billing_email: {
            type: Sq.STRING,
        },
        billing_phone: {
            defaultValue: null,
            type: Sq.STRING,
        },
        billing_address: {
            defaultValue: null,
            type: Sq.STRING,
        },
        billing_zipcode: {
            defaultValue: null,
            type: Sq.STRING,
        },
        billing_city: {
            defaultValue: null,
            type: Sq.STRING,
        },
        billing_country: {
            defaultValue: null,
            type: Sq.STRING,
        },
        billing_state: {
            defaultValue: null,
            type: Sq.STRING,
        },
        payment_method: {
            defaultValue: null,
            type: Sq.STRING,
        },
        payment_customer_id: {
            defaultValue: null,
            type: Sq.STRING,
        },
        payment_id: {
            defaultValue: null,
            type: Sq.STRING,
        },
        payment_response: {
            defaultValue: null,
            type: Sq.JSON,
        },
        card_token: {
            defaultValue: null,
            type: Sq.TEXT,
        },
        card_last4: {
            defaultValue: null,
            type: Sq.TEXT,
        },
        card_brand: {
            defaultValue: null,
            type: Sq.TEXT,
        },
        order_type: {
            defaultValue: null,
            type: Sq.STRING,
        },
        is_purchase: {
            defaultValue: false,
            type: Sq.BOOLEAN,
        },
        product_type: {
            defaultValue: null,
            type: Sq.TEXT,
        },
        buying_for: {
            defaultValue: null,
            type: Sq.TEXT,
        },
        giftee_email: {
            defaultValue: null,
            type: Sq.TEXT,
        },
        delivery_type: {
            defaultValue: null,
            type: Sq.TEXT,
        },
        delivery_date: {
            defaultValue: null,
            type: Sq.TEXT,
        },
        messeage_txt: {
            defaultValue: null,
            type: Sq.TEXT,
        },
    },
    {
        timestamps: true,
        freezeTableName: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

module.exports = Orders;

const Checkouts = require("./Checkouts");
const Customers = require("./Customers");
Orders.hasOne(Checkouts, {
    as: "checkout",
    sourceKey: "checkout_id",
    foreignKey: "id",
});

Orders.hasOne(Customers, {
    as: "customer",
    sourceKey: "customer_id",
    foreignKey: "id",
});

Orders.afterCreate(async (response, options) => {
    let checkout_id = await Checkouts.update(
        { is_purchase: true },
        {
            where: {
                id: response.checkout_id,
            },
        }
    );
});