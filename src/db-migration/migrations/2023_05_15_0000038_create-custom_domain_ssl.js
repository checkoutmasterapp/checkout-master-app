"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("custom_domain_ssl", {
            id: {
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
                type: Sequelize.INTEGER,
            },
            store_id: {
                type: Sequelize.UUID,
                references: {
                    key: "id",
                    model: "stores",
                },
            },
            custom_domain_id: {
                type: Sequelize.INTEGER,
                references: {
                    key: "id",
                    model: "custom_domain",
                },
                onDelete: "cascade",
                onUpdate: "cascade",
            },
            start_date: Sequelize.DATE,
            end_date: Sequelize.DATE,

            created_at: Sequelize.DATE,
            updated_at: Sequelize.DATE,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("custom_domain_ssl");
    },
};