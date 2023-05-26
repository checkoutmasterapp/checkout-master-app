"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        let checkout_templates = [
            {
                template_code: "v1",
                template_name: "Classic version",

                font_size: "16",
                accent_color: "#55AA33",
                button_color: "#55AA33",
                error_color: "#b00020",

                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                template_code: "v2",
                template_name: "Women beauty products",

                font_size: "16",
                accent_color: "#484794",
                button_color: "#262337",
                error_color: "#b00020",

                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                template_code: "v3",
                template_name: "Fashion",

                font_size: "16",
                accent_color: "#226757",
                button_color: "#042030",
                error_color: "#b00020",

                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                template_code: "v4",
                template_name: "Gadgets",

                font_size: "16",
                accent_color: "#fb7d5c",
                button_color: "#fb7d5c",
                error_color: "#b00020",

                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                template_code: "v5",
                template_name: "Pets",

                font_size: "16",
                accent_color: "#2ab4a9",
                button_color: "linear-gradient(90deg, #4776e6 0%, #8e54e9 100%)",
                error_color: "#b00020",

                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                template_code: "v6",
                template_name: "Men beauty products",

                font_size: "16",
                accent_color: "#0c6d9c",
                button_color: "#313131",
                error_color: "#b00020",

                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                template_code: "v7",
				
                font_size: "16",
                accent_color: "#262662",
                button_color: "#ff8000",
                error_color: "#b00020",
				
                template_name: "Travel Accessories",
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                template_code: "v8",
				
                font_size: "16",
                accent_color: "#ef8a84",
                button_color: "#4d8fc3",
                error_color: "#b00020",
				
                template_name: "Health and Beauty Products",
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                template_code: "v9",
				
                font_size: "16",
                accent_color: "#249D8C",
                button_color: "#e3d065",
                error_color: "#b00020",
				
                template_name: "Eco-Friendly Products",
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                template_code: "v10",
				
                font_size: "16",
                accent_color: "#a90409",
                button_color: "#648813",
                error_color: "#b00020",
				
                template_name: "Vegan Products",
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                template_code: "v11",
				
                font_size: "16",
                accent_color: "#2fa7b7",
                button_color: "#f6a564",
                error_color: "#b00020",
				
                template_name: "Pet Accessories",
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                template_code: "v12",
				
                font_size: "16",
                accent_color: "#6f2ad4",
                button_color: "#f14e58",
                error_color: "#b00020",
				
                template_name: "Sports and Fitness Products",
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                template_code: "v13",
				
                font_size: "16",
                accent_color: "#497549",
                button_color: "#497549",
                error_color: "#b00020",
				
                template_name: "Home and Garden Products",
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                template_code: "v14",
				
                font_size: "16",
                accent_color: "#f93a26",
                button_color: "#ffc444",
                error_color: "#b00020",
				
                template_name: "Home Office Equipment",
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                template_code: "v15",
				
                font_size: "16",
                accent_color: "#6f2ad4",
                button_color: "#506cf4",
                error_color: "#b00020",
				
                template_name: "Digital Products",
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                template_code: "v16",
				
                font_size: "16",
                accent_color: "#6f2ad4",
                button_color: "#fedc00",
                error_color: "#b00020",
				
                template_name: "Smartphone Accessories",
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                template_code: "v17",
				
                font_size: "16",
                accent_color: "#86715e",
                button_color: "#86715e",
                error_color: "#b00020",
				
                template_name: "Jewelry",
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                template_code: "v18",
				
                font_size: "16",
                accent_color: "#f47f3e",
                button_color: "#fdc453",
                error_color: "#b00020",
				
                template_name: "Car and Bike Accessories",
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                template_code: "v19",
				
                font_size: "16",
                accent_color: "#f47f3e",
                button_color: "#f9826e",
                error_color: "#b00020",
				
                template_name: "Clothing",
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                template_code: "v20",
				
                font_size: "16",
                accent_color: "#c09477",
                button_color: "linear-gradient(180deg, #184356 0%, #152836 100%)",
                error_color: "#b00020",

                template_name: "Jewelry & Watches",
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                template_code: "v21",
				
                font_size: "16",
                accent_color: "#8ba160",
                button_color: "#91444c",
                error_color: "#b00020",
				
                template_name: "Home & Garden",
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                template_code: "v22",
				
                font_size: "16",
                accent_color: "#699bb7",
                button_color: "#3b3d3a",
                error_color: "#b00020",
				
                template_name: "Fashion Accessories",
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                template_code: "v23",
				
                font_size: "16",
                accent_color: "#b3621e",
                button_color: "#000000",
                error_color: "#b00020",
				
                template_name: "Health & Beauty ",
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                template_code: "v24",
				
                font_size: "16",
                accent_color: "#b2611b",
                button_color: "#000000",
                error_color: "#b00020",
				
                template_name: "Accessories",
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                template_code: "v25",
				
                font_size: "16",
                accent_color: "#764ba2",
                button_color: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                error_color: "#b00020",
				
                template_name: "Toys & Hobbies",
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                template_code: "v26",
				
                font_size: "16",
                accent_color: "#0e5fd3",
                button_color: "linear-gradient(90deg, #152d53 0%, #2d476c 100%)",
                error_color: "#b00020",
				
                template_name: "Shoes",
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                template_code: "v27",
				
                font_size: "16",
                accent_color: "#ff9a23",
                button_color: "#e54f5a",
                error_color: "#b00020",
				
                template_name: "Books",
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                template_code: "v28",
				
                font_size: "16",
                accent_color: "#90c560",
                button_color: "#b5addc",
                error_color: "#b00020",
				
                template_name: "Food & Beverages",
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                template_code: "v29",
				
                font_size: "16",
                accent_color: "#45bd33",
                button_color: "#406aff",
                error_color: "#b00020",
				
                template_name: "Other Categories",
                created_at: new Date(),
                updated_at: new Date(),
            },
        ];

        return queryInterface.bulkInsert("checkout_templates", checkout_templates);
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.bulkDelete("checkout_templates", null, {});
    },
};