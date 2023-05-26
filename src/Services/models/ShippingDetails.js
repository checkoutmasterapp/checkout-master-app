"use strict";

const Sq = require("sequelize");
const sequelize = require("../dbconfig");

const UserSubscriptions = require("./UserSubscriptions");

const ShippingDetails = sequelize.define(
  "shipping_details",
  {
    id: {
      type: Sq.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    customer_id: {
      type: Sq.INTEGER,
      references: {
        key: "id",
        model: "customers",
      },
    },
    orders_id: {
      type: Sq.INTEGER,
      references: {
        key: "id",
        model: "orders",
      },
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
    phone: {
      type: Sq.STRING,
      defaultValue: null,
    },
    address: {
      type: Sq.STRING,
      defaultValue: null,
    },
    zipcode: {
      type: Sq.STRING,
      defaultValue: null,
    },
    city: {
      type: Sq.STRING,
      defaultValue: null,
    },
    country: {
      type: Sq.STRING,
      defaultValue: null,
    },
    status: {
      defaultValue: null,
      type: Sq.BOOLEAN,
    },
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

module.exports = ShippingDetails;
