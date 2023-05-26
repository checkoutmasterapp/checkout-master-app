"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("orders", {
            id: {
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
                type: Sequelize.INTEGER,
            },
            order_uuid: {
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
            customer_id: {
                type: Sequelize.INTEGER,
                references: {
                    key: "id",
                    model: "customers",
                },
            },
            checkout_id: {
                type: Sequelize.INTEGER,
                references: {
                    key: "id",
                    model: "checkouts",
                },
            },
            parent_order_id: {
                defaultValue: null,
                type: Sequelize.INTEGER,
            },
            parent_order_uuid: {
                defaultValue: null,
                type: Sequelize.UUID,
            },
            shopify_order_id: {
                defaultValue: null,
                type: Sequelize.STRING,
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
                type: Sequelize.STRING,
            },
            phone: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            address: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            zipcode: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            city: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            country: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            state: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            billing_status: {
                defaultValue: false,
                type: Sequelize.BOOLEAN,
            },
            billing_first_name: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            billing_last_name: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            billing_email: {
                type: Sequelize.STRING,
            },
            billing_phone: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            billing_address: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            billing_zipcode: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            billing_city: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            billing_country: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            billing_state: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            payment_method: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            payment_customer_id: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            payment_id: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            payment_response: {
                defaultValue: null,
                type: Sequelize.JSON,
            },
            card_token: {
                defaultValue: null,
                type: Sequelize.TEXT,
            },
            card_last4: {
                defaultValue: null,
                type: Sequelize.TEXT,
            },
            card_brand: {
                defaultValue: null,
                type: Sequelize.TEXT,
            },
            order_type: {
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
        await queryInterface.dropTable("orders");
    },
};