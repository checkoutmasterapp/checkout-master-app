"use strict";

const Sq = require("sequelize");
const moment = require("moment");
const sequelize = require("../dbconfig");

const UserSubscriptions = require("./UserSubscriptions");
const SubscriptionPackage = require("./SubscriptionPackage");

const Users = sequelize.define(
    "users",
    {
        id: {
            type: Sq.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        first_name: {
            type: Sq.STRING,
            defaultValue: null,
        },
        last_name: {
            type: Sq.STRING,
            defaultValue: null,
        },
        email: {
            type: Sq.STRING,
            defaultValue: null,
        },
        password: Sq.STRING,
        user_type: {
            defaultValue: "merchant",
            type: Sq.ENUM("admin", "merchant"),
        },
        avatar: {
            defaultValue: null,
            type: Sq.STRING,
        },
        email_verified_at: {
            defaultValue: null,
            type: Sq.DATE,
        },
        token: {
            defaultValue: null,
            type: Sq.STRING,
        },
        reset_password_expires: {
            defaultValue: null,
            type: Sq.DATE,
        },
        user_status: {
            defaultValue: true,
            type: Sq.BOOLEAN,
        },
        stripe_customer_id: {
            defaultValue: null,
            type: Sq.STRING,
        },

        store_count: {
            defaultValue: 0,
            type: Sq.INTEGER,
        },
        email_flow_status: {
            defaultValue: 0,
            type: Sq.INTEGER,
        },

        first_store_publish_id: {
            defaultValue: null,
            type: Sq.UUID,
        },
        first_store_publish_date: {
            defaultValue: null,
            type: Sq.DATE,
        },
        first_store_publish_email_flow: {
            defaultValue: 0,
            type: Sq.INTEGER,
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
        defaultScope: {
            attributes: { exclude: ["password"] },
        },
        scopes: {
            withPassword: { attributes: {} },
        },
    }
);

module.exports = Users;

Users.hasMany(UserSubscriptions, {
    foreignKey: "created_by",
});

Users.afterCreate(async (response, options) => {

    ////////////////////// Create Dummy store Subscription Start
    let subscription_package = await SubscriptionPackage.findOne({
        where: { is_freetrail: true },
    });

    let start_date = moment().format("YYYY-MM-DD");
    let end_date = moment(start_date).add(1, subscription_package.billing_cycle).format("YYYY-MM-DD");

    await UserSubscriptions.create({
        user_id: response?.id,
        subscription_package_id: subscription_package?.id,
        billing_cycle: subscription_package?.billing_cycle,
        start_date: start_date,
        end_date: end_date,
        status: true
    });

});