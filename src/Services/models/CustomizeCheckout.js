"use strict";

const Sq = require("sequelize");
const sequelize = require("../dbconfig");

const Users = require("./Users");
const CustomizeAboutSections = require("./CustomizeAboutSections");

const CustomizeCheckouts = sequelize.define(
    "customize_checkouts",
    {
        id: {
            type: Sq.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        user_id: Sq.INTEGER,
        store_id: {
            type: Sq.UUID,
            references: {
                key: "id",
                model: "stores",
            },
            onDelete: "cascade",
            onUpdate: "cascade",
        },
        template_id: {
            defaultValue: null,
            type: Sq.INTEGER,
        },
        template_code: {
            defaultValue: null,
            type: Sq.STRING,
        },
        money_format: {
            defaultValue: null,
            type: Sq.STRING,
        },
        store_logo: {
            defaultValue: null,
            type: Sq.TEXT,
        },
        favicon: {
            defaultValue: null,
            type: Sq.TEXT,
        },
        security_badge: {
            defaultValue: null,
            type: Sq.TEXT,
        },
        accent_color: {
            defaultValue: null,
            type: Sq.STRING,
        },
        button_color: {
            defaultValue: null,
            type: Sq.STRING,
        },
        error_color: {
            defaultValue: null,
            type: Sq.STRING,
        },
        font_size: {
            defaultValue: null,
            type: Sq.INTEGER,
        },
        return_policy: {
            defaultValue: null,
            type: Sq.STRING,
        },
        privacy_policy: {
            defaultValue: null,
            type: Sq.STRING,
        },
        terms_condition: {
            defaultValue: null,
            type: Sq.STRING,
        },
        require_phone_number: {
            defaultValue: true,
            type: Sq.BOOLEAN,
        },
        require_address_number: {
            defaultValue: true,
            type: Sq.BOOLEAN,
        },
        check_accepts_marketing: {
            defaultValue: true,
            type: Sq.BOOLEAN,
        },
        display_timer: {
            defaultValue: true,
            type: Sq.BOOLEAN,
        },
        display_branding: {
            defaultValue: true,
            type: Sq.BOOLEAN,
        },
        display_discount: {
            defaultValue: true,
            type: Sq.BOOLEAN,
        },
        custom_script: {
            defaultValue: null,
            type: Sq.TEXT,
        },
        thankyou_description: {
            defaultValue: null,
            type: Sq.TEXT,
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

module.exports = CustomizeCheckouts;

CustomizeCheckouts.hasMany(CustomizeAboutSections, {
    foreignKey: "customize_checkout_id",
});

CustomizeCheckouts.belongsTo(Users, {
    foreignKey: "user_id",
});