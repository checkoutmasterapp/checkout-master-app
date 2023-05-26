"use strict";


module.exports = {
    up: async (queryInterface, Sequelize) => {
        try {
            await queryInterface.addColumn("orders", "product_type", {
                defaultValue: null,
                type: Sequelize.TEXT,
            });
            await queryInterface.addColumn("orders", "buying_for", {
                defaultValue: null,
                type: Sequelize.TEXT,
            });
            await queryInterface.addColumn("orders", "giftee_email", {
                defaultValue: null,
                type: Sequelize.TEXT,
            });
            await queryInterface.addColumn("orders", "delivery_type", {
                defaultValue: null,
                type: Sequelize.TEXT,
            });
            await queryInterface.addColumn("orders", "delivery_date", {
                defaultValue: null,
                type: Sequelize.TEXT,
            });
            await queryInterface.addColumn("orders", "messeage_txt", {
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
            await queryInterface.removeColumn("orders", "product_type");
            await queryInterface.removeColumn("orders", "buying_for");
            await queryInterface.removeColumn("orders", "giftee_email");
            await queryInterface.removeColumn("orders", "delivery_date");
            await queryInterface.removeColumn("orders", "delivery_type");
            await queryInterface.removeColumn("orders", "messeage_txt");

            return Promise.resolve();
        } catch (e) {
            return Promise.reject(e);
        }
    },
};

