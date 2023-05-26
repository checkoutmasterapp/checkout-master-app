"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("user_subscription_billing_details", {
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
            user_subscription_id: {
                type: Sequelize.INTEGER,
                references: {
                    key: "id",
                    model: "user_subscriptions",
                },
            },
            subscription_package_id: {
                type: Sequelize.INTEGER,
                references: {
                    key: "id",
                    model: "subscription_packages",
                },
            },
            billing_company: {
                defaultValue: true,
                type: Sequelize.STRING,
            },
            billing_first_name: {
                defaultValue: true,
                type: Sequelize.STRING,
            },
            billing_last_name: {
                defaultValue: true,
                type: Sequelize.STRING,
            },
            billing_address: {
                defaultValue: true,
                type: Sequelize.STRING,
            },
            billing_city: {
                defaultValue: true,
                type: Sequelize.STRING,
            },
            billing_zip: {
                defaultValue: true,
                type: Sequelize.STRING,
            },
            billing_state: {
                defaultValue: true,
                type: Sequelize.STRING,
            },
            billing_country_code: {
                defaultValue: true,
                type: Sequelize.STRING,
            },
            created_at: Sequelize.DATE,
            updated_at: Sequelize.DATE,
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.sequelize.query("DROP TABLE IF EXISTS public.user_subscription_billing_details");
    },
};