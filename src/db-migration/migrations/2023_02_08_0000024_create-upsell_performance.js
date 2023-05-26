"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("upsell_performance", {
            id: {
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
                type: Sequelize.INTEGER,
            },
            upsell_performance_uuid: {
                allowNull: false,
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
            },
            customer_id: {
                type: Sequelize.INTEGER,
                references: {
                    key: "id",
                    model: "customers",
                },
            },
            store_id: {
                type: Sequelize.UUID,
                references: {
                    key: "id",
                    model: "stores",
                },
            },
            upsell_id: {
                type: Sequelize.INTEGER,
                references: {
                    key: "id",
                    model: "upsell",
                },
                onDelete: "cascade",
                onUpdate: "cascade",
            },
            parent_order_id: {
                type: Sequelize.INTEGER,
                references: {
                    key: "id",
                    model: "orders",
                },
                onDelete: "cascade",
                onUpdate: "cascade",
            },
            order_id: {
                defaultValue: null,
                type: Sequelize.INTEGER,
            },
            purchased_count: {
                defaultValue: 0,
                type: Sequelize.INTEGER,
            },
            upsell_revenue: {
                defaultValue: 0,
                type: Sequelize.DECIMAL,
            },
            created_at: Sequelize.DATE,
            updated_at: Sequelize.DATE,
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.sequelize.query("DROP TABLE IF EXISTS public.upsell_performance");
    },
};