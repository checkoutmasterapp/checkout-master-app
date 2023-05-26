"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("subscription_discount", {
            id: {
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
                type: Sequelize.INTEGER,
            },
            stripe_discount_id: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            name: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            code: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            discount_type: {
                defaultValue: "flat",
                type: Sequelize.ENUM("flat", "percent"),
            },
            amount_off: {
                defaultValue: null,
                type: Sequelize.DECIMAL,
            },
            percent_off: {
                defaultValue: null,
                type: Sequelize.DECIMAL,
            },
            is_active: {
                defaultValue: true,
                type: Sequelize.BOOLEAN,
            },
            created_at: Sequelize.DATE,
            updated_at: Sequelize.DATE,
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("subscription_discount");
        await queryInterface.sequelize.query("DROP TYPE IF EXISTS public.enum_subscription_discount_discount_type");
    },
};