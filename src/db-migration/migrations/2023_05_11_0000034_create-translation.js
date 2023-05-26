"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        try {
            await queryInterface.addColumn("translations", "privacy_policy_link", {
                defaultValue: null,
                type: Sequelize.TEXT,
            });
            await queryInterface.addColumn("translations", "confirm", {
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
            await queryInterface.removeColumn("translations", "privacy_policy_link");
            await queryInterface.removeColumn("translations", "confirm");

            return Promise.resolve();
        } catch (e) {
            return Promise.reject(e);
        }
    },
};