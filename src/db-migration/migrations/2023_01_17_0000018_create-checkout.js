"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("checkouts", {
            id: {
                primaryKey: true,
                type: Sequelize.INTEGER,
                autoIncrement: true,
            },
            checkout_uuid: {
                allowNull: false,
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
            },
            shop_id: {
                type: Sequelize.UUID,
                references: {
                    key: "id",
                    model: "stores",
                },
            },
            cart_token: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            customer_id: {
                defaultValue: null,
                type: Sequelize.INTEGER,
            },
            subtotal: {
                defaultValue: null,
                type: Sequelize.DECIMAL,
            },
            price: {
                defaultValue: null,
                type: Sequelize.DECIMAL,
            },
            shipping_rate_id: {
                defaultValue: null,
                type: Sequelize.INTEGER,
                references: {
                    key: "id",
                    model: "shipping_rates",
                },
            },
            shipping_rate_amount: {
                defaultValue: null,
                type: Sequelize.DECIMAL,
            },
            tax_rate_id: {
                defaultValue: null,
                type: Sequelize.INTEGER,
                references: {
                    key: "id",
                    model: "taxes",
                },
            },
            tax_rate_percentage: {
                type: Sequelize.DECIMAL,
                defaultValue: null,
            },
            tax_rate_amount: {
                defaultValue: null,
                type: Sequelize.DECIMAL,
            },
            discount_source: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            discount_id: {
                defaultValue: null,
                type: Sequelize.BIGINT,
            },
            discount_title: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            discount_amount: {
                defaultValue: null,
                type: Sequelize.DECIMAL,
            },
            discount_type: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            is_purchase: {
                defaultValue: false,
                type: Sequelize.BOOLEAN,
            },
            created_at: Sequelize.DATE,
            updated_at: Sequelize.DATE,
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("checkouts");
    },
};