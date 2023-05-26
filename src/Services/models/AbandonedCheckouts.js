"use strict";

const Sq = require("sequelize");
const sequelize = require("../dbconfig");

const AbandonedCheckouts = sequelize.define(
    "abandoned_checkouts",
    {
        id: {
            primaryKey: true,
            type: Sq.INTEGER,
            autoIncrement: true,
        },
        shop_id: {
            type: Sq.UUID,
        },
        cart_token: {
            defaultValue: null,
            type: Sq.STRING,
        },
        checkout_id: {
            type: Sq.INTEGER,
            references: {
                key: "id",
                model: "checkouts",
            },
        },
        first_name: {
            type: Sq.STRING,
            defaultValue: null,
        },
        last_name: {
            type: Sq.STRING,
            defaultValue: null,
        },
        email: {
            type: Sq.STRING,
            defaultValue: null,
        },
        phone: {
            type: Sq.STRING,
            defaultValue: null,
        },
    },
    {
        paranoid: false,
        timestamps: true,
        freezeTableName: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
)

module.exports = AbandonedCheckouts;