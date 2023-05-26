"use strict";

const Sq = require("sequelize");
const sequelize = require("../dbconfig");

const CheckoutTemplates = sequelize.define(
    "checkout_templates",
    {
        id: {
            primaryKey: true,
            type: Sq.INTEGER,
            autoIncrement: true,
        },
        template_code: {
            defaultValue: null,
            type: Sq.STRING,
        },
        template_name: {
            defaultValue: null,
            type: Sq.STRING,
        },
        sort_order: {
            defaultValue: 0,
            type: Sq.INTEGER,
        },
        font_size: {
            defaultValue: null,
            type: Sq.STRING,
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
    },
    {
        timestamps: true,
        freezeTableName: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

module.exports = CheckoutTemplates;