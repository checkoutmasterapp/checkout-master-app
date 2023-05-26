"use strict";

const Sq = require("sequelize");
const sequelize = require("../dbconfig");

const CustomizeAboutSections = sequelize.define(
    "customize_about_sections",
    {
        id: {
            type: Sq.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        customize_checkout_id: {
            type: Sq.INTEGER,
            references: {
                key: "id",
                model: "customize_checkouts",
            },
        },
        store_id: {
            type: Sq.UUID,
            references: {
                key: "id",
                model: "stores",
            },
        },
        section_title: {
            defaultValue: null,
            type: Sq.STRING,
        },
        section_icon: {
            defaultValue: null,
            type: Sq.TEXT,
        },
        section_description: {
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

module.exports = CustomizeAboutSections;