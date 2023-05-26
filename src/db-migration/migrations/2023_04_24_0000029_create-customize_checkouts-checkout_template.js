"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        try {
            await queryInterface.addColumn("customize_checkouts", "template_id", {
                defaultValue: null,
                type: Sequelize.INTEGER,
            });
            await queryInterface.addColumn("customize_checkouts", "template_code", {
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
            await queryInterface.removeColumn("customize_checkouts", "template_id");
            await queryInterface.removeColumn("customize_checkouts", "template_code");

            return Promise.resolve();
        } catch (e) {
            return Promise.reject(e);
        }
    },
};