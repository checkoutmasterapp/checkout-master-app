"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("taxes", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
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
            tax_rate_name: Sequelize.STRING,
            tax_rate_percentage: {
                type: Sequelize.DECIMAL,
                defaultValue: null,
            },
            country_codes: {
                type: Sequelize.ARRAY(Sequelize.TEXT),
                defaultValue: null,
            },
            tax_preference_not_included: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
            },
            tax_preference_included: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
            },
            tax_preference_shipping_rate_charge: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
            },
            created_at: Sequelize.DATE,
            updated_at: Sequelize.DATE,
            deleted_at: Sequelize.DATE,
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("taxes");
    },
};