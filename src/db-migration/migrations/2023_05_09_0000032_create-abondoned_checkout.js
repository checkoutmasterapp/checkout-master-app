"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("abandoned_checkouts", {
            id: {
                primaryKey: true,
                type: Sequelize.INTEGER,
                autoIncrement: true,
            },
            shop_id: {
                type: Sequelize.UUID,
            },
            cart_token: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            checkout_id: {
                type: Sequelize.INTEGER,
                references: {
                    key: "id",
                    model: "checkouts",
                },
            },
            first_name: {
                type: Sequelize.STRING,
                defaultValue: null,
            },
            last_name: {
                type: Sequelize.STRING,
                defaultValue: null,
            },
            email: {
                type: Sequelize.STRING,
                defaultValue: null,
            },
            phone: {
                type: Sequelize.STRING,
                defaultValue: null,
            },
            created_at: Sequelize.DATE,
            updated_at: Sequelize.DATE,
        })
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("abandoned_checkouts");
    },
};