"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        try {
            await queryInterface.addColumn("users", "token", {
                defaultValue: null,
                type: Sequelize.STRING,
            });
            return Promise.resolve();
        } catch (error) {
            console.error("error-------------", error);
            return Promise.reject(error);
        }
    },

    down: async (queryInterface, Sequelize) => {
        try {
            await queryInterface.removeColumn("users", "token");
            return Promise.resolve();
        } catch (error) {
            console.error("error-------------", error);
            return Promise.reject(error);
        }
    },
};