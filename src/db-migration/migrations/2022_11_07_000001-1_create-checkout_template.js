"use strict";

module.exports = {

    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("checkout_templates", {
            id: {
                primaryKey: true,
                type: Sequelize.INTEGER,
                autoIncrement: true,
            },
            template_code: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            template_name: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            sort_order: {
                defaultValue: 0,
                type: Sequelize.INTEGER,
            },
            font_size: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            accent_color: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            button_color: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            error_color: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            created_at: Sequelize.DATE,
            updated_at: Sequelize.DATE,
            deleted_at: Sequelize.DATE,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("checkout_templates");
    },
};