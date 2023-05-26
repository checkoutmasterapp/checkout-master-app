"use strict";

const fs = require("fs");

module.exports = {
    async up(queryInterface, Sequelize) {
        try {
            await queryInterface.createTable("countries", {
                id: {
                    primaryKey: true,
                    type: Sequelize.INTEGER,
                    autoIncrement: true,
                },
                country_name: {
                    defaultValue: null,
                    type: Sequelize.STRING,
                },
                country_code3: {
                    defaultValue: null,
                    type: Sequelize.STRING,
                },
                country_code: {
                    defaultValue: null,
                    type: Sequelize.STRING,
                },
                currency: {
                    defaultValue: null,
                    type: Sequelize.STRING,
                },
                currency_name: {
                    defaultValue: null,
                    type: Sequelize.STRING,
                },
                currency_symbol: {
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
            let sql_string = await fs.readFileSync(`${__dirname}/sql/countries.sql`, "utf8");
            await sequelize.query(sql_string);
        } catch (error) {
            console.error("error ", error);
        }
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("countries");
    },
};