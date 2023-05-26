const Sq = require("sequelize");
const sequelize = require("../dbconfig");

const SubscriptionPackage = sequelize.define(
    "subscription_packages",
    {
        id: {
            primaryKey: true,
            type: Sq.INTEGER,
            autoIncrement: true,
        },
        stript_object_id: Sq.STRING,
        stript_object_type: Sq.STRING,
        stript_object_description: {
            type: Sq.STRING,
            defaultValue: null,
        },
        subscription_product_id: Sq.INTEGER,
        stripe_metered_price_id: {
            type: Sq.STRING,
            defaultValue: null,
        },

        package_name: Sq.STRING,
        package_description: Sq.STRING,
        billing_cycle: Sq.ENUM("day", "week", "month", "year"),
        price: Sq.DECIMAL,

        revenue_amount: Sq.DECIMAL,
        revenue_type: Sq.STRING,

        is_freetrail: {
            type: Sq.BOOLEAN,
            defaultValue: false,
        },
        is_active: {
            type: Sq.BOOLEAN,
            defaultValue: true,
        },
        created_by: Sq.INTEGER,
        updated_by: Sq.INTEGER,
        deleted_by: Sq.INTEGER,
    },
    {
        timestamps: true,
        freezeTableName: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
        deletedAt: "deleted_at",
    }
);
module.exports = SubscriptionPackage;