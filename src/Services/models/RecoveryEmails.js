const Sq = require("sequelize");
const sequelize = require("../dbconfig");

const RecoveryEmails = sequelize.define(
    "recovery_emails",
    {
        id: {
            allowNull: false,
            primaryKey: true,
            type: Sq.UUID,
            defaultValue: Sq.UUIDV4,
        },
        email_to: {
            defaultValue: null,
            type: Sq.TEXT,
        },
        email_subject: {
            defaultValue: null,
            type: Sq.TEXT,
        },
        email_title: {
            defaultValue: null,
            type: Sq.TEXT,
        },
        email_content: {
            defaultValue: null,
            type: Sq.TEXT,
        },
    },
    {
        paranoid: false,
        timestamps: true,
        freezeTableName: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);
module.exports = RecoveryEmails;
