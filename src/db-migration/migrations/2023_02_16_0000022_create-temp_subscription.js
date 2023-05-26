"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("temp_subscription", {
            id: {
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
                type: Sequelize.INTEGER,
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
            subscription_id: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            request_body: {
                defaultValue: null,
                type: Sequelize.JSON,
            },
            package_detail: {
                defaultValue: null,
                type: Sequelize.JSON,
            },
            created_at: Sequelize.DATE,
            updated_at: Sequelize.DATE,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("temp_subscription");
    },
};