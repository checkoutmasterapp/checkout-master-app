"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("cart_performance", {
            id: {
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
                type: Sequelize.INTEGER,
            },
            cart_performance_uuid: {
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
            cart_recovery_id: {
                type: Sequelize.INTEGER,
                references: {
                    key: "id",
                    model: "cart_recovery_emails",
                },
            },
            lastSentFor: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            store_id: {
                type: Sequelize.UUID,
                references: {
                    key: "id",
                    model: "stores",
                },
            },
            checkout_id: {
                type: Sequelize.INTEGER,
                references: {
                    key: "id",
                    model: "checkouts",
                },
                onDelete: "cascade",
                onUpdate: "cascade",
            },
            sent_time: {
                defaultValue: null,
                type: Sequelize.INTEGER,
            },
            time_clicked: {
                defaultValue: 0,
                type: Sequelize.INTEGER,
            },
            purchased_amount: {
                defaultValue: null,
                type: Sequelize.DECIMAL,
            },
            purchased_time: {
                defaultValue: null,
                type: Sequelize.INTEGER,
            },
            created_at: Sequelize.DATE,
            updated_at: Sequelize.DATE,
            deleted_at: Sequelize.DATE,
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.sequelize.query("DROP TABLE IF EXISTS public.cart_performance");
    },
};