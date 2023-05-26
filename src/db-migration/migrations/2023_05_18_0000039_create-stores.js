"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        try {
            await queryInterface.addColumn("stores", "store_currency", {
                defaultValue: null,
                type: Sequelize.STRING,
            });

            await queryInterface.addColumn("stores", "money_format", {
                defaultValue: null,
                type: Sequelize.STRING,
            });

            return Promise.resolve();
        } catch (e) {
            return Promise.reject(e);
        }
    },

    down: async (queryInterface, Sequelize) => {
        try {
            await queryInterface.removeColumn("stores", "store_currency");
            await queryInterface.removeColumn("stores", "money_format");

            return Promise.resolve();
        } catch (e) {
            return Promise.reject(e);
        }
    },
};