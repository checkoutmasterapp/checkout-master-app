"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        try {
            await queryInterface.addColumn("subscription_packages", "stripe_metered_price_id", {
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
            await queryInterface.removeColumn("subscription_packages", "stripe_metered_price_id");

            return Promise.resolve();
        } catch (e) {
            return Promise.reject(e);
        }
    },
};