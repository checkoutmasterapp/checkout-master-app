"use strict";

const { v4: uuidv4 } = require("uuid");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.bulkInsert("stores", [
            {
                id: uuidv4(),
                user_id: 1,
                store_name: "testappwithnodejs",
                store_domain: "testappwithnodejs.myshopify.com",
                store_token: "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",
				store_status: false,
                created_at: new Date(),
                updated_at: new Date(),
            },
        ]);
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.bulkDelete("stores", null, {});
    },
};