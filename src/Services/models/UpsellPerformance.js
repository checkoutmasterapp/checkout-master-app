"use strict";

const Sq = require("sequelize");
const sequelize = require("../dbconfig");

const UpsellPerformance = sequelize.define(
    "upsell_performance",
    {
        id: {
            type: Sq.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        upsell_performance_uuid: {
            allowNull: false,
            primaryKey: true,
            type: Sq.UUID,
            defaultValue: Sq.UUIDV4,
        },
        customer_id: {
            type: Sq.INTEGER,
            references: {
                key: "id",
                model: "customers",
            },
        },
        store_id: {
            type: Sq.UUID,
            references: {
                key: "id",
                model: "stores",
            },
        },
        upsell_id: {
            type: Sq.INTEGER,
            references: {
                key: "id",
                model: "upsell",
            },
        },
        parent_order_id: {
            type: Sq.INTEGER,
            references: {
                key: "id",
                model: "orders",
            },
            onDelete: "cascade",
            onUpdate: "cascade",
        },
        order_id: {
            defaultValue: null,
            type: Sq.INTEGER,
        },
        purchased_count: {
            defaultValue: 0,
            type: Sq.INTEGER,
        },
        upsell_revenue: {
            defaultValue: 0,
            type: Sq.DECIMAL,
        },
    },
    {
        timestamps: true,
        freezeTableName: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
        deletedAt: "deleted_at",
    }
);

module.exports = UpsellPerformance;