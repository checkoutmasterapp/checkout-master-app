"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("customize_about_sections", {
            id: {
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
                type: Sequelize.INTEGER,
            },
            customize_checkout_id: {
                type: Sequelize.INTEGER,
                references: {
                    key: "id",
                    model: "customize_checkouts",
                },
            },
            store_id: {
                type: Sequelize.UUID,
                references: {
                    key: "id",
                    model: "stores",
                },
            },
            section_title: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            section_icon: {
                defaultValue: null,
                type: Sequelize.TEXT,
            },
            section_description: {
                defaultValue: null,
                type: Sequelize.TEXT,
            },
            created_at: Sequelize.DATE,
            created_by: {
                type: Sequelize.INTEGER,
                references: {
                    key: "id",
                    model: "users",
                },
            },
            updated_at: Sequelize.DATE,
            updated_by: {
                type: Sequelize.INTEGER,
                references: {
                    key: "id",
                    model: "users",
                },
            },
            deleted_at: Sequelize.DATE,
            deleted_by: {
                type: Sequelize.INTEGER,
                references: {
                    key: "id",
                    model: "users",
                },
            },
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("customize_about_sections");
    },
};