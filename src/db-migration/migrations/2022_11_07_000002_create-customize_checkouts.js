"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("customize_checkouts", {
            id: {
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
                type: Sequelize.INTEGER,
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
            money_format: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            store_logo: {
                defaultValue: null,
                type: Sequelize.TEXT,
            },
            favicon: {
                defaultValue: null,
                type: Sequelize.TEXT,
            },
            security_badge: {
                defaultValue: null,
                type: Sequelize.TEXT,
            },
            accent_color: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            button_color: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            error_color: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            font_size:{
                defaultValue: null,
                type: Sequelize.INTEGER, 
            },
            return_policy: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            privacy_policy: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            terms_condition: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            require_phone_number: {
                defaultValue: true,
                type: Sequelize.BOOLEAN,
            },
            require_address_number: {
                defaultValue: true,
                type: Sequelize.BOOLEAN,
            },
            check_accepts_marketing: {
                defaultValue: true,
                type: Sequelize.BOOLEAN,
            },
            display_timer: {
                defaultValue: true,
                type: Sequelize.BOOLEAN,
            },
            display_branding: {
                defaultValue: true,
                type: Sequelize.BOOLEAN,
            },
            display_discount: {
                defaultValue: true,
                type: Sequelize.BOOLEAN,
            },
            custom_script: {
                defaultValue: null,
                type: Sequelize.TEXT,
            },
            thankyou_description: {
                defaultValue: null,
                type: Sequelize.TEXT,
            },
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
            deleted_at: Sequelize.DATE,
            deleted_by: {
                type: Sequelize.INTEGER,
                references: {
                    key: "id",
                    model: "users",
                },
            },
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("customize_checkouts");
    },
};