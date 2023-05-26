"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("translations", {
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
            translation_language: {
                defaultValue: null,
                type: Sequelize.STRING,
            },
            shipping_details_title: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            first_name: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            last_name: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            email: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            phone: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            address_number: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            zip_code: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            city: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            state: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            select_state: {
                defaultValue: null,
                type: Sequelize.TEXT,
            },
            country_action: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            select_country: {
                defaultValue: null,
                type: Sequelize.TEXT,
            },
            company: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            marketing_checkbox: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            billing_details: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            same_billing_details: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            shipping_option_title: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            shipping_option_title_error: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            order_summary_title: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            show_order_summary: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            hide_order_summary: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            subtotal: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            discount_code: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            discount: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            delivery: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            free: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            total: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            invalid_discount_code: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            discount_code_label: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            apply_button: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            payment_method: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            credit_card: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            and_more: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            credit_card_holder_label: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            credit_card_number_label: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            credit_card_number_placeholder: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            credit_card_expiry_date: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            expire_date_placeholder: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            expiry_date_long: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            discount_code_label: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            security_code: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            cvv_placeholder: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            valid_card: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            redirected_to_external_window: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            redirected_to_free_purchase: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            cash_on_delivery: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            bank_transfer: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            klarna_pay_later: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            klarna_slice_it: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            direct_bank_transfer: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            complete_purchase_button: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            complete_purchase_with: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            secured_transaction: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            free_on_completed: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            free_purchase: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            ineligible_country: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            ineligilble_country_steps: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            too_low_amount: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            too_low_amt_step: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            pay_price: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            return_policy_link: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            terms_and_cond: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            processing_payment: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            create_order: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            loading_checkout: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            purchase_button: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            cancel_button: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            buy_button: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            order_completed: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            purchase_completed_title: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            order_receive: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            order_received: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            details: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            thanks: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            shipping_address_title: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            billing_address_title: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            billing_same_as_shipping: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            shipping_method_title: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            payment_title: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            order_recap: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            additional_items: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            back_to_shop: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            default_subjects: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            default_title: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            default_greeting: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            default_message: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            default_call_to_action: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            or: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            visit_website: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            cart_title: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            default_disclaimer: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            accept_marketing_checkbox: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            consent: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            invalid: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            payment_failed: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            scarcity_title: {
                defaultValue: null,
                type: Sequelize.TEXT,
            },
            scarcity_clock_prefix: {
                defaultValue: null,
                type: Sequelize.TEXT,
            },
            scarcity_clock_suffix: {
                defaultValue: null,
                type: Sequelize.TEXT,
            },
            scarcity_timer_finished: {
                defaultValue: null,
                type: Sequelize.TEXT,
            },
            cart_summary: {
                defaultValue: null,
                type: Sequelize.TEXT,
            },
            created_at: Sequelize.DATE,
            updated_at: Sequelize.DATE,
            deleted_at: Sequelize.DATE,
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("translations");
    },
};