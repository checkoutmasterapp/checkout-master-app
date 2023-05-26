"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        try {
            await queryInterface.addColumn("translations", "first_name_required", {
                defaultValue: null,
                type: Sequelize.TEXT,
            });
            await queryInterface.addColumn("translations", "valid_firstname", {
                defaultValue: null,
                type: Sequelize.TEXT,
            });
            await queryInterface.addColumn("translations", "email_required", {
                defaultValue: null,
                type: Sequelize.TEXT,
            });
            await queryInterface.addColumn("translations", "valid_email", {
                defaultValue: null,
                type: Sequelize.TEXT,
            });
            await queryInterface.addColumn("translations", "phone_required", {
                defaultValue: null,
                type: Sequelize.TEXT,
            });
            await queryInterface.addColumn("translations", "valid_phone", {
                defaultValue: null,
                type: Sequelize.TEXT,
            });
            await queryInterface.addColumn("translations", "address_required", {
                defaultValue: null,
                type: Sequelize.TEXT,
            });
            await queryInterface.addColumn("translations", "zip_required", {
                defaultValue: null,
                type: Sequelize.TEXT,
            });
            await queryInterface.addColumn("translations", "valid_zip", {
                defaultValue: null,
                type: Sequelize.TEXT,
            });
            await queryInterface.addColumn("translations", "city_required", {
                defaultValue: null,
                type: Sequelize.TEXT,
            });
            await queryInterface.addColumn("translations", "state_required", {
                defaultValue: null,
                type: Sequelize.TEXT,
            });
            await queryInterface.addColumn("translations", "country_required", {
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
            await queryInterface.removeColumn("translations", "first_name_required");
            await queryInterface.removeColumn("translations", "valid_firstname");
            await queryInterface.removeColumn("translations", "email_required");
            await queryInterface.removeColumn("translations", "valid_email");
            await queryInterface.removeColumn("translations", "phone_required");
            await queryInterface.removeColumn("translations", "valid_phone");
            await queryInterface.removeColumn("translations", "address_required");
            await queryInterface.removeColumn("translations", "zip_required");
            await queryInterface.removeColumn("translations", "valid_zip");
            await queryInterface.removeColumn("translations", "city_required");
            await queryInterface.removeColumn("translations", "state_required");
            await queryInterface.removeColumn("translations", "country_required");

            return Promise.resolve();
        } catch (e) {
            return Promise.reject(e);
        }
    },
};

