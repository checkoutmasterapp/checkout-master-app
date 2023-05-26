"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("customers", {
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
            first_name: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            last_name: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            email: {
                // unique: true,
                defaultValue: null,
                type: Sequelize.STRING,
            },
            phone: {
                unique: false,
                type: Sequelize.STRING,
            },
            shopify_customer_id: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            stripe_customer_id: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            revolut_customer_id: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            checkout_customer_id: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            payout_master_customer_id: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            created_at: Sequelize.DATE,
            updated_at: Sequelize.DATE,
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
        await queryInterface.dropTable("customers");
    },
};