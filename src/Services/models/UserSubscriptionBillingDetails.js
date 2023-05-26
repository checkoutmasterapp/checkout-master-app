const Sq = require("sequelize");
const sequelize = require("../dbconfig");

const Users = require("./Users");

const UserSubscriptionBillingDetails = sequelize.define(
    "user_subscription_billing_details",
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
        user_subscription_id: {
            type: Sq.INTEGER,
            references: {
                key: "id",
                model: "user_subscriptions",
            },
        },
        subscription_package_id: {
            type: Sq.INTEGER,
            references: {
                key: "id",
                model: "subscription_packages",
            },
        },
        billing_company: {
            defaultValue: true,
            type: Sq.STRING,
        },
        billing_first_name: {
            defaultValue: true,
            type: Sq.STRING,
        },
        billing_last_name: {
            defaultValue: true,
            type: Sq.STRING,
        },
        billing_address: {
            defaultValue: true,
            type: Sq.STRING,
        },
        billing_city: {
            defaultValue: true,
            type: Sq.STRING,
        },
        billing_zip: {
            defaultValue: true,
            type: Sq.STRING,
        },
        billing_state: {
            defaultValue: true,
            type: Sq.STRING,
        },
        billing_country_code: {
            defaultValue: true,
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

module.exports = UserSubscriptionBillingDetails;