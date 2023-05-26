"use strict";
const fs = require("fs");
module.exports = {
    async up(queryInterface, Sequelize) {
        try {
            await queryInterface.createTable("states", {
                id: {
                    primaryKey: true,
                    type: Sequelize.INTEGER,
                    autoIncrement: true,
                },
                state_name: {
                    defaultValue: null,
                    type: Sequelize.STRING,
                },
                country_id: {
                    allowNull: false,
                    type: Sequelize.INTEGER,
                },
                country_code: {
                    defaultValue: null,
                    type: Sequelize.STRING,
                },
                state_code: {
                    defaultValue: null,
                    type: Sequelize.STRING,
                },
                type: {
                    defaultValue: null,
                    type: Sequelize.STRING,
                },
                created_at: Sequelize.DATE,
                updated_at: Sequelize.DATE,
            });

            const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
                host: process.env.DB_HOST,
                dialect: process.env.DB_DIALECT,
                dialectOptions: {
                    multipleStatements: true,
                },
            });
            let sql_string = await fs.readFileSync(`${__dirname}/sql/states.sql`, "utf8");
            await sequelize.query(sql_string);
        } catch (error) {
            console.error("error ", error);
        }
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("states");
    },
};