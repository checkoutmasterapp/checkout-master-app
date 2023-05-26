"use strict";

const Sq = require("sequelize");
const sequelize = require("../dbconfig");

const Checkouts = require("./Checkouts");

const Cart = sequelize.define(
    "carts",
    {
        id: {
            type: Sq.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        checkout_id: {
            type: Sq.INTEGER,
            references: {
                key: "id",
                model: "checkouts",
            },
        },
        store_id: {
            type: Sq.UUID,
            references: {
                key: "id",
                model: "stores",
            },
        },
        cart_token: {
            defaultValue: null,
            type: Sq.STRING,
        },
        product_id: {
            defaultValue: null,
            type: Sq.STRING,
        },
        variant_id: {
            defaultValue: null,
            type: Sq.STRING,
        },
        title: {
            defaultValue: null,
            type: Sq.STRING,
        },
        variant_title: {
            defaultValue: null,
            type: Sq.STRING,
        },
        description: {
            defaultValue: null,
            type: Sq.STRING,
        },
        image: {
            defaultValue: null,
            type: Sq.STRING,
        },
        price: {
            defaultValue: null,
            type: Sq.DECIMAL,
        },
        product_weight: {
            defaultValue: null,
            type: Sq.STRING,
        },
        quantity: {
            defaultValue: null,
            type: Sq.INTEGER,
        },
    },
    {
        timestamps: true,
        freezeTableName: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

module.exports = Cart;

// Cart.belongsTo(Checkouts, {
// foreignKey: "checkout_id",
// });