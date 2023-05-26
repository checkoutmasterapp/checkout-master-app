const Sq = require("sequelize");
const sequelize = require("../dbconfig");

const Users = require("./Users");

const UserSubscriptionCardDetails = sequelize.define(
    "user_subscription_card_details",
    {
        id: {
            primaryKey: true,
            type: Sq.INTEGER,
            autoIncrement: true,
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
        stripe_customer_id: {
            defaultValue: null,
            type: Sq.TEXT,
        },
        stripe_card_id: {
            defaultValue: null,
            type: Sq.TEXT,
        },
        stripe_card_last4: {
            defaultValue: null,
            type: Sq.TEXT,
        },
        exp_month: {
            defaultValue: null,
            type: Sq.TEXT,
        },
        exp_year: {
            defaultValue: null,
            type: Sq.TEXT,
        },
        stripe_card_brand: {
            defaultValue: null,
            type: Sq.TEXT,
        },
        is_default: {
            type: Sq.BOOLEAN,
            defaultValue: true,
        },
    },
    {
        timestamps: true,
        freezeTableName: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

module.exports = UserSubscriptionCardDetails;