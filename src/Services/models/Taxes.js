"use strict";

const Sq = require("sequelize");
const sequelize = require("../dbconfig");

const Taxes = sequelize.define(
    "taxes",
    {
        id: {
            primaryKey: true,
            type: Sq.INTEGER,
            autoIncrement: true,
        },
        user_id: {
            type: Sq.INTEGER,
            references: {
                key: "id",
                model: "users",
            },
        },
        store_id: {
            type: Sq.UUID,
            references: {
                key: "id",
                model: "stores",
            },
        },
        tax_rate_name: Sq.STRING,
        tax_rate_percentage: {
            type: Sq.DECIMAL,
            defaultValue: null,
        },
        country_codes: {
            type: Sq.ARRAY(Sq.TEXT),
            defaultValue: null,
        },
        tax_preference_not_included: {
            type: Sq.BOOLEAN,
            defaultValue: false,
        },
        tax_preference_included: {
            type: Sq.BOOLEAN,
            defaultValue: false,
        },
        tax_preference_shipping_rate_charge: {
            type: Sq.BOOLEAN,
            defaultValue: false,
        },
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

module.exports = Taxes;