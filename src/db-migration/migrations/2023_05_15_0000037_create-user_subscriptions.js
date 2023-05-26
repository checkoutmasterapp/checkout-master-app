"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        try {
            await queryInterface.addColumn("user_subscriptions", "billing_id", {
                defaultValue: null,
                type: Sequelize.INTEGER,
            });

            return Promise.resolve();
        } catch (e) {
            return Promise.reject(e);
        }
    },

    down: async (queryInterface, Sequelize) => {
        try {
            await queryInterface.removeColumn("user_subscriptions", "billing_id");

            return Promise.resolve();
        } catch (e) {
            return Promise.reject(e);
        }
    },
};