"use strict";

const Sq = require("sequelize");
const sequelize = require("../dbconfig");

const StripeWebhookLogs = sequelize.define(
    "stripe_webhook_logs",
    {
        webhook_type: {
            defaultValue: null,
            type: Sq.STRING,
        },
        webhook_object: {
            defaultValue: null,
            type: Sq.JSON,
        },
        webhook_event: {
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

module.exports = StripeWebhookLogs;