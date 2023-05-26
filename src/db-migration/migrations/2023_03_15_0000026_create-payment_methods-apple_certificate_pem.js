"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        try {
            await queryInterface.addColumn("payment_methods", "apple_merchantIdentifier", {
                defaultValue: null,
                type: Sequelize.TEXT,
            });

            await queryInterface.addColumn("payment_methods", "apple_certificate_pem", {
                defaultValue: null,
                type: Sequelize.TEXT,
            });

            await queryInterface.addColumn("payment_methods", "apple_certificate_key", {
                defaultValue: null,
                type: Sequelize.TEXT,
            });

            return Promise.resolve();
        } catch (error) {
            console.error("error-------------", error);
            return Promise.reject(error);
        }
    },

    down: async (queryInterface, Sequelize) => {
        try {
            await queryInterface.removeColumn("payment_methods", "apple_merchantIdentifier");
            await queryInterface.removeColumn("payment_methods", "apple_certificate_pem");
            await queryInterface.removeColumn("payment_methods", "apple_certificate_key");
            return Promise.resolve();
        } catch (error) {
            console.error("error-------------", error);
            return Promise.reject(error);
        }
    },
};