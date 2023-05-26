const Sq = require("sequelize");
const request = require("request-promise");

const sequelize = require("../dbconfig");

const AutomaticDiscounts = sequelize.define("automatic_discounts", {
    id: {
        primaryKey: true,
        type: Sq.INTEGER,
        autoIncrement: true,
    },
    automatic_discount_uuid: {
        allowNull: false,
        type: Sq.UUID,
        defaultValue: Sq.UUIDV4,
    },
    user_id: {
        type: Sq.INTEGER,
        references: {
            key: "id",
            model: "users",
        },
    },
    store_id: {
        type: Sq.UUID,
        references: {
            key: "id",
            model: "stores",
        },
    },
    discount_title: {
        defaultValue: null,
        type: Sq.STRING,
    },
    discount_usage_bool: {
        defaultValue: false,
        type: Sq.BOOLEAN,
    },
    discount_usage: {
        defaultValue: null,
        type: Sq.STRING,
    },
    total_discount_usage: {
        defaultValue: null,
        type: Sq.STRING,
    },
    active_from_date: {
        defaultValue: null,
        type: Sq.DATE,
    },
    active_start_time: {
        defaultValue: null,
        type: Sq.STRING,
    },
    is_end_date: {
        defaultValue: false,
        type: Sq.BOOLEAN,
    },
    active_to_date: {
        defaultValue: null,
        type: Sq.DATE,
    },
    active_end_time: {
        defaultValue: null,
        type: Sq.STRING,
    },
    discount_type: {
        defaultValue: null,
        type: Sq.STRING,
    },
    cart_minimum_quantity_bool: {
        defaultValue: false,
        type: Sq.BOOLEAN,
    },
    cart_mini_amount_bool: {
        defaultValue: false,
        type: Sq.BOOLEAN,
    },
    cart_minimum_quantity: {
        defaultValue: null,
        type: Sq.INTEGER,
    },
    cart_amount_quantity_bool: {
        defaultValue: false,
        type: Sq.BOOLEAN,
    },
    cart_minimum_amount: {
        defaultValue: null,
        type: Sq.DECIMAL,
    },
    customer_buy_product_items: {
        type: Sq.ARRAY(Sq.BIGINT),
        defaultValue: null,
    },
    customer_buy_product_varient_items: {
        type: Sq.ARRAY(Sq.BIGINT),
        defaultValue: null,
    },
    customer_buy_collection_items: {
        type: Sq.ARRAY(Sq.BIGINT),
        defaultValue: null,
    },
    customer_get_product_items: {
        type: Sq.ARRAY(Sq.BIGINT),
        defaultValue: null,
    },
    customer_get_product_varient_items: {
        type: Sq.ARRAY(Sq.BIGINT),
        defaultValue: null,
    },
    customer_get_collection_items: {
        type: Sq.ARRAY(Sq.BIGINT),
        defaultValue: null,
    },
    customer_discount_product_items: {
        type: Sq.ARRAY(Sq.BIGINT),
        defaultValue: null,
    },
    customer_discount_product_varient_items: {
        type: Sq.ARRAY(Sq.BIGINT),
        defaultValue: null,
    },
    customer_discount_collection_items: {
        type: Sq.ARRAY(Sq.BIGINT),
        defaultValue: null,
    },
    customer_free_discount_bool: {
        defaultValue: false,
        type: Sq.BOOLEAN,
    },
    customer_percentage_discount_bool: {
        defaultValue: false,
        type: Sq.BOOLEAN,
    },
    customer_percentage_discount: {
        defaultValue: null,
        type: Sq.DECIMAL,
    },
    maximum_discount_usage: {
        defaultValue: null,
        type: Sq.INTEGER,
    },
    discount_additional_options_bool: {
        defaultValue: false,
        type: Sq.BOOLEAN,
    },
    maximum_discount_usage_per_order: {
        defaultValue: null,
        type: Sq.INTEGER,
    },
    percentage_discount_value: {
        defaultValue: null,
        type: Sq.DECIMAL,
    },
    entire_order_bool: {
        defaultValue: false,
        type: Sq.BOOLEAN,
    },
    specific_order_bool: {
        defaultValue: false,
        type: Sq.BOOLEAN,
    },
    discount_all_items: {
        defaultValue: false,
        type: Sq.BOOLEAN,
    },
    discount_each_item: {
        defaultValue: false,
        type: Sq.BOOLEAN,
    },
    exclude_shipping_bool: {
        defaultValue: false,
        type: Sq.BOOLEAN,
    },
    exclude_shipping_amount: {
        defaultValue: null,
        type: Sq.DECIMAL,
    },
},
    {
        paranoid: false,
        timestamps: true,
        freezeTableName: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
        deletedAt: "deleted_at",
    }
);
module.exports = AutomaticDiscounts;