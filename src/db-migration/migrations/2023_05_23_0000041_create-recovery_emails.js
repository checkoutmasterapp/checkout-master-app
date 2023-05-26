"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("recovery_emails", {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
            },
            email_to: {
                defaultValue: null,
                type: Sequelize.TEXT,
            },
            email_subject: {
                defaultValue: null,
                type: Sequelize.TEXT,
            },
            email_title: {
                defaultValue: null,
                type: Sequelize.TEXT,
            },
            email_content: {
                defaultValue: null,
                type: Sequelize.TEXT,
            },
            created_at: Sequelize.DATE,
            updated_at: Sequelize.DATE,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("recovery_emails");
    },
};