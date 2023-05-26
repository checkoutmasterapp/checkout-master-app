"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("user_subscription_billings", {
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
            card_detail_id: {
                type: Sequelize.INTEGER,
                references: {
                    key: "id",
                    model: "user_subscription_card_details",
                },
            },
            stripe_subscription_id: {
                defaultValue: null,
                type: Sequelize.TEXT,
            },
            stripe_customer_id: {
                defaultValue: null,
                type: Sequelize.TEXT,
            },
            stripe_invoice_id: {
                defaultValue: null,
                type: Sequelize.TEXT,
            },
            stripe_invoice_number: {
                defaultValue: null,
                type: Sequelize.TEXT,
            },
            stripe_invoice_pdf: {
                defaultValue: null,
                type: Sequelize.TEXT,
            },
            status: Sequelize.ENUM("Active", "Inactive"),
            billing_cycle: Sequelize.ENUM("month", "year"),
            price: {
                defaultValue: null,
                type: Sequelize.DECIMAL,
            },
            start_date: Sequelize.DATE,
            end_date: Sequelize.DATE,
            created_at: Sequelize.DATE,
            created_by: {
                type: Sequelize.INTEGER,
                references: {
                    key: "id",
                    model: "users",
                },
            },
            updated_at: Sequelize.DATE,
            updated_by: {
                type: Sequelize.INTEGER,
                references: {
                    key: "id",
                    model: "users",
                },
            },
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.sequelize.query("DROP TABLE IF EXISTS public.user_subscription_billings");
    },
};