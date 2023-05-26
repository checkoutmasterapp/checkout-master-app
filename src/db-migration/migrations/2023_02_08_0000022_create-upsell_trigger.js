"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("upsell_trigger", {
            id: {
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
                type: Sequelize.INTEGER,
            },
            upsell_trigger_uuid: {
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
            trigger_type: {
                defaultValue: "product",
                type: Sequelize.ENUM("product", "category"),
            },
            trigger_id: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            trigger_title: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            trigger_image: {
                defaultValue: null,
                type: Sequelize.TEXT,
            },
            created_at: Sequelize.DATE,
            updated_at: Sequelize.DATE,
            deleted_at: Sequelize.DATE,
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.sequelize.query("DROP TABLE IF EXISTS public.upsell_trigger");
		await queryInterface.sequelize.query("DROP TYPE IF EXISTS public.enum_upsell_trigger_trigger_type");
    },
};