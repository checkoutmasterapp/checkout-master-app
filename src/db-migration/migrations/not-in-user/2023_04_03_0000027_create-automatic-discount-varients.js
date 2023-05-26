"use strict";

const fs = require("fs");

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("automatic_discount_variants", {
            id: {
                primaryKey: true,
                type: Sequelize.INTEGER,
                autoIncrement: true,
            },
            discount_id: {
                type: Sequelize.INTEGER,
                references: {
                    key: "id",
                    model: "automatic_discounts",
                },
            },
            product_id:{
                defaultValue: null,
                type: Sequelize.BIGINT,
            },
            varient_id:{
                defaultValue: null,
                type: Sequelize.BIGINT,
            },
            checked:{
                defaultValue: false,
                type: Sequelize.BOOLEAN,
            },
            created_at: Sequelize.DATE,
            updated_at: Sequelize.DATE,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("automatic_discount_variants");
    },
};