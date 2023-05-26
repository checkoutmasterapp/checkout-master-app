"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        try {
			
            await queryInterface.addColumn("payment_methods", "card_accepted", {
                defaultValue: null,
                type: Sequelize.ARRAY(Sequelize.STRING),
            });
			
			
            return Promise.resolve();
        } catch (error) {
            console.error("payment_methods card_accepted error-------------", error);
            return Promise.reject(error);
        }
    },

    down: async (queryInterface, Sequelize) => {
        try {
            await queryInterface.removeColumn("payment_methods", "card_accepted");
            return Promise.resolve();
        } catch (error) {
            console.error("payment_methods card_accepted error-------------", error);
            return Promise.reject(error);
        }
    },
};