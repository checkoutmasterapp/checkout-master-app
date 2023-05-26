"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        try {
            await queryInterface.addColumn('translations', 'select_country', {
                defaultValue: null,
                type: Sequelize.TEXT,
            });
            await queryInterface.addColumn('translations', 'select_state', {
                defaultValue: null,
                type: Sequelize.TEXT,
            });
            await queryInterface.addColumn('translations', 'scarcity_title', {
                defaultValue: null,
                type: Sequelize.TEXT,
            });
            await queryInterface.addColumn('translations', 'scarcity_clock_prefix', {
                defaultValue: null,
                type: Sequelize.TEXT,
            });
            await queryInterface.addColumn('translations', 'scarcity_clock_suffix', {
                defaultValue: null,
                type: Sequelize.TEXT,
            });
            await queryInterface.addColumn('translations', 'scarcity_timer_finished', {
                defaultValue: null,
                type: Sequelize.TEXT,
            });
            await queryInterface.addColumn('translations', 'cart_summary', {
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
            await queryInterface.removeColumn('translations', 'select_country');
            await queryInterface.removeColumn('translations', 'select_state');
            await queryInterface.removeColumn('translations', 'scarcity_title');
            await queryInterface.removeColumn('translations', 'scarcity_clock_prefix');
            await queryInterface.removeColumn('translations', 'scarcity_clock_suffix');
            await queryInterface.removeColumn('translations', 'scarcity_timer_finished');
            await queryInterface.removeColumn('translations', 'cart_summary');

            return Promise.resolve();
          } catch (e) {
            return Promise.reject(e);
          }
        }
};