"use strict";

const Sq = require("sequelize");
const sequelize = require("../dbconfig");

const Users = require("./Users");
// const CountryCodes = require("./CountryCodes");

const ShippingRates = sequelize.define(
    "shipping_rates",
    {
        id: {
            primaryKey: true,
            type: Sq.INTEGER,
            autoIncrement: true,
        },
        user_id: Sq.INTEGER,
        store_id: {
            type: Sq.UUID,
            references: {
                key: "id",
                model: "stores",
            },
        },
        shipping_rate_name: Sq.STRING,
        shipping_rate_price: {
            type: Sq.DECIMAL,
            defaultValue: null,
        },
        shipping_rate_min_amount: {
            type: Sq.DECIMAL,
            defaultValue: null,
        },
        shipping_rate_max_amount: {
            type: Sq.DECIMAL,
            defaultValue: null,
        },
        shipping_rate_min_weight: {
            type: Sq.DECIMAL,
            defaultValue: null,
        },
        shipping_rate_max_weight: {
            type: Sq.DECIMAL,
            defaultValue: null,
        },
        country_codes: {
            type: Sq.ARRAY(Sq.TEXT),
            defaultValue: null,
        },
        created_by: Sq.INTEGER,
        updated_by: Sq.INTEGER,
        deleted_by: Sq.INTEGER,
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

module.exports = ShippingRates;

ShippingRates.belongsTo(Users, {
    foreignKey: "user_id",
});