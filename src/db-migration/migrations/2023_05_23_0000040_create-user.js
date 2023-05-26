"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        try {

            await queryInterface.addColumn("users", "store_count", {
                defaultValue: 0,
                type: Sequelize.INTEGER,
            });
            await queryInterface.addColumn("users", "email_flow_status", {
                defaultValue: 0,
                type: Sequelize.INTEGER,
            });

            await queryInterface.addColumn("users", "first_store_publish_id", {
                defaultValue: null,
                type: Sequelize.UUID,
            });
            await queryInterface.addColumn("users", "first_store_publish_date", {
                defaultValue: null,
                type: Sequelize.DATE,
            });
            await queryInterface.addColumn("users", "first_store_publish_email_flow", {
                defaultValue: 0,
                type: Sequelize.INTEGER,
            });

            return Promise.resolve();
        } catch (e) {
            return Promise.reject(e);
        }
    },

    down: async (queryInterface, Sequelize) => {
        try {

            await queryInterface.sequelize.query("ALTER TABLE users DROP IF EXISTS store_count");
            await queryInterface.sequelize.query("ALTER TABLE users DROP IF EXISTS email_flow_status");

            await queryInterface.sequelize.query("ALTER TABLE users DROP IF EXISTS first_store_publish_id");
            await queryInterface.sequelize.query("ALTER TABLE users DROP IF EXISTS first_store_publish_date");
            await queryInterface.sequelize.query("ALTER TABLE users DROP IF EXISTS first_store_publish_email_flow");

            return Promise.resolve();
        } catch (e) {
            return Promise.reject(e);
        }
    },
};