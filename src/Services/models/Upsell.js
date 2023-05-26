"use strict";

const Sq = require("sequelize");
const sequelize = require("../dbconfig");

const UpsellTrigger = require("./UpsellTrigger");
const UpsellTriggerOffer = require("./UpsellTriggerOffer");
const UpsellPerformance = require("./UpsellPerformance");

const Upsell = sequelize.define("upsell", {
    id: {
        type: Sq.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    upsell_uuid: {
        allowNull: false,
        primaryKey: true,
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
    upsell_title: {
        defaultValue: null,
        type: Sq.STRING,
    },
    status: {
        defaultValue: true,
        type: Sq.BOOLEAN,
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

module.exports = Upsell;

Upsell.hasMany(UpsellTrigger, {
    as: "upsell_triggers",
    foreignKey: "upsell_id",
});

Upsell.hasMany(UpsellTriggerOffer, {
    as: "upsell_trigger_offers",
    foreignKey: "upsell_id",
});

Upsell.hasMany(UpsellPerformance, {
    as: "upsell_performances",
    foreignKey: "upsell_id",
});