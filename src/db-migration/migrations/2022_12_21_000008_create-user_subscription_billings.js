"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("user_subscription_billings", {
            id: {
                primaryKey: true,
                type: Sequelize.INTEGER,
                autoIncrement: true,
            },
            user_subscription_billing_uuid: {
                allowNull: false,
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
            stripe_card_id: {
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
            status: Sequelize.ENUM("Pending", "Active", "incomplete", "Inactive"),
            billing_cycle: Sequelize.ENUM("day", "week", "month", "year"),
            price: {
                defaultValue: null,
                type: Sequelize.DECIMAL,
            },
            revenue_amount: {
                defaultValue: null,
                type: Sequelize.DECIMAL,
            },
            start_date: Sequelize.DATE,
            end_date: Sequelize.DATE,
            created_at: Sequelize.DATE,
            created_by: { type: Sequelize.INTEGER, references: { key: "id", model: "users" } },
            updated_at: Sequelize.DATE,
            updated_by: { type: Sequelize.INTEGER, references: { key: "id", model: "users" } },
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.sequelize.query("DROP TABLE IF EXISTS public.user_subscription_billings");
        await queryInterface.sequelize.query("DROP TYPE IF EXISTS public.enum_user_subscription_billings_status");
        await queryInterface.sequelize.query("DROP TYPE IF EXISTS public.enum_user_subscription_billings_billing_cycle");
    },
};