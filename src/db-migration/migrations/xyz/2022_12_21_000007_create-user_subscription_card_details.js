"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("user_subscription_card_details", {
            id: {
                primaryKey: true,
                type: Sequelize.INTEGER,
                autoIncrement: true,
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
            stripe_customer_id: {
                defaultValue: null,
                type: Sequelize.TEXT,
            },
            stripe_card_id: {
                defaultValue: null,
                type: Sequelize.TEXT,
            },
            stripe_card_last4: {
                defaultValue: null,
                type: Sequelize.TEXT,
            },
            exp_month: {
                defaultValue: null,
                type: Sequelize.TEXT,
            },
            exp_year: {
                defaultValue: null,
                type: Sequelize.TEXT,
            },
            stripe_card_brand: {
                defaultValue: null,
                type: Sequelize.TEXT,
            },
            is_default: {
                type: Sequelize.BOOLEAN,
                defaultValue: true,
            },
            created_at: Sequelize.DATE,
            updated_at: Sequelize.DATE,
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.sequelize.query("DROP TABLE IF EXISTS public.user_subscription_card_details");
    },
};