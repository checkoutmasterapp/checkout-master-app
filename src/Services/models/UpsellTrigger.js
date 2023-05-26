"use strict";

const Sq = require("sequelize");
const sequelize = require("../dbconfig");

const UpsellTrigger = sequelize.define(
    "upsell_trigger",
    {
        id: {
            type: Sq.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        upsell_trigger_uuid: {
            allowNull: false,
            primaryKey: true,
            type: Sq.UUID,
            defaultValue: Sq.UUIDV4,
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
        upsell_id: {
            type: Sq.INTEGER,
            references: {
                key: "id",
                model: "upsell",
            },
        },
        trigger_type: {
            defaultValue: "product",
            type: Sq.ENUM("product", "category"),
        },
        trigger_id: {
            defaultValue: null,
            type: Sq.STRING,
        },
        trigger_title: {
            defaultValue: null,
            type: Sq.STRING,
        },
        trigger_image: {
            defaultValue: null,
            type: Sq.TEXT,
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

module.exports = UpsellTrigger;