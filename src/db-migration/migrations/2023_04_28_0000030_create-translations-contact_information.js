"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn('translations', 'contact_information', {
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
      await queryInterface.removeColumn('translations', 'contact_information');

      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  }
};