"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("buy_links", {
            id: {
                primaryKey: true,
                type: Sequelize.INTEGER,
                autoIncrement: true,
            },
            buylink_uuid: {
                allowNull: false,
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
            },
            user_id: {
                type: Sequelize.INTEGER,
                references: {
                    key: "id",
                    model: "users",
                },
            },
            store_id: {
                type: Sequelize.UUID,
                references: {
                    key: "id",
                    model: "stores",
                },
            },
            buylink_products: {
                type: Sequelize.JSON,
                defaultValue: null,
            },
            discount_code: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            buylink_url: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            created_at: Sequelize.DATE,
            updated_at: Sequelize.DATE,
            deleted_at: Sequelize.DATE,
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("buy_links");
    },
};