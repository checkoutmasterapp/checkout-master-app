"use strict";

const fs = require("fs");

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("automatic_discounts", {
            id: {
                primaryKey: true,
                type: Sequelize.INTEGER,
                autoIncrement: true,
            },
            automatic_discount_uuid: {
                allowNull: false,
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
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
            discount_title: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            discount_usage_bool: {
                defaultValue: false,
                type: Sequelize.BOOLEAN,
            },
            discount_usage: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            total_discount_usage: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            active_from_date: {
                defaultValue: null,
                type: Sequelize.DATE,
            },
            active_start_time: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            is_end_date: {
                defaultValue: false,
                type: Sequelize.BOOLEAN,
            },
            active_to_date: {
                defaultValue: null,
                type: Sequelize.DATE,
            },
            active_end_time: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            discount_type: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            // When Customer Buy
            cart_minimum_quantity_bool: {
                defaultValue: false,
                type: Sequelize.BOOLEAN,
            },
            cart_minimum_quantity: {
                defaultValue: null,
                type: Sequelize.INTEGER,
            },
            cart_amount_quantity_bool: {
                defaultValue: false,
                type: Sequelize.BOOLEAN,
            },
            cart_minimum_amount: {
                defaultValue: null,
                type: Sequelize.DECIMAL,
            },
            customer_buy_product_items: {
                defaultValue: null,
                type: Sequelize.ARRAY(Sequelize.BIGINT),
            },
            customer_buy_product_varient_items: {
                defaultValue: null,
                type: Sequelize.ARRAY(Sequelize.BIGINT),
            },
            customer_buy_collection_items: {
                defaultValue: null,
                type: Sequelize.ARRAY(Sequelize.BIGINT),
            },
            // Customer will get  
            customer_free_discount_bool: {
                defaultValue: false,
                type: Sequelize.BOOLEAN,
            },
            customer_percentage_discount_bool: {
                defaultValue: false,
                type: Sequelize.BOOLEAN,
            },
            customer_percentage_discount: {
                defaultValue: null,
                type: Sequelize.DECIMAL,
            },
            maximum_discount_usage: {
                defaultValue: null,
                type: Sequelize.INTEGER,
            },
            discount_additional_options_bool: {
                defaultValue: false,
                type: Sequelize.BOOLEAN,
            },
            maximum_discount_usage_per_order: {
                defaultValue: null,
                type: Sequelize.INTEGER,
            },
            customer_get_product_items: {
                defaultValue: null,
                type: Sequelize.ARRAY(Sequelize.BIGINT),
            },
            customer_get_product_varient_items: {
                defaultValue: null,
                type: Sequelize.ARRAY(Sequelize.BIGINT),
            },
            customer_get_collection_items: {
                defaultValue: null,
                type: Sequelize.ARRAY(Sequelize.BIGINT),
            },


            percentage_discount_value: {
                defaultValue: null,
                type: Sequelize.DECIMAL,
            },
            cart_mini_amount_bool: {
                defaultValue: false,
                type: Sequelize.BOOLEAN,
            },
            entire_order_bool: {
                defaultValue: false,
                type: Sequelize.BOOLEAN,
            },
            specific_order_bool: {
                defaultValue: false,
                type: Sequelize.BOOLEAN,
            },
            customer_discount_product_items: {
                defaultValue: null,
                type: Sequelize.ARRAY(Sequelize.BIGINT),
            },
            customer_discount_product_varient_items: {
                defaultValue: null,
                type: Sequelize.ARRAY(Sequelize.BIGINT),
            },
            customer_discount_collection_items: {
                defaultValue: null,
                type: Sequelize.ARRAY(Sequelize.BIGINT),
            },
            discount_all_items: {
                defaultValue: false,
                type: Sequelize.BOOLEAN,
            },
            discount_each_item: {
                defaultValue: false,
                type: Sequelize.BOOLEAN,
            },
            exclude_shipping_bool: {
                defaultValue: false,
                type: Sequelize.BOOLEAN,
            },
            exclude_shipping_amount: {
                defaultValue: null,
                type: Sequelize.DECIMAL,
            },
            created_at: Sequelize.DATE,
            updated_at: Sequelize.DATE,
            deleted_at: Sequelize.DATE,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("automatic_discounts");
    },
};