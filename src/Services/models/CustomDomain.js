"use strict";

const Sq = require("sequelize");
const sequelize = require("../dbconfig");

const CustomDomainSSL = require("./CustomDomainSSL");

const CustomDomain = sequelize.define(
    "custom_domain",
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
        subdomain_name: {
            defaultValue: null,
            type: Sq.STRING,
        },
        domain_name: {
            defaultValue: null,
            type: Sq.STRING,
        },
        custom_domain: {
            defaultValue: null,
            type: Sq.STRING,
        },
        verification_status: {
            defaultValue: "awaiting",
            type: Sq.ENUM("awaiting", "pending", "success", "cancel"),
        },
    },
    {
        timestamps: true,
        freezeTableName: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

module.exports = CustomDomain;

CustomDomain.hasMany(CustomDomainSSL, {
    as: "custom_domain_ssl",
    foreignKey: "custom_domain_id",
});