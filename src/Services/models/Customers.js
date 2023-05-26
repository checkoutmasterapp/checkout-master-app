"use strict";

const Sq = require("sequelize");
const sequelize = require("../dbconfig");

const UserSubscriptions = require("./UserSubscriptions");

const Customers = sequelize.define(
    "customers",
    {
        id: {
            type: Sq.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        store_id: {
            type: Sq.UUID,
            references: {
                key: "id",
                model: "stores",
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
        shopify_customer_id: {
            defaultValue: null,
            type: Sq.STRING,
        },
        stripe_customer_id: {
            defaultValue: null,
            type: Sq.STRING,
        },
        revolut_customer_id: {
            defaultValue: null,
            type: Sq.STRING,
        },
        checkout_customer_id: {
            defaultValue: null,
            type: Sq.STRING,
        },
        payout_master_customer_id: {
            defaultValue: null,
            type: Sq.STRING,
        },
    },
    {
        timestamps: true,
        freezeTableName: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

module.exports = Customers;