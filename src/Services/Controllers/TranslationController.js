const { ChangeLanguage } = require("../../libs/Helper");
const { Translations, Stores } = require("../models");
const Sq = require("sequelize");

module.exports.Translation = async (req, res, next) => {
    const { store_id } = req.params;
    const auth_user = req.auth_user;
    const auth_store = req.auth_store;

    if (req.method === "POST") {
        try {
            const request_body = req.body;
            request_body.user_id = auth_user.id;

            /// Customer Details
            if (request_body.cart_summary.length > 0) {
                if (request_body.cart_summary[1] != "") {
                    request_body.cart_summary = request_body.cart_summary.slice(1);
                }
                request_body.cart_summary = request_body.cart_summary.join("");
            }

            if (request_body?.contact_information?.length > 0) {
                if (request_body.contact_information[1] != "") {
                    request_body.contact_information = request_body.cart_summary.slice(1);
                }
                request_body.contact_information = request_body.contact_information.join("");
            }

            if (request_body?.shipping_details_title.length > 0) {
                if (request_body.shipping_details_title[1] != "") {
                    request_body.shipping_details_title = request_body.shipping_details_title.slice(1);
                }
                request_body.shipping_details_title = request_body.shipping_details_title.join("");
            }

            if (request_body.email.length > 0) {
                if (request_body.email[1] != "") {
                    request_body.email = request_body.email.slice(1);
                }
                request_body.email = request_body.email.join("");
            }

            if (request_body.first_name.length > 0) {
                if (request_body.first_name[1] != "") {
                    request_body.first_name = request_body.first_name.slice(1);
                }
                request_body.first_name = request_body.first_name.join("");
            }

            if (request_body.last_name.length > 0) {
                if (request_body.last_name[1] != "") {
                    request_body.last_name = request_body.last_name.slice(1);
                }
                request_body.last_name = request_body.last_name.join("");
            }

            if (request_body.phone.length > 0) {
                if (request_body.phone[1] != "") {
                    request_body.phone = request_body.phone.slice(1);
                }
                request_body.phone = request_body.phone.join("");
            }

            if (request_body.address_number.length > 0) {
                if (request_body.address_number[1] != "") {
                    request_body.address_number = request_body.address_number.slice(1);
                }
                request_body.address_number = request_body.address_number.join("");
            }

            if (request_body.city.length > 0) {
                if (request_body.city[1] != "") {
                    request_body.city = request_body.city.slice(1);
                }
                request_body.city = request_body.city.join("");
            }

            if (request_body.zip_code.length > 0) {
                if (request_body.zip_code[1] != "") {
                    request_body.zip_code = request_body.zip_code.slice(1);
                }
                request_body.zip_code = request_body.zip_code.join("");
            }

            if (request_body.country_action.length > 0) {
                if (request_body.country_action[1] != "") {
                    request_body.country_action = request_body.country_action.slice(1);
                }
                request_body.country_action = request_body.country_action.join("");
            }

            if (request_body.street_address.length > 0) {
                if (request_body.street_address[1] != "") {
                    request_body.street_address = request_body.street_address.slice(1);
                }
                request_body.street_address = request_body.street_address.join("");
            }

            if (request_body.country.length > 0) {
                if (request_body.country[1] != "") {
                    request_body.country = request_body.country.slice(1);
                }
                request_body.country = request_body.country.join("");
            }

            if (request_body.select_country.length > 0) {
                if (request_body.select_country[1] != "") {
                    request_body.select_country = request_body.select_country.slice(1);
                }
                request_body.select_country = request_body.select_country.join("");
            }

            if (request_body.state.length > 0) {
                if (request_body.state[1] != "") {
                    request_body.state = request_body.state.slice(1);
                }
                request_body.state = request_body.state.join("");
            }

            if (request_body.select_state.length > 0) {
                if (request_body.select_state[1] != "") {
                    request_body.select_state = request_body.select_state.slice(1);
                }
                request_body.select_state = request_body.select_state.join("");
            }

            if (request_body.company.length > 0) {
                if (request_body.company[1] != "") {
                    request_body.company = request_body.company.slice(1);
                }
                request_body.company = request_body.company.join("");
            }

            if (request_body.marketing_checkbox.length > 0) {
                if (request_body.marketing_checkbox[1] != "") {
                    request_body.marketing_checkbox = request_body.marketing_checkbox.slice(1);
                }
                request_body.marketing_checkbox = request_body.marketing_checkbox.join("");
            }

            if (request_body.billing_details.length > 0) {
                if (request_body.billing_details[1] != "") {
                    request_body.billing_details = request_body.billing_details.slice(1);
                }
                request_body.billing_details = request_body.billing_details.join("");
            }

            if (request_body.same_billing_details.length > 0) {
                if (request_body.same_billing_details[1] != "") {
                    request_body.same_billing_details = request_body.same_billing_details.slice(1);
                }
                request_body.same_billing_details = request_body.same_billing_details.join("");
            }

            if (request_body.shipping_option_title.length > 0) {
                if (request_body.shipping_option_title[1] != "") {
                    request_body.shipping_option_title = request_body.shipping_option_title.slice(1);
                }
                request_body.shipping_option_title = request_body.shipping_option_title.join("");
            }

            if (request_body.shipping_option_title_error.length > 0) {
                if (request_body.shipping_option_title_error[1] != "") {
                    request_body.shipping_option_title_error = request_body.shipping_option_title_error.slice(1);
                }
                request_body.shipping_option_title_error = request_body.shipping_option_title_error.join("");
            }

            if (request_body.order_summary_title.length > 0) {
                if (request_body.order_summary_title[1] != "") {
                    request_body.order_summary_title = request_body.order_summary_title.slice(1);
                }
                request_body.order_summary_title = request_body.order_summary_title.join("");
            }

            if (request_body.show_order_summary.length > 0) {
                if (request_body.show_order_summary[1] != "") {
                    request_body.show_order_summary = request_body.show_order_summary.slice(1);
                }
                request_body.show_order_summary = request_body.show_order_summary.join("");
            }

            if (request_body.hide_order_summary.length > 0) {
                if (request_body.hide_order_summary[1] != "") {
                    request_body.hide_order_summary = request_body.hide_order_summary.slice(1);
                }
                request_body.hide_order_summary = request_body.hide_order_summary.join("");
            }

            if (request_body.subtotal.length > 0) {
                if (request_body.subtotal[1] != "") {
                    request_body.subtotal = request_body.subtotal.slice(1);
                }
                request_body.subtotal = request_body.subtotal.join("");
            }

            if (request_body.discount_code.length > 0) {
                if (request_body.discount_code[1] != "") {
                    request_body.discount_code = request_body.discount_code.slice(1);
                }
                request_body.discount_code = request_body.discount_code.join("");
            }

            if (request_body.discount.length > 0) {
                if (request_body.discount[1] != "") {
                    request_body.discount = request_body.discount.slice(1);
                }
                request_body.discount = request_body.discount.join("");
            }

            if (request_body.delivery.length > 0) {
                if (request_body.delivery[1] != "") {
                    request_body.delivery = request_body.delivery.slice(1);
                }
                request_body.delivery = request_body.delivery.join("");
            }

            if (request_body.free.length > 0) {
                if (request_body.free[1] != "") {
                    request_body.free = request_body.free.slice(1);
                }
                request_body.free = request_body.free.join("");
            }

            if (request_body.total.length > 0) {
                if (request_body.total[1] != "") {
                    request_body.total = request_body.total.slice(1);
                }
                request_body.total = request_body.total.join("");
            }

            if (request_body.invalid_discount_code.length > 0) {
                if (request_body.invalid_discount_code[1] != "") {
                    request_body.invalid_discount_code = request_body.invalid_discount_code.slice(1);
                }
                request_body.invalid_discount_code = request_body.invalid_discount_code.join("");
            }

            if (request_body.apply_button.length > 0) {
                if (request_body.apply_button[1] != "") {
                    request_body.apply_button = request_body.apply_button.slice(1);
                }
                request_body.apply_button = request_body.apply_button.join("");
            }

            if (request_body.payment_method.length > 0) {
                if (request_body.payment_method[1] != "") {
                    request_body.payment_method = request_body.payment_method.slice(1);
                }
                request_body.payment_method = request_body.payment_method.join("");
            }

            if (request_body.credit_card.length > 0) {
                if (request_body.credit_card[1] != "") {
                    request_body.credit_card = request_body.credit_card.slice(1);
                }
                request_body.credit_card = request_body.credit_card.join("");
            }

            if (request_body.and_more.length > 0) {
                if (request_body.and_more[1] != "") {
                    request_body.and_more = request_body.and_more.slice(1);
                }
                request_body.and_more = request_body.and_more.join("");
            }

            if (request_body.credit_card_holder_label.length > 0) {
                if (request_body.credit_card_holder_label[1] != "") {
                    request_body.credit_card_holder_label = request_body.credit_card_holder_label.slice(1);
                }
                request_body.credit_card_holder_label = request_body.credit_card_holder_label.join("");
            }

            if (request_body.credit_card_number_label.length > 0) {
                if (request_body.credit_card_number_label[1] != "") {
                    request_body.credit_card_number_label = request_body.credit_card_number_label.slice(1);
                }
                request_body.credit_card_number_label = request_body.credit_card_number_label.join("");
            }

            if (request_body.credit_card_number_placeholder.length > 0) {
                if (request_body.credit_card_number_placeholder[1] != "") {
                    request_body.credit_card_number_placeholder = request_body.credit_card_number_placeholder.slice(1);
                }
                request_body.credit_card_number_placeholder = request_body.credit_card_number_placeholder.join("");
            }

            if (request_body.credit_card_expiry_date.length > 0) {
                if (request_body.credit_card_expiry_date[1] != "") {
                    request_body.credit_card_expiry_date = request_body.credit_card_expiry_date.slice(1);
                }
                request_body.credit_card_expiry_date = request_body.credit_card_expiry_date.join("");
            }

            if (request_body.expire_date_placeholder.length > 0) {
                if (request_body.expire_date_placeholder[1] != "") {
                    request_body.expire_date_placeholder = request_body.expire_date_placeholder.slice(1);
                }
                request_body.expire_date_placeholder = request_body.expire_date_placeholder.join("");
            }

            if (request_body.expiry_date_long.length > 0) {
                if (request_body.expiry_date_long[1] != "") {
                    request_body.expiry_date_long = request_body.expiry_date_long.slice(1);
                }
                request_body.expiry_date_long = request_body.expiry_date_long.join("");
            }

            if (request_body.discount_code_label.length > 0) {
                if (request_body.discount_code_label[1] != "") {
                    request_body.discount_code_label = request_body.discount_code_label.slice(1);
                }
                request_body.discount_code_label = request_body.discount_code_label.join("");
            }

            if (request_body.security_code.length > 0) {
                if (request_body.security_code[1] != "") {
                    request_body.security_code = request_body.security_code.slice(1);
                }
                request_body.security_code = request_body.security_code.join("");
            }

            if (request_body.cvv_placeholder.length > 0) {
                if (request_body.cvv_placeholder[1] != "") {
                    request_body.cvv_placeholder = request_body.cvv_placeholder.slice(1);
                }
                request_body.cvv_placeholder = request_body.cvv_placeholder.join("");
            }

            if (request_body.valid_card.length > 0) {
                if (request_body.valid_card[1] != "") {
                    request_body.valid_card = request_body.valid_card.slice(1);
                }
                request_body.valid_card = request_body.valid_card.join("");
            }

            if (request_body.redirected_to_external_window.length > 0) {
                if (request_body.redirected_to_external_window[1] != "") {
                    request_body.redirected_to_external_window = request_body.redirected_to_external_window.slice(1);
                }
                request_body.redirected_to_external_window = request_body.redirected_to_external_window.join("");
            }

            if (request_body.redirected_to_free_purchase.length > 0) {
                if (request_body.redirected_to_free_purchase[1] != "") {
                    request_body.redirected_to_free_purchase = request_body.redirected_to_free_purchase.slice(1);
                }
                request_body.redirected_to_free_purchase = request_body.redirected_to_free_purchase.join("");
            }

            if (request_body.cash_on_delivery.length > 0) {
                if (request_body.cash_on_delivery[1] != "") {
                    request_body.cash_on_delivery = request_body.cash_on_delivery.slice(1);
                }
                request_body.cash_on_delivery = request_body.cash_on_delivery.join("");
            }

            if (request_body.bank_transfer.length > 0) {
                if (request_body.bank_transfer[1] != "") {
                    request_body.bank_transfer = request_body.bank_transfer.slice(1);
                }
                request_body.bank_transfer = request_body.bank_transfer.join("");
            }

            if (request_body.klarna_pay_later.length > 0) {
                if (request_body.klarna_pay_later[1] != "") {
                    request_body.klarna_pay_later = request_body.klarna_pay_later.slice(1);
                }
                request_body.klarna_pay_later = request_body.klarna_pay_later.join("");
            }

            if (request_body.klarna_slice_it.length > 0) {
                if (request_body.klarna_slice_it[1] != "") {
                    request_body.klarna_slice_it = request_body.klarna_slice_it.slice(1);
                }
                request_body.klarna_slice_it = request_body.klarna_slice_it.join("");
            }

            if (request_body.klarna_slice_it.length > 0) {
                if (request_body.complete_purchase_button[1] != "") {
                    request_body.complete_purchase_button = request_body.complete_purchase_button.slice(1);
                }
                request_body.complete_purchase_button = request_body.complete_purchase_button.join("");
            }

            if (request_body.complete_purchase_with.length > 0) {
                if (request_body.complete_purchase_with[1] != "") {
                    request_body.complete_purchase_with = request_body.complete_purchase_with.slice(1);
                }
                request_body.complete_purchase_with = request_body.complete_purchase_with.join("");
            }

            if (request_body.secured_transaction.length > 0) {
                if (request_body.secured_transaction[1] != "") {
                    request_body.secured_transaction = request_body.secured_transaction.slice(1);
                }
                request_body.secured_transaction = request_body.secured_transaction.join("");
            }

            if (request_body.free_on_completed.length > 0) {
                if (request_body.free_on_completed[1] != "") {
                    request_body.free_on_completed = request_body.free_on_completed.slice(1);
                }
                request_body.free_on_completed = request_body.free_on_completed.join("");
            }

            if (request_body.free_purchase.length > 0) {
                if (request_body.free_purchase[1] != "") {
                    request_body.free_purchase = request_body.free_purchase.slice(1);
                }
                request_body.free_purchase = request_body.free_purchase.join("");
            }

            if (request_body.ineligible_country.length > 0) {
                if (request_body.ineligible_country[1] != "") {
                    request_body.ineligible_country = request_body.ineligible_country.slice(1);
                }
                request_body.ineligible_country = request_body.ineligible_country.join("");
            }

            if (request_body.ineligilble_country_steps.length > 0) {
                if (request_body.ineligilble_country_steps[1] != "") {
                    request_body.ineligilble_country_steps = request_body.ineligilble_country_steps.slice(1);
                }
                request_body.ineligilble_country_steps = request_body.ineligilble_country_steps.join("");
            }

            if (request_body.too_low_amount.length > 0) {
                if (request_body.too_low_amount[1] != "") {
                    request_body.too_low_amount = request_body.too_low_amount.slice(1);
                }
                request_body.too_low_amount = request_body.too_low_amount.join("");
            }

            if (request_body.too_low_amt_step.length > 0) {
                if (request_body.too_low_amt_step[1] != "") {
                    request_body.too_low_amt_step = request_body.too_low_amt_step.slice(1);
                }
                request_body.too_low_amt_step = request_body.too_low_amt_step.join("");
            }

            if (request_body.pay_price.length > 0) {
                if (request_body.pay_price[1] != "") {
                    request_body.pay_price = request_body.pay_price.slice(1);
                }
                request_body.pay_price = request_body.pay_price.join("");
            }

            if (request_body?.confirm?.length > 0) {
                if (request_body.confirm[1] != "") {
                    request_body.confirm = request_body.confirm.slice(1);
                }
                request_body.confirm = request_body.confirm.join("");
            }

            if (request_body.return_policy_link.length > 0) {
                if (request_body.return_policy_link[1] != "") {
                    request_body.return_policy_link = request_body.return_policy_link.slice(1);
                }
                request_body.return_policy_link = request_body.return_policy_link.join("");
            }

            if (request_body.privacy_policy_link.length > 0) {
                if (request_body.privacy_policy_link[1] != "") {
                    request_body.privacy_policy_link = request_body.privacy_policy_link.slice(1);
                }
                request_body.privacy_policy_link = request_body.privacy_policy_link.join("");
            }

            if (request_body.terms_and_cond.length > 0) {
                if (request_body.terms_and_cond[1] != "") {
                    request_body.terms_and_cond = request_body.terms_and_cond.slice(1);
                }
                request_body.terms_and_cond = request_body.terms_and_cond.join("");
            }

            if (request_body.processing_payment.length > 0) {
                if (request_body.processing_payment[1] != "") {
                    request_body.processing_payment = request_body.processing_payment.slice(1);
                }
                request_body.processing_payment = request_body.processing_payment.join("");
            }

            if (request_body.create_order.length > 0) {
                if (request_body.create_order[1] != "") {
                    request_body.create_order = request_body.create_order.slice(1);
                }
                request_body.create_order = request_body.create_order.join("");
            }

            if (request_body.loading_checkout.length > 0) {
                if (request_body.loading_checkout[1] != "") {
                    request_body.loading_checkout = request_body.loading_checkout.slice(1);
                }
                request_body.loading_checkout = request_body.loading_checkout.join("");
            }

            if (request_body.purchase_button.length > 0) {
                if (request_body.purchase_button[1] != "") {
                    request_body.purchase_button = request_body.purchase_button.slice(1);
                }
                request_body.purchase_button = request_body.purchase_button.join("");
            }

            if (request_body.cancel_button.length > 0) {
                if (request_body.cancel_button[1] != "") {
                    request_body.cancel_button = request_body.cancel_button.slice(1);
                }
                request_body.cancel_button = request_body.cancel_button.join("");
            }

            if (request_body.buy_button.length > 0) {
                if (request_body.buy_button[1] != "") {
                    request_body.buy_button = request_body.buy_button.slice(1);
                }
                request_body.buy_button = request_body.buy_button.join("");
            }

            if (request_body.order_completed.length > 0) {
                if (request_body.order_completed[1] != "") {
                    request_body.order_completed = request_body.order_completed.slice(1);
                }
                request_body.order_completed = request_body.order_completed.join("");
            }

            if (request_body.purchase_completed_title.length > 0) {
                if (request_body.purchase_completed_title[1] != "") {
                    request_body.purchase_completed_title = request_body.purchase_completed_title.slice(1);
                }
                request_body.purchase_completed_title = request_body.purchase_completed_title.join("");
            }

            if (request_body.order_receive.length > 0) {
                if (request_body.order_receive[1] != "") {
                    request_body.order_receive = request_body.order_receive.slice(1);
                }
                request_body.order_receive = request_body.order_receive.join("");
            }

            if (request_body.order_received.length > 0) {
                if (request_body.order_received[1] != "") {
                    request_body.order_received = request_body.order_received.slice(1);
                }
                request_body.order_received = request_body.order_received.join("");
            }

            if (request_body.details.length > 0) {
                if (request_body.details[1] != "") {
                    request_body.details = request_body.details.slice(1);
                }
                request_body.details = request_body.details.join("");
            }

            if (request_body.thanks.length > 0) {
                if (request_body.thanks[1] != "") {
                    request_body.thanks = request_body.thanks.slice(1);
                }
                request_body.thanks = request_body.thanks.join("");
            }

            if (request_body.shipping_address_title.length > 0) {
                if (request_body.shipping_address_title[1] != "") {
                    request_body.shipping_address_title = request_body.shipping_address_title.slice(1);
                }
                request_body.shipping_address_title = request_body.shipping_address_title.join("");
            }

            if (request_body.billing_address_title.length > 0) {
                if (request_body.billing_address_title[1] != "") {
                    request_body.billing_address_title = request_body.billing_address_title.slice(1);
                }
                request_body.billing_address_title = request_body.billing_address_title.join("");
            }

            if (request_body.billing_same_as_shipping.length > 0) {
                if (request_body.billing_same_as_shipping[1] != "") {
                    request_body.billing_same_as_shipping = request_body.billing_same_as_shipping.slice(1);
                }
                request_body.billing_same_as_shipping = request_body.billing_same_as_shipping.join("");
            }

            if (request_body.shipping_method_title.length > 0) {
                if (request_body.shipping_method_title[1] != "") {
                    request_body.shipping_method_title = request_body.shipping_method_title.slice(1);
                }
                request_body.shipping_method_title = request_body.shipping_method_title.join("");
            }

            if (request_body.payment_title.length > 0) {
                if (request_body.payment_title[1] != "") {
                    request_body.payment_title = request_body.payment_title.slice(1);
                }
                request_body.payment_title = request_body.payment_title.join("");
            }

            if (request_body.order_recap.length > 0) {
                if (request_body.order_recap[1] != "") {
                    request_body.order_recap = request_body.order_recap.slice(1);
                }
                request_body.order_recap = request_body.order_recap.join("");
            }

            if (request_body.additional_items.length > 0) {
                if (request_body.additional_items[1] != "") {
                    request_body.additional_items = request_body.additional_items.slice(1);
                }
                request_body.additional_items = request_body.additional_items.join("");
            }

            if (request_body.back_to_shop.length > 0) {
                if (request_body.back_to_shop[1] != "") {
                    request_body.back_to_shop = request_body.back_to_shop.slice(1);
                }
                request_body.back_to_shop = request_body.back_to_shop.join("");
            }

            if (request_body.default_subjects.length > 0) {
                if (request_body.default_subjects[1] != "") {
                    request_body.default_subjects = request_body.default_subjects.slice(1);
                }
                request_body.default_subjects = request_body.default_subjects.join("");
            }
            if (request_body.default_title.length > 0) {
                if (request_body.default_title[1] != "") {
                    request_body.default_title = request_body.default_title.slice(1);
                }
                request_body.default_title = request_body.default_title.join("");
            }
            if (request_body.default_greeting.length > 0) {
                if (request_body.default_greeting[1] != "") {
                    request_body.default_greeting = request_body.default_greeting.slice(1);
                }
                request_body.default_greeting = request_body.default_greeting.join("");
            }

            if (request_body.default_message.length > 0) {
                if (request_body.default_message[1] != "") {
                    request_body.default_message = request_body.default_message.slice(1);
                }
                request_body.default_message = request_body.default_message.join("");
            }

            if (request_body.default_call_to_action.length > 0) {
                if (request_body.default_call_to_action[1] != "") {
                    request_body.default_call_to_action = request_body.default_call_to_action.slice(1);
                }
                request_body.default_call_to_action = request_body.default_call_to_action.join("");
            }

            if (request_body.or.length > 0) {
                if (request_body.or[1] != "") {
                    request_body.or = request_body.or.slice(1);
                }
                request_body.or = request_body.or.join("");
            }

            if (request_body.visit_website.length > 0) {
                if (request_body.visit_website[1] != "") {
                    request_body.visit_website = request_body.visit_website.slice(1);
                }
                request_body.visit_website = request_body.visit_website.join("");
            }

            if (request_body.cart_title.length > 0) {
                if (request_body.cart_title[1] != "") {
                    request_body.cart_title = request_body.cart_title.slice(1);
                }
                request_body.cart_title = request_body.cart_title.join("");
            }

            if (request_body.default_disclaimer.length > 0) {
                if (request_body.default_disclaimer[1] != "") {
                    request_body.default_disclaimer = request_body.default_disclaimer.slice(1);
                }
                request_body.default_disclaimer = request_body.default_disclaimer.join("");
            }

            if (request_body.accept_marketing_checkbox.length > 0) {
                if (request_body.accept_marketing_checkbox[1] != "") {
                    request_body.accept_marketing_checkbox = request_body.accept_marketing_checkbox.slice(1);
                }
                request_body.accept_marketing_checkbox = request_body.accept_marketing_checkbox.join("");
            }

            if (request_body.consent.length > 0) {
                if (request_body.consent[1] != "") {
                    request_body.consent = request_body.consent.slice(1);
                }
                request_body.consent = request_body.consent.join("");
            }

            if (request_body.invalid.length > 0) {
                if (request_body.invalid[1] != "") {
                    request_body.invalid = request_body.invalid.slice(1);
                }
                request_body.invalid = request_body.invalid.join("");
            }

            if (request_body.payment_failed.length > 0) {
                if (request_body.payment_failed[1] != "") {
                    request_body.payment_failed = request_body.payment_failed.slice(1);
                }
                request_body.payment_failed = request_body.payment_failed.join("");
            }
            if (request_body.direct_bank_transfer.length > 0) {
                if (request_body.direct_bank_transfer[1] != "") {
                    request_body.direct_bank_transfer = request_body.direct_bank_transfer.slice(1);
                }
                request_body.direct_bank_transfer = request_body.direct_bank_transfer.join("");
            }

            if (request_body.scarcity_title.length > 0) {
                if (request_body.scarcity_title[1] != "") {
                    request_body.scarcity_title = request_body.scarcity_title.slice(1);
                }
                request_body.scarcity_title = request_body.scarcity_title.join("");
            }
            if (request_body.scarcity_clock_prefix.length > 0) {
                if (request_body.scarcity_clock_prefix[1] != "") {
                    request_body.scarcity_clock_prefix = request_body.scarcity_clock_prefix.slice(1);
                }
                request_body.scarcity_clock_prefix = request_body.scarcity_clock_prefix.join("");
            }
            if (request_body.scarcity_clock_suffix.length > 0) {
                if (request_body.scarcity_clock_suffix[1] != "") {
                    request_body.scarcity_clock_suffix = request_body.scarcity_clock_suffix.slice(1);
                }
                request_body.scarcity_clock_suffix = request_body.scarcity_clock_suffix.join("");
            }
            if (request_body.scarcity_timer_finished.length > 0) {
                if (request_body.scarcity_timer_finished[1] != "") {
                    request_body.scarcity_timer_finished = request_body.scarcity_timer_finished.slice(1);
                }
                request_body.scarcity_timer_finished = request_body.scarcity_timer_finished.join("");
            }

            if (request_body.first_name_required.length > 0) {
                if (request_body.first_name_required[1] != "") {
                    request_body.first_name_required = request_body.first_name_required.slice(1);
                }
                request_body.first_name_required = request_body.first_name_required.join("");
            }

            if (request_body.valid_firstname.length > 0) {
                if (request_body.valid_firstname[1] != "") {
                    request_body.valid_firstname = request_body.valid_firstname.slice(1);
                }
                request_body.valid_firstname = request_body.valid_firstname.join("");
            }

            if (request_body.email_required.length > 0) {
                if (request_body.email_required[1] != "") {
                    request_body.email_required = request_body.email_required.slice(1);
                }
                request_body.email_required = request_body.email_required.join("");
            }

            if (request_body.valid_email.length > 0) {
                if (request_body.valid_email[1] != "") {
                    request_body.valid_email = request_body.valid_email.slice(1);
                }
                request_body.valid_email = request_body.valid_email.join("");
            }

            if (request_body.phone_required.length > 0) {
                if (request_body.phone_required[1] != "") {
                    request_body.phone_required = request_body.phone_required.slice(1);
                }
                request_body.phone_required = request_body.phone_required.join("");
            }

            if (request_body.valid_phone.length > 0) {
                if (request_body.valid_phone[1] != "") {
                    request_body.valid_phone = request_body.valid_phone.slice(1);
                }
                request_body.valid_phone = request_body.valid_phone.join("");
            }

            if (request_body.address_required.length > 0) {
                if (request_body.address_required[1] != "") {
                    request_body.address_required = request_body.address_required.slice(1);
                }
                request_body.address_required = request_body.address_required.join("");
            }

            if (request_body.zip_required.length > 0) {
                if (request_body.zip_required[1] != "") {
                    request_body.zip_required = request_body.zip_required.slice(1);
                }
                request_body.zip_required = request_body.zip_required.join("");
            }

            if (request_body.valid_zip.length > 0) {
                if (request_body.valid_zip[1] != "") {
                    request_body.valid_zip = request_body.valid_zip.slice(1);
                }
                request_body.valid_zip = request_body.valid_zip.join("");
            }

            if (request_body.city_required.length > 0) {
                if (request_body.city_required[1] != "") {
                    request_body.city_required = request_body.city_required.slice(1);
                }
                request_body.city_required = request_body.city_required.join("");
            }

            if (request_body.state_required.length > 0) {
                if (request_body.state_required[1] != "") {
                    request_body.state_required = request_body.state_required.slice(1);
                }
                request_body.state_required = request_body.state_required.join("");
            }

            if (request_body.country_required.length > 0) {
                if (request_body.country_required[1] != "") {
                    request_body.country_required = request_body.country_required.slice(1);
                }
                request_body.country_required = request_body.country_required.join("");
            }

            let translation_id = request_body?.translation_id;
            delete request_body?.translation_id;

            // console.error("Translation request_body------------", request_body);

            if (translation_id) {
                await Translations.update(request_body, {
                    where: {
                        id: translation_id,
                    },
                });
            } else {
                await Translations.create(request_body);
            }

            return res.json({
                status: true,
                message: "Translation update successfully",
                redirect_url: `${process.env.APP_URL}/${request_body?.store_id}/translations`,
            });
        } catch (error) {
            console.error("Translation error------------", error);
            return res.json({
                status: false,
                message: "Something went wrong.Please try again later",
            });
        }
    }

    let translation = await Translations.findOne({
        where: {
            store_id: store_id,
            user_id: auth_user.id,
        },
    });

    let translation_lang;
    if (translation != null) {
        translation_lang = await ChangeLanguage((translation?.translation_language).toLowerCase());
    }

    res.render("backend/Translations/translations", {
        store_id: store_id,
        auth_user: auth_user,
        auth_store: auth_store,
        active_menu: "translations",

        translation: translation,
        translation_lang: translation_lang,
    });
};

//extra
module.exports.delete_translation = async (req, res, next) => {
    let request_body = req.body;
    try {
        if (req.method == "POST") {
            await Translations.destroy({
                where: {
                    id: request_body.id,
                },
            });
            return res.json({
                status: true,
                redirect_url: `${process.env.APP_URL}/${request_body?.store_id}/translations`,
            });
        }
    } catch (e) {
        return res.json({
            status: false,
            message: "Failed to change",
        });
    }
};

module.exports.change_language = async (req, res, next) => {
    let request_body = req.body;
    try {
        const selected_language_value = await ChangeLanguage(request_body?.selected_language);
        res.json({
            status: true,
            lang: selected_language_value,
            name: request_body?.selected_language,
            message: "Selected language data",
        });
    } catch (error) {
        console.error("change_language error------------", error);
        return res.json({
            error: error,
            status: false,
            message: "Something went wrong. Please try again.",
        });
    }
};