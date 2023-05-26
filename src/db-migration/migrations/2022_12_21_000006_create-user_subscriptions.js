"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("user_subscriptions", {
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
            subscription_package_id: {
                type: Sequelize.INTEGER,
                references: {
                    key: "id",
                    model: "subscription_packages",
                },
            },
            billing_cycle: Sequelize.ENUM("day", "week", "month", "year"),
            start_date: Sequelize.DATE,
            end_date: Sequelize.DATE,
            status: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
            },
            is_expired: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
            },
            created_at: Sequelize.DATE,
            created_by: { type: Sequelize.INTEGER, references: { key: "id", model: "users" } },
            updated_at: Sequelize.DATE,
            updated_by: { type: Sequelize.INTEGER, references: { key: "id", model: "users" } },
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.sequelize.query("DROP TABLE IF EXISTS public.user_subscriptions");
        await queryInterface.sequelize.query("DROP TYPE IF EXISTS public.enum_user_subscriptions_billing_cycle");
    },
};