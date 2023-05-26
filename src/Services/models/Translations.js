const Sq = require("sequelize");
const sequelize = require("../dbconfig");

const Users = require("./Users");

const Translations = sequelize.define(
    "translations",
    {
        id: {
            primaryKey: true,
            type: Sq.INTEGER,
            autoIncrement: true,
        },
        user_id: {
            type: Sq.INTEGER,
        },
        store_id: {
            type: Sq.UUID,
            references: {
                key: "id",
                model: "stores",
            },
        },
        translation_language: {
            defaultValue: null,
            type: Sq.STRING,
        },
        shipping_details_title: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        first_name: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        last_name: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        email: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        phone: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        address_number: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        city: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        zip_code: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        state: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        select_state: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        street_address: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        country: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        country_action: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        select_country: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        company: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        contact_information:{
            type: Sq.TEXT,
            defaultValue: null,
        },
        confirm:{
            type: Sq.TEXT,
            defaultValue: null,
        },
        marketing_checkbox: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        billing_details: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        same_billing_details: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        shipping_option_title: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        shipping_option_title_error: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        order_summary_title: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        show_order_summary: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        hide_order_summary: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        subtotal: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        discount_code: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        discount: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        delivery: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        free: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        total: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        invalid_discount_code: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        discount_code_label: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        apply_button: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        payment_method: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        credit_card: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        and_more: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        credit_card_holder_label: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        credit_card_number_label: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        credit_card_number_placeholder: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        credit_card_expiry_date: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        expire_date_placeholder: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        expiry_date_long: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        discount_code_label: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        security_code: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        cvv_placeholder: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        valid_card: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        redirected_to_external_window: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        redirected_to_free_purchase: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        cash_on_delivery: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        bank_transfer: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        klarna_pay_later: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        klarna_slice_it: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        direct_bank_transfer: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        complete_purchase_button: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        complete_purchase_with: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        secured_transaction: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        free_on_completed: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        free_purchase: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        ineligible_country: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        ineligilble_country_steps: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        too_low_amount: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        too_low_amt_step: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        pay_price: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        privacy_policy_link: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        return_policy_link: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        terms_and_cond: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        processing_payment: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        create_order: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        loading_checkout: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        purchase_button: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        cancel_button: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        buy_button: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        order_completed: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        purchase_completed_title: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        order_receive: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        order_received: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        details: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        thanks: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        shipping_address_title: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        billing_address_title: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        billing_same_as_shipping: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        shipping_method_title: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        payment_title: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        order_recap: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        additional_items: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        back_to_shop: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        default_subjects: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        default_title: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        default_greeting: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        default_message: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        default_call_to_action: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        or: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        visit_website: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        cart_title: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        default_disclaimer: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        accept_marketing_checkbox: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        consent: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        invalid: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        payment_failed: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        scarcity_title: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        scarcity_clock_prefix: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        scarcity_clock_suffix: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        scarcity_timer_finished: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        cart_summary: {
            type: Sq.TEXT,
            defaultValue: null,
        }, 
        first_name_required: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        valid_firstname: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        email_required: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        valid_email: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        phone_required: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        valid_phone: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        address_required: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        zip_required: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        valid_zip:{
            type: Sq.TEXT,
            defaultValue: null,
        },
        city_required: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        state_required: {
            type: Sq.TEXT,
            defaultValue: null,
        },
        country_required: {
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
module.exports = Translations;

Translations.belongsTo(Users, {
    foreignKey: "user_id",
});