const Sq = require("sequelize");
const sequelize = require("../dbconfig");

const Users = require("./Users");

const BuyLinks = sequelize.define(
    "buy_links",
    {
        id: {
            primaryKey: true,
            type: Sq.INTEGER,
            autoIncrement: true,
        },
        buylink_uuid: {
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
        buylink_products: {
            type: Sq.JSON,
            defaultValue: null,
        },
        discount_code: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        buylink_url: {
            type: Sq.TEXT,
            defaultValue: null,
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
module.exports = BuyLinks;

BuyLinks.belongsTo(Users, {
    foreignKey: "user_id",
});