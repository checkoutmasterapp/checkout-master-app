"use strict";

const Sq = require("sequelize");
const sequelize = require("../dbconfig");

const CartPerformance = sequelize.define(
    "cart_performance",
    {
        id: {
            type: Sq.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        cart_performance_uuid: {
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
        cart_recovery_id: {
            type: Sq.INTEGER,
            references: {
                key: "id",
                model: "cart_recovery_emails",
            },
        },
        lastSentFor:{
            defaultValue: null,
            type: Sq.STRING,
        },
        store_id: {
            type: Sq.UUID,
            references: {
                key: "id",
                model: "stores",
            },
        },
        checkout_id: {
            type: Sq.INTEGER,
            references: {
                key: "id",
                model: "checkouts",
            },
        },
        
        sent_time:{
            defaultValue: null,
            type: Sq.INTEGER,
        },
        time_clicked:{
            defaultValue: null,
            type: Sq.INTEGER,
        },
        purchased_amount:{
            defaultValue: null,
            type: Sq.DECIMAL,
        },
        purchased_time:{
            defaultValue: null,
            type: Sq.INTEGER,
        }
    },
    {
        timestamps: true,
        freezeTableName: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
        deletedAt: "deleted_at",
    }
    );

module.exports = CartPerformance;