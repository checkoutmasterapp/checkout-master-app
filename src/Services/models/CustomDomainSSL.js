"use strict";

const Sq = require("sequelize");
const sequelize = require("../dbconfig");

const CustomDomainSSL = sequelize.define(
    "custom_domain_ssl",
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
        custom_domain_id: {
            type: Sq.INTEGER,
            references: {
                key: "id",
                model: "custom_domain",
            },
            onDelete: "cascade",
            onUpdate: "cascade",
        },
        start_date: Sq.DATE,
        end_date: Sq.DATE,
    },
    {
        timestamps: true,
        freezeTableName: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

module.exports = CustomDomainSSL;