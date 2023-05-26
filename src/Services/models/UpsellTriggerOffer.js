"use strict";

const Sq = require("sequelize");
const sequelize = require("../dbconfig");

const UpsellTriggerOffer = sequelize.define(
    "upsell_trigger_offer",
    {
        id: {
            type: Sq.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        upsell_trigger_offer_uuid: {
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
        product_id: {
            defaultValue: null,
            type: Sq.STRING,
        },
        product_varient_id: {
            defaultValue: null,
            type: Sq.STRING,
        },
        sort_order: {
            defaultValue: 0,
            type: Sq.INTEGER,
        },
        product_title: {
            defaultValue: null,
            type: Sq.STRING,
        },
        product_image: {
            defaultValue: null,
            type: Sq.TEXT,
        },
        product_description: {
            defaultValue: null,
            type: Sq.TEXT,
        },
        product_price: {
            defaultValue: null,
            type: Sq.STRING,
        },
        compare_at_price: {
            defaultValue: null,
            type: Sq.STRING,
        },
        product_quantity: {
            defaultValue: null,
            type: Sq.STRING,
        },
        product_variants: {
            defaultValue: null,
            type: Sq.JSON,
        },
        product_variant_count: {
            defaultValue: null,
            type: Sq.STRING,
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

module.exports = UpsellTriggerOffer;