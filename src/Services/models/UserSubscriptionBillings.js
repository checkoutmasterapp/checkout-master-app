const Sq = require("sequelize");
const sequelize = require("../dbconfig");

const Users = require("./Users");

const UserSubscriptionBillings = sequelize.define(
    "user_subscription_billings",
    {
        id: {
            primaryKey: true,
            type: Sq.INTEGER,
            autoIncrement: true,
        },
        user_subscription_billing_uuid: {
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
        card_detail_id: {
            type: Sq.INTEGER,
            references: {
                key: "id",
                model: "user_subscription_card_details",
            },
        },
        stripe_subscription_id: {
            defaultValue: null,
            type: Sq.TEXT,
        },
        stripe_customer_id: {
            defaultValue: null,
            type: Sq.TEXT,
        },
        stripe_card_id: {
            defaultValue: null,
            type: Sq.TEXT,
        },
        stripe_invoice_id: {
            defaultValue: null,
            type: Sq.TEXT,
        },
        stripe_invoice_number: {
            defaultValue: null,
            type: Sq.TEXT,
        },
        stripe_invoice_pdf: {
            defaultValue: null,
            type: Sq.TEXT,
        },
        status: Sq.ENUM("Pending", "Active", "incomplete", "Inactive"),
        billing_cycle: Sq.ENUM("day", "week", "month", "year"),
        price: {
            defaultValue: null,
            type: Sq.DECIMAL,
        },
        revenue_amount: {
            defaultValue: null,
            type: Sq.DECIMAL,
        },
        start_date: Sq.DATE,
        end_date: Sq.DATE,
        created_by: Sq.INTEGER,
        updated_by: Sq.INTEGER,
    },
    {
        timestamps: true,
        freezeTableName: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

module.exports = UserSubscriptionBillings;