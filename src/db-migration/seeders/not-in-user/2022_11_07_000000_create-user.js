"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.bulkInsert("users", [
            {
                first_name: "Dinesh",
                last_name: "Chandel",
                email: "dinesh.chandel@brihaspatitech.com",
                password: "$2a$10$20BOcmq4Q.OfAH.TSRWT/ONOAKESkrERe8orrL/7NGbHFqYIts52W",
                created_at: new Date(),
                updated_at: new Date(),
            },
        ]);
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.bulkDelete("users", null, {});
    },
};