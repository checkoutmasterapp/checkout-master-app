const Sq = require("sequelize");
const sequelize = require("../dbconfig");

const SubscriptionPackage = require("./SubscriptionPackage");

const UserSubscriptions = sequelize.define(
    "user_subscriptions",
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
        subscription_package_id: {
            type: Sq.INTEGER,
            references: {
                key: "id",
                model: "subscription_packages",
            },
        },
        // stripe_payment_id: {
        //     defaultValue: null,
        //     type: Sq.TEXT,
        // },
        // stripe_invoice_number: {
        //     defaultValue: null,
        //     type: Sq.TEXT,
        // },
        billing_id: Sq.INTEGER,
        billing_cycle: Sq.ENUM("day", "week", "month", "year"),
        // price: Sq.STRING,
        start_date: Sq.DATE,
        end_date: Sq.DATE,
        status: {
            type: Sq.BOOLEAN,
            defaultValue: false,
        },
        is_expired: {
            type: Sq.BOOLEAN,
            defaultValue: false,
        },
        created_by: Sq.INTEGER,
        updated_by: Sq.INTEGER,
    },
    {
        timestamps: true,
        freezeTableName: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
        deletedAt: "deleted_at",
    }
);

module.exports = UserSubscriptions;

UserSubscriptions.belongsTo(SubscriptionPackage, {
    as: "subscription_package",
    foreignKey: "subscription_package_id",
});
