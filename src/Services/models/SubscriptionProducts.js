const Sq = require("sequelize");
const sequelize = require("../dbconfig");

const Users = require("./Users");
const SubscriptionPackage = require("./SubscriptionPackage");

const SubscriptionProducts = sequelize.define(
    "subscription_products",
    {
        id: {
            type: Sq.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        object_id: Sq.STRING,
        name: Sq.STRING,
        description: Sq.STRING,
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

module.exports = SubscriptionProducts;

SubscriptionProducts.hasMany(SubscriptionPackage, {
    foreignKey: "subscription_product_id",
});

SubscriptionProducts.belongsTo(Users, {
    foreignKey: "created_by",
});