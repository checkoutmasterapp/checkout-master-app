"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("custom_domain", {
            id: {
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
                type: Sequelize.INTEGER,
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
            subdomain_name: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            domain_name: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            custom_domain: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            verification_status: {
                defaultValue: "awaiting",
                type: Sequelize.ENUM("awaiting", "pending", "success", "cancel"),
            },
            created_at: Sequelize.DATE,
            updated_at: Sequelize.DATE,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("custom_domain");
        await queryInterface.sequelize.query("DROP TYPE IF EXISTS public.enum_custom_domain_verification_status");
    },
};