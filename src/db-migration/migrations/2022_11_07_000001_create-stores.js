"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("stores", {
            id: {
                allowNull: false,
                primaryKey: true,
                // autoIncrement: true,
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
            store_type: {
                defaultValue: "shopify",
                type: Sequelize.ENUM("shopify", "woocommerce"),
            },
            store_name: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            store_domain: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            store_token: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            store_status: {
                defaultValue: true,
                type: Sequelize.BOOLEAN,
            },
            user_subscription_id: {
                defaultValue: null,
                type: Sequelize.INTEGER,
            },
            shipping_rate: {
                defaultValue: false,
                type: Sequelize.BOOLEAN,
            },
            payment_method: {
                defaultValue: false,
                type: Sequelize.BOOLEAN,
            },
            customize_checkout_preview: {
                defaultValue: false,
                type: Sequelize.BOOLEAN,
            },
            customize_checkout_publish: {
                defaultValue: false,
                type: Sequelize.BOOLEAN,
            },
            created_at: Sequelize.DATE,
            updated_at: Sequelize.DATE,
            deleted_at: Sequelize.DATE,
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("stores");
        await queryInterface.sequelize.query("DROP TYPE IF EXISTS public.enum_stores_store_type");
    },
};