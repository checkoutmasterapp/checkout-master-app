"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("payment_methods", {
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
            method_name: Sequelize.STRING,
            publishable_key: Sequelize.TEXT,
            secret: Sequelize.TEXT,
            card_accepted: {
                defaultValue: null,
                type: Sequelize.ARRAY(Sequelize.STRING),
            },
            soft_descriptor: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            payment_email: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            refresh_token: {
                defaultValue: null,
                type: Sequelize.TEXT,
            },
            id_token: {
                defaultValue: null,
                type: Sequelize.TEXT,
            },
            access_token: {
                defaultValue: null,
                type: Sequelize.TEXT,
            },
            revolut_public_id: {
                defaultValue: null,
                type: Sequelize.TEXT,
            },
            revolut_secret: {
                defaultValue: null,
                type: Sequelize.TEXT,
            },
            status: {
                type: Sequelize.BOOLEAN,
                defaultValue: true,
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
        await queryInterface.dropTable("payment_methods");
    },
};