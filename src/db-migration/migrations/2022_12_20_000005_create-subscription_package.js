"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("subscription_packages", {
            id: {
                primaryKey: true,
                type: Sequelize.INTEGER,
                autoIncrement: true,
            },
            stript_object_id: Sequelize.STRING,
            stript_object_type: Sequelize.STRING,
            stript_object_description: {
                type: Sequelize.STRING,
                defaultValue: null,
            },
            subscription_product_id: {
                type: Sequelize.INTEGER,
                references: {
                    key: "id",
                    model: "subscription_products",
                },
            },
            package_name: Sequelize.STRING,
            package_description: Sequelize.STRING,
            billing_cycle: Sequelize.ENUM("day", "week", "month", "year"),
            price: Sequelize.DECIMAL,
            revenue_amount: Sequelize.DECIMAL,
            revenue_type: Sequelize.STRING,
            is_freetrail: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
            },
            is_active: {
                type: Sequelize.BOOLEAN,
                defaultValue: true,
            },
            created_at: Sequelize.DATE,
            created_by: { type: Sequelize.INTEGER, references: { key: "id", model: "users" } },
            updated_at: Sequelize.DATE,
            updated_by: { type: Sequelize.INTEGER, references: { key: "id", model: "users" } },
            deleted_at: Sequelize.DATE,
            deleted_by: { type: Sequelize.INTEGER, references: { key: "id", model: "users" } },
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("subscription_packages");
        await queryInterface.sequelize.query("DROP TYPE IF EXISTS public.enum_subscription_packages_billing_cycle");
    },
};