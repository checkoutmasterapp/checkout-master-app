"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("temp_checkout", {
            id: {
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
                type: Sequelize.INTEGER,
            },
            customer_id: {
                defaultValue: null,
                type: Sequelize.INTEGER,
            },
            store_id: {
                defaultValue: null,
                type: Sequelize.UUID,
            },
            checkout_id: {
                defaultValue: null,
                type: Sequelize.UUID,
            },
            checkout_type: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            request_body: {
                defaultValue: null,
                type: Sequelize.JSON,
            },
            payment_method: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            payment_customer_id: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            payment_id: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            payment_response: {
                defaultValue: null,
                type: Sequelize.JSON,
            },
            payment_card: {
                defaultValue: null,
                type: Sequelize.JSON,
            },
            created_at: Sequelize.DATE,
            updated_at: Sequelize.DATE,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("temp_checkout");
    },
};