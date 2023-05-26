const Sq = require("sequelize");
const sequelize = require("../dbconfig");

const TempCheckout = sequelize.define(
    "temp_checkout",
    {
        id: {
            primaryKey: true,
            type: Sq.INTEGER,
            autoIncrement: true,
        },
        customer_id: {
            defaultValue: null,
            type: Sq.INTEGER,
        },
        store_id: {
            defaultValue: null,
            type: Sq.UUID,
        },
        checkout_id: {
            defaultValue: null,
            type: Sq.UUID,
        },
        checkout_type: {
            defaultValue: null,
            type: Sq.STRING,
        },
        request_body: {
            defaultValue: null,
            type: Sq.JSON,
        },
        payment_method: {
            defaultValue: null,
            type: Sq.STRING,
        },
        payment_customer_id: {
            defaultValue: null,
            type: Sq.STRING,
        },
        payment_id: {
            defaultValue: null,
            type: Sq.STRING,
        },
        payment_response: {
            defaultValue: null,
            type: Sq.JSON,
        },
        payment_card: {
            defaultValue: null,
            type: Sq.JSON,
        },
    },
    {
        paranoid: false,
        timestamps: true,
        freezeTableName: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);
module.exports = TempCheckout;