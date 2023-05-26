"use strict";

const Sq = require("sequelize");
const sequelize = require("../dbconfig");

const Cart = require("./Cart");
const AbandonedCheckouts = require("./AbandonedCheckouts");
const Orders = require("./Orders");
const ShippingRates = require("./ShippingRates");
const Taxes = require("./Taxes");

const Checkouts = sequelize.define(
    "checkouts",
    {
        id: {
            primaryKey: true,
            type: Sq.INTEGER,
            autoIncrement: true,
        },
        checkout_uuid: {
            allowNull: false,
            type: Sq.UUID,
            defaultValue: Sq.literal("uuid_generate_v4()"),
        },
        shop_id: {
            type: Sq.UUID,
        },
        cart_token: {
            defaultValue: null,
            type: Sq.STRING,
        },
        customer_id: {
            defaultValue: null,
            type: Sq.INTEGER,
        },
        reached_checkout: {
            defaultValue: null,
            type: Sq.INTEGER,
        },
        subtotal: {
            defaultValue: null,
            type: Sq.DECIMAL,
        },
        price: {
            defaultValue: null,
            type: Sq.DECIMAL,
        },
        shipping_rate_id: {
            defaultValue: null,
            type: Sq.INTEGER,
        },
        shipping_rate_amount: {
            defaultValue: null,
            type: Sq.DECIMAL,
        },
        tax_rate_id: {
            defaultValue: null,
            type: Sq.INTEGER,
        },
        tax_rate_percentage: {
            type: Sq.DECIMAL,
            defaultValue: null,
        },
        tax_rate_amount: {
            defaultValue: null,
            type: Sq.DECIMAL,
        },
        discount_source: {
            defaultValue: null,
            type: Sq.STRING,
        },
        discount_id: {
            defaultValue: null,
            type: Sq.BIGINT,
        },
        discount_title: {
            defaultValue: null,
            type: Sq.STRING,
        },
        discount_amount: {
            defaultValue: null,
            type: Sq.DECIMAL,
        },
        discount_type: {
            defaultValue: null,
            type: Sq.STRING,
        },
        is_purchase: {
            defaultValue: false,
            type: Sq.BOOLEAN,
        },
        revenue_charge: {
            defaultValue: false,
            type: Sq.BOOLEAN,
        },
    },
    {
        timestamps: true,
        freezeTableName: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

module.exports = Checkouts;

Checkouts.hasMany(Cart, {
    foreignKey: "checkout_id",
});

Checkouts.hasOne(Orders, {
    foreignKey: "checkout_id",
});

Checkouts.hasOne(AbandonedCheckouts, {
    foreignKey: "checkout_id",
});

Checkouts.hasOne(ShippingRates, {
    as: "shipping_rate",
    sourceKey: "shipping_rate_id",
    foreignKey: "id",
});

Checkouts.hasOne(Taxes, {
    as: "taxes",
    sourceKey: "tax_rate_id",
    foreignKey: "id",
});