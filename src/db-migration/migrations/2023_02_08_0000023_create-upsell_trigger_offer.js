"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("upsell_trigger_offer", {
            id: {
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
                type: Sequelize.INTEGER,
            },
            upsell_trigger_offer_uuid: {
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
            upsell_id: {
                type: Sequelize.INTEGER,
                references: {
                    key: "id",
                    model: "upsell",
                },
                onDelete: "cascade",
                onUpdate: "cascade",
            },
            product_id: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            product_varient_id: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            sort_order: {
                defaultValue: 0,
                type: Sequelize.INTEGER,
            },
            product_title: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            product_image: {
                defaultValue: null,
                type: Sequelize.TEXT,
            },
            product_description: {
                defaultValue: null,
                type: Sequelize.TEXT,
            },
            product_price: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            compare_at_price: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            product_quantity: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            product_variants: {
                defaultValue: null,
                type: Sequelize.JSON,
            },
            product_variant_count: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            created_at: Sequelize.DATE,
            updated_at: Sequelize.DATE,
            deleted_at: Sequelize.DATE,
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.sequelize.query("DROP TABLE IF EXISTS public.upsell_trigger_offer");
    },
};