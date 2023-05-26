"use strict";

const Sq = require("sequelize");
const sequelize = require("../dbconfig");

const Countries = sequelize.define(
    "countries",
    {
        id: {
            type: Sq.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        country_name: {
            defaultValue: null,
            type: Sq.STRING,
        },
        country_code3: {
            defaultValue: null,
            type: Sq.STRING,
        },
        country_code: {
            defaultValue: null,
            type: Sq.STRING,
        },
        currency: {
            defaultValue: null,
            type: Sq.STRING,
        },
        currency_name: {
            defaultValue: null,
            type: Sq.STRING,
        },
        currency_symbol: {
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

module.exports = Countries;