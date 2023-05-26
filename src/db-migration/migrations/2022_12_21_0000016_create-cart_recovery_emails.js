"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("cart_recovery_emails", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            cart_recovery_uuid: {
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
            cart_recovery_schedule_time: {
                type: Sequelize.STRING,
                defaultValue: null,
            },
            cart_recovery_email_subject: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            cart_recovery_email_title: {
                type: Sequelize.TEXT,
                defaultValue: false,
            },
            cart_recovery_email_body: {
                type: Sequelize.TEXT,
                defaultValue: false,
            },
            cart_recovery_action_button_title: {
                type: Sequelize.TEXT,
                defaultValue: false,
            },
            cart_recovery_footer_text: {
                type: Sequelize.TEXT,
                defaultValue: false,
            },
            created_at: Sequelize.DATE,
            updated_at: Sequelize.DATE,
            deleted_at: Sequelize.DATE,
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("cart_recovery_emails");
    },
};