"use strict";

const Sq = require("sequelize");
const sequelize = require("../dbconfig");

const TempSubscription = sequelize.define(
    "temp_subscription",
    {
        id: {
            type: Sq.INTEGER,
            autoIncrement: true,
            primaryKey: true,
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
        subscription_id: {
            defaultValue: null,
            type: Sq.STRING,
        },
        request_body: {
            defaultValue: null,
            type: Sq.JSON,
        },
        package_detail: {
            defaultValue: null,
            type: Sq.JSON,
        },
    },
    {
        timestamps: true,
        freezeTableName: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

module.exports = TempSubscription;

