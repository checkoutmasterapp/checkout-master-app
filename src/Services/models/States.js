"use strict";

const Sq = require("sequelize");
const sequelize = require("../dbconfig");
const Countries = require("./Countries");

const States = sequelize.define(
    "states",
    {
        id: {
            type: Sq.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        state_name: {
            defaultValue: null,
            type: Sq.STRING,
        },
        country_id: {
            allowNull: false,
            type: Sq.INTEGER,
        },
        country_code: {
            defaultValue: null,
            type: Sq.STRING,
        },
        state_code: {
            defaultValue: null,
            type: Sq.STRING,
        },
        type: {
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


module.exports = States;