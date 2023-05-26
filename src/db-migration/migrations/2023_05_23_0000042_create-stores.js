"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        try {

            await queryInterface.addColumn("users", "customize_checkout_publish_date", {
                defaultValue: null,
                type: Sequelize.DATE,
            });
            await queryInterface.addColumn("stores", "customize_checkout_publish_email_flow", {
                defaultValue: 0,
                type: Sequelize.INTEGER,
            });

            return Promise.resolve();
        } catch (error) {
            return Promise.reject(error);
        }
    },

    down: async (queryInterface, Sequelize) => {
        try {
            await queryInterface.sequelize.query("ALTER TABLE stores DROP IF EXISTS customize_checkout_publish_date");
            await queryInterface.sequelize.query("ALTER TABLE stores DROP IF EXISTS customize_checkout_publish_email_flow");

            return Promise.resolve();
        } catch (error) {
            return Promise.reject(error);
        }
    },
};