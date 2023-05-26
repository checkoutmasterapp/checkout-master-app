"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        try {
            await queryInterface.addColumn("translations", "street_address", {
                defaultValue: null,
                type: Sequelize.TEXT,
            });
            await queryInterface.addColumn("translations", "country", {
                defaultValue: null,
                type: Sequelize.TEXT,
            });

            return Promise.resolve();
        } catch (e) {
            return Promise.reject(e);
        }
    },

    down: async (queryInterface, Sequelize) => {
        try {
            await queryInterface.removeColumn("translations", "street_address");
            await queryInterface.removeColumn("translations", "country");

            return Promise.resolve();
        } catch (e) {
            return Promise.reject(e);
        }
    },
};