"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        try {
            await queryInterface.addColumn("checkouts", "reached_checkout", {
                defaultValue: null,
                type: Sequelize.INTEGER,
            });

            return Promise.resolve();
        } catch (error) {
            console.error("error-------------", error);
            return Promise.reject(error);
        }
    },

    down: async (queryInterface, Sequelize) => {
        try {
            await queryInterface.removeColumn("checkouts", "reached_checkout");
            return Promise.resolve();
        } catch (error) {
            console.error("error-------------", error);
            return Promise.reject(error);
        }
    },
};