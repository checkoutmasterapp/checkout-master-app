"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("shipping_rates", {
            id: {
                primaryKey: true,
                type: Sequelize.INTEGER,
                autoIncrement: true,
            },
            user_id: {
                type: Sequelize.INTEGER,
                references: {
                    key: "id",
                    model: "users",
                },
            },
            store_id: {
                type: Sequelize.UUID,
                references: {
                    key: "id",
                    model: "stores",
                },
            },
            shipping_rate_name: Sequelize.STRING,
            shipping_rate_price: {
                type: Sequelize.DECIMAL,
                defaultValue: null,
            },
            shipping_rate_min_amount: {
                type: Sequelize.DECIMAL,
                defaultValue: null,
            },
            shipping_rate_max_amount: {
                type: Sequelize.DECIMAL,
                defaultValue: null,
            },
            shipping_rate_min_weight: {
                type: Sequelize.DECIMAL,
                defaultValue: null,
            },
            shipping_rate_max_weight: {
                type: Sequelize.DECIMAL,
                defaultValue: null,
            },
            country_codes: {
                type: Sequelize.ARRAY(Sequelize.TEXT),
                defaultValue: null,
            },
            created_at: Sequelize.DATE,
            created_by: {
                type: Sequelize.INTEGER,
                references: {
                    key: "id",
                    model: "users",
                },
            },
            updated_at: Sequelize.DATE,
            updated_by: {
                type: Sequelize.INTEGER,
                references: {
                    key: "id",
                    model: "users",
                },
            },
            deleted_at: Sequelize.DATE,
            deleted_by: {
                type: Sequelize.INTEGER,
                references: {
                    key: "id",
                    model: "users",
                },
            },
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("shipping_rates");
    },
};