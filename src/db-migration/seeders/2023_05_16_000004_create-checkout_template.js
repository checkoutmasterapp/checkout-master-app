"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        let checkout_templates = [
            {
                template_code: "d1",
                template_name: "Checkout digital",

                font_size: "16",
                accent_color: "#4E9FAC",
                button_color: "#FE6F4F",
                error_color: "#b00020",

                created_at: new Date(),
                updated_at: new Date(),
            }
        ]
        return queryInterface.bulkInsert("checkout_templates", checkout_templates);
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.bulkDelete("checkout_templates", null, {});
    },
};