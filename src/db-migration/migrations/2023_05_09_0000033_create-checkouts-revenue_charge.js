"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        try {
            await queryInterface.addColumn("checkouts", "revenue_charge", {
                defaultValue: false,
                type: Sequelize.BOOLEAN,
            });

            return Promise.resolve();
        } catch (e) {
            return Promise.reject(e);
        }
    },

    down: async (queryInterface, Sequelize) => {
        try {
            await queryInterface.removeColumn("checkouts", "revenue_charge");

            return Promise.resolve();
        } catch (e) {
            return Promise.reject(e);
        }
    },
};