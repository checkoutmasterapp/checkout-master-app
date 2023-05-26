"use strict";

const Sq = require("sequelize");
const sequelize = require("../dbconfig");

const CartRecoveryEmails = sequelize.define(
    "cart_recovery_emails",
    {
        id: {
            type: Sq.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        cart_recovery_uuid: {
            allowNull: false,
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
        cart_recovery_schedule_time: {
            type: Sq.STRING,
            defaultValue: null,
        },
        cart_recovery_email_subject: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        cart_recovery_email_title: {
            type: Sq.TEXT,
            defaultValue: false,
        },
        cart_recovery_email_body: {
            type: Sq.TEXT,
            defaultValue: false,
        },
        cart_recovery_action_button_title: {
            type: Sq.TEXT,
            defaultValue: false,
        },
        cart_recovery_footer_text: {
            type: Sq.TEXT,
            defaultValue: false,
        },
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

module.exports = CartRecoveryEmails;
