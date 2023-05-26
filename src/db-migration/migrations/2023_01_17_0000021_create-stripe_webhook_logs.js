"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("stripe_webhook_logs", {
            id: {
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
                type: Sequelize.INTEGER,
            },
            webhook_type: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            webhook_object: {
                defaultValue: null,
                type: Sequelize.JSON,
            },
            webhook_event: {
                defaultValue: null,
                type: Sequelize.JSON,
            },
            created_at: Sequelize.DATE,
            updated_at: Sequelize.DATE,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("stripe_webhook_logs");
    },
};