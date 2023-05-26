let express = require("express");
const multer = require("multer");

const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/uploads");
    },
    filename: function (req, file, cb) {
        const split_mime = file.mimetype.split("/");
        const extension = typeof split_mime[1] !== "undefined" ? split_mime[1] : "jpeg";
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = multer({
    storage: storage,
});

/*** Middleware ***/
const { RestricDomainMiddleware } = require("../middleware");
const AuthorizeMiddleware = require("../middleware/authorize");

/*** Cron Controllers ***/
require("./Controllers/Crons/CronController");
require("./Controllers/Crons/CronEmailFlowController");
require("./Controllers/Crons/CronRecoveryEmailsController");

/*** Application Controllers ***/
const AuthController = require("./Controllers/AuthController");
const DashboardController = require("./Controllers/DashboardController");
const AccountSettingsController = require("./Controllers/AccountSettingsController");
const BillingController = require("./Controllers/BillingController");

const CheckoutTemplatesController = require("./Controllers/CheckoutTemplatesController");
const CustomizeCheckoutController = require("./Controllers/CustomizeCheckoutController");

const ShippingRateController = require("./Controllers/ShippingRateController");
const PaymentMethodsController = require("./Controllers/PaymentMethodsController");
const TranslationController = require("./Controllers/TranslationController");
const TaxesController = require("./Controllers/TaxesController");
const BuyLinkController = require("./Controllers/BuyLinkController");
const UpsellController = require("./Controllers/UpsellController");
const AutomaticDiscountController = require("./Controllers/AutomaticDiscountController");
const CartRecoveryEmails = require("./Controllers/CartRecoveryEmails");
const CustomDomainController = require("./Controllers/CustomDomainController");

const StripeWebhook = require("./Controllers/Webhook/StripeWebhook");
const ShopifyWebhook = require("./Controllers/Webhook/ShopifyWebhook");
const CheckoutWebhook = require("./Controllers/Webhook/CheckoutWebhook");
const PayoutMasterWebhook = require("./Controllers/Webhook/PayoutMasterWebhook");

const TestController = require("./Controllers/TestController");

/*** Admin  Controllers ***/
const AdminSubscriptionController = require("./Controllers/Admin/AdminSubscriptionController");

/*** Shopify Controllers ***/
const CheckoutController = require("./Controllers/CheckoutController");
const ShopifyStoreController = require("./Controllers/Shopify/ShopifyStoreController");


/************************** Order Controller **************************/
const OrderController = require("./Controllers/OrdersController");



/******************************************************
*** Auth Router ***
******************************************************/
router.get("/", AuthorizeMiddleware.frontend_authorize, RestricDomainMiddleware, AuthController.login);
router.get("/login", AuthorizeMiddleware.frontend_authorize, RestricDomainMiddleware, AuthController.login);
router.post("/login", upload.none(), AuthController.login);

router.get("/register", AuthorizeMiddleware.frontend_authorize, RestricDomainMiddleware, AuthController.Register);
router.post("/register", upload.none(), AuthController.Register);

router.get("/resend-verification-email", AuthorizeMiddleware.frontend_authorize, RestricDomainMiddleware, AuthController.ResendVerificationLink);
router.post("/resend-verification-email", upload.none(), AuthorizeMiddleware.frontend_authorize, AuthController.ResendVerificationLink);

router.get("/account-verify/:user_id", AuthorizeMiddleware.frontend_authorize, RestricDomainMiddleware, AuthController.AccountVerification);
router.get("/verify-account/:user_id", AuthorizeMiddleware.frontend_authorize, RestricDomainMiddleware, AuthController.AccountVerificationSuccess);
router.post("/account-verify", upload.none(), AuthorizeMiddleware.frontend_authorize, AuthController.AccountVerification);

router.get("/logout", AuthController.logout);

router.get("/forgotPassword", AuthorizeMiddleware.frontend_authorize, RestricDomainMiddleware, AuthController.ForgotPassword);
router.post("/forgotPassword", upload.none(), AuthController.ForgotPassword);
router.get("/forgot-password/:id", AuthorizeMiddleware.frontend_authorize, RestricDomainMiddleware, AuthController.ForgotPasswordMessage);
router.post("/resend-link", upload.none(), AuthorizeMiddleware.frontend_authorize, AuthController.ForgotPasswordMessage);
router.get("/resetSuccess", AuthorizeMiddleware.frontend_authorize, RestricDomainMiddleware, AuthController.ResetPasswordSuccess);

router.get("/resetPassword/:user_id", AuthorizeMiddleware.frontend_authorize, RestricDomainMiddleware, AuthController.ResetPassword);
router.post("/resetPassword/:user_id", upload.none(), AuthController.ResetPassword);

// Account Setup Routers
router.get("/account-settings", AuthorizeMiddleware.wed_authorize, AccountSettingsController.AccountSettings);
router.get("/account-setting/:store_id", AuthorizeMiddleware.wed_authorize, AccountSettingsController.AccountSettingsStore);
router.post("/account-settings", upload.none(), AuthorizeMiddleware.wed_authorize, AccountSettingsController.AccountSettings);

router.post("/change-avatar", upload.single("file"), AuthorizeMiddleware.wed_authorize, AccountSettingsController.ChangeAvatar);
router.delete("/delete-avatar", upload.none(), AuthorizeMiddleware.wed_authorize, AccountSettingsController.DeleteAvatar);
router.post("/changePassword", upload.none(), AuthorizeMiddleware.wed_authorize, AccountSettingsController.ChangePassword);

// Store Routers
router.get("/store-connect", upload.none(), AuthorizeMiddleware.wed_authorize, AuthorizeMiddleware.checksubscription, ShopifyStoreController.StoreConnect);
router.post("/store-connect", upload.none(), AuthorizeMiddleware.wed_authorize, ShopifyStoreController.StoreConnect);

router.get("/create-new-store/:store_id", AuthorizeMiddleware.wed_authorize, ShopifyStoreController.CreateNewStore);
router.post("/change-default-store", AuthorizeMiddleware.wed_authorize, ShopifyStoreController.ChangeDefaultStore);
router.get("/:store_id/manage-store", AuthorizeMiddleware.wed_authorize, ShopifyStoreController.manage_store);
router.delete("/store-delete", upload.none(), AuthorizeMiddleware.wed_authorize, ShopifyStoreController.store_delete);


// Dashboard Routers
router.get("/:store_id/dashboard", AuthorizeMiddleware.wed_authorize, AuthorizeMiddleware.checksubscription, DashboardController.dashboard);
router.post("/dashboard/filter", DashboardController.dashboard_filter);

// Get States via Routers
router.post("/select-state", upload.none(), CheckoutController.getStatesByCountryCode);



// Checkout Template
router.get("/:store_id/checkout-templates", AuthorizeMiddleware.wed_authorize, AuthorizeMiddleware.checksubscription, CheckoutTemplatesController.checkout_templates);
router.post("/checkout-templates", upload.none(), AuthorizeMiddleware.wed_authorize, CheckoutTemplatesController.checkout_templates);

router.post("/change-checkout-templates", upload.none(), CheckoutTemplatesController.change_checkout_templates);

router.get("/:store_id/preview-checkout-new", AuthorizeMiddleware.wed_authorize, AuthorizeMiddleware.checksubscription, CheckoutTemplatesController.preview_checkout_new);



//Customize Checkout Routers
router.get("/:store_id/customize-checkout", AuthorizeMiddleware.wed_authorize, AuthorizeMiddleware.checksubscription, CustomizeCheckoutController.customize_checkout);
router.post("/customize-checkout", upload.none(), AuthorizeMiddleware.wed_authorize, CustomizeCheckoutController.customize_checkout);

router.get("/:store_id/preview-checkout", AuthorizeMiddleware.wed_authorize, AuthorizeMiddleware.checksubscription, CustomizeCheckoutController.preview_checkout);
router.get("/:store_id/preview-thankyou", AuthorizeMiddleware.wed_authorize, AuthorizeMiddleware.checksubscription, CustomizeCheckoutController.preview_thankyou);
router.post("/checkout-delete-section", upload.none(), AuthorizeMiddleware.wed_authorize, CustomizeCheckoutController.delete_section);
router.get("/:store_id/get-shop-token", AuthorizeMiddleware.wed_authorize, AuthorizeMiddleware.checksubscription, CustomizeCheckoutController.get_shopToken);

//Shipping Rate Routers
router.get("/:store_id/shipping-rates", AuthorizeMiddleware.wed_authorize, AuthorizeMiddleware.checksubscription, ShippingRateController.shipping_rates);
router.post("/shipping-rates", upload.none(), AuthorizeMiddleware.wed_authorize, ShippingRateController.shipping_rates);

router.get("/:store_id/add-shipping-rate", AuthorizeMiddleware.wed_authorize, AuthorizeMiddleware.checksubscription, ShippingRateController.add_shipping_rate);
router.post("/add-shipping-rate", upload.none(), AuthorizeMiddleware.wed_authorize, ShippingRateController.add_shipping_rate);

router.get("/:store_id/edit-shipping-rate/:id", AuthorizeMiddleware.wed_authorize, AuthorizeMiddleware.checksubscription, ShippingRateController.edit_shipping_rate);
router.post("/edit-shipping-rate/", upload.none(), AuthorizeMiddleware.wed_authorize, ShippingRateController.edit_shipping_rate);

router.delete("/delete-shipping-rate", upload.none(), AuthorizeMiddleware.wed_authorize, ShippingRateController.delete_shipping_rate);

//Payment Method Routers
router.get("/:store_id/payment-methods", AuthorizeMiddleware.wed_authorize, AuthorizeMiddleware.checksubscription, PaymentMethodsController.payment_methods);
router.post("/payment-methods", upload.none(), AuthorizeMiddleware.wed_authorize, PaymentMethodsController.payment_methods);

router.get("/:store_id/add-payment-method", AuthorizeMiddleware.wed_authorize, AuthorizeMiddleware.checksubscription, PaymentMethodsController.add_payment_method);
router.post(
    "/add-payment-method",
    upload.fields([{ name: 'apple_certificate_pem' }, { name: 'apple_certificate_key' }]),
    AuthorizeMiddleware.wed_authorize,
    PaymentMethodsController.add_payment_method
);
router.post("/payment-verify", upload.none(), AuthorizeMiddleware.wed_authorize, PaymentMethodsController.payment_verify);

router.get("/:store_id/payment-method/:id", AuthorizeMiddleware.wed_authorize, AuthorizeMiddleware.checksubscription, PaymentMethodsController.edit_payment_method);
router.post(
    "/edit-payment-method/:id",
    upload.fields([{ name: 'apple_certificate_pem' }, { name: 'apple_certificate_key' }]),
    AuthorizeMiddleware.wed_authorize,
    PaymentMethodsController.edit_payment_method
);

router.post("/delete-payment-method/", upload.none(), AuthorizeMiddleware.wed_authorize, PaymentMethodsController.delete_payment_method);
router.get("/paypal-webhook", upload.none(), AuthorizeMiddleware.wed_authorize, AuthorizeMiddleware.checksubscription, PaymentMethodsController.paypal_webhook);

// Translations Routers
router.get("/:store_id/translations", AuthorizeMiddleware.wed_authorize, AuthorizeMiddleware.checksubscription, TranslationController.Translation);
router.post("/change-language", upload.none(), TranslationController.change_language);
router.post("/translations", upload.none(), AuthorizeMiddleware.wed_authorize, TranslationController.Translation);
router.post("/delete-translation", upload.none(), AuthorizeMiddleware.wed_authorize, TranslationController.delete_translation);

// Custom Domain Routers
router.get("/:store_id/custom-domain", AuthorizeMiddleware.wed_authorize, AuthorizeMiddleware.checksubscription, CustomDomainController.custom_domain);
router.post("/custom-domain", upload.none(), AuthorizeMiddleware.wed_authorize, CustomDomainController.custom_domain);
router.get("/:store_id/custom-domain/edit", AuthorizeMiddleware.wed_authorize, AuthorizeMiddleware.checksubscription, CustomDomainController.edit_custom_domain);
router.post("/custom-domain/edit", upload.none(), AuthorizeMiddleware.wed_authorize, CustomDomainController.edit_custom_domain);
router.delete("/custom-domain/delete", upload.none(), AuthorizeMiddleware.wed_authorize, CustomDomainController.delete_domain);

// Automatic Discounts Routers AuthorizeMiddleware.wed_authorize, AuthorizeMiddleware.checksubscription
router.get("/:store_id/discounts", AuthorizeMiddleware.wed_authorize, AuthorizeMiddleware.checksubscription, AutomaticDiscountController.discount_listing);
router.post("/discounts", AuthorizeMiddleware.wed_authorize, AutomaticDiscountController.discount_listing);

router.get("/:store_id/discount/create", AuthorizeMiddleware.wed_authorize, AuthorizeMiddleware.checksubscription, AutomaticDiscountController.add_discount);
router.post("/discount/create", upload.none(), AuthorizeMiddleware.wed_authorize, AutomaticDiscountController.add_discount);

router.get("/:store_id/discount/:discount_id/edit", AuthorizeMiddleware.wed_authorize, AuthorizeMiddleware.checksubscription, AutomaticDiscountController.edit_discount);
router.post("/discount/edit", upload.none(), AuthorizeMiddleware.wed_authorize, AutomaticDiscountController.edit_discount);

router.post("/delete-discount", upload.none(), AuthorizeMiddleware.wed_authorize, AutomaticDiscountController.delete_discount);
// router.get("/:store_id/product-variant/:product_id", AuthorizeMiddleware.wed_authorize, AutomaticDiscountController.product_variants);
// router.post("/add-varients", AuthorizeMiddleware.wed_authorize, AutomaticDiscountController.add_variants);

// Taxs Routers
router.get("/:store_id/taxes", AuthorizeMiddleware.wed_authorize, AuthorizeMiddleware.checksubscription, TaxesController.taxes_index);
router.post("/taxes_listing", upload.none(), AuthorizeMiddleware.wed_authorize, TaxesController.taxes_index_table);
router.get("/:store_id/taxes/new", AuthorizeMiddleware.wed_authorize, AuthorizeMiddleware.checksubscription, TaxesController.add_taxes);
router.post("/taxes/new", upload.none(), AuthorizeMiddleware.wed_authorize, TaxesController.add_taxes);
router.get("/:store_id/taxes/edit-tax-rate/:id", AuthorizeMiddleware.wed_authorize, AuthorizeMiddleware.checksubscription, TaxesController.edit_tax_rate);
router.post("/taxes/edit-tax-rate", upload.none(), AuthorizeMiddleware.wed_authorize, TaxesController.edit_tax_rate);
router.post("/taxes/tax-preference", upload.none(), AuthorizeMiddleware.wed_authorize, TaxesController.tax_preference);
router.delete("/taxes/delete-tax-rate", upload.none(), AuthorizeMiddleware.wed_authorize, TaxesController.delete_tax);

// Billing Routers
router.get("/:store_id/billing-details", AuthorizeMiddleware.wed_authorize, AuthorizeMiddleware.checksubscription, BillingController.billing_details);
router.get("/billing-detail", AuthorizeMiddleware.wed_authorize, AuthorizeMiddleware.checksubscription, BillingController.billing_details);
router.get("/billing-details/:store_id", AuthorizeMiddleware.wed_authorize, AuthorizeMiddleware.checksubscription, BillingController.billing_details);

router.post("/billing-detail", upload.none(), AuthorizeMiddleware.wed_authorize, BillingController.billing_details);
router.post("/billing/unsubscribe", upload.none(), AuthorizeMiddleware.wed_authorize, BillingController.unsubscribe_billing);

router.get("/:store_id/billing-thankyou", AuthorizeMiddleware.wed_authorize, BillingController.billing_thankyou);
router.get("/:store_id/invoice-details", AuthorizeMiddleware.wed_authorize, AuthorizeMiddleware.checksubscription, BillingController.invoice_listing);
router.post("/invoice-details", upload.none(), AuthorizeMiddleware.wed_authorize, BillingController.invoice_listing);
router.get("/:store_id/invoice-details/:invoice_id/", AuthorizeMiddleware.wed_authorize, AuthorizeMiddleware.checksubscription, BillingController.invoice_details);

// Disconnect Store Routers
router.get("/:store_id/store_disconnect", AuthorizeMiddleware.wed_authorize, AuthorizeMiddleware.checksubscription, ShopifyStoreController.UnPublishStore);

/////////////////////////// Buy Link Routers
router.get("/:store_id/buylink/list", AuthorizeMiddleware.wed_authorize, AuthorizeMiddleware.checksubscription, BuyLinkController.buylink_list);
router.post("/buylink/list", upload.none(), AuthorizeMiddleware.wed_authorize, BuyLinkController.buylink_list);

router.get("/:store_id/buylink/create", AuthorizeMiddleware.wed_authorize, AuthorizeMiddleware.checksubscription, BuyLinkController.buylink_create);
router.post("/buylink/create", upload.none(), AuthorizeMiddleware.wed_authorize, BuyLinkController.buylink_create);
router.delete("/buylink/delete", upload.none(), AuthorizeMiddleware.wed_authorize, BuyLinkController.buylink_delete);

/////////////////////////// Upsell Routers
router.get("/:store_id/upsell", AuthorizeMiddleware.wed_authorize, AuthorizeMiddleware.checksubscription, UpsellController.upsell);
router.post("/upsell", upload.none(), AuthorizeMiddleware.wed_authorize, UpsellController.upsell);

router.get("/:store_id/upsell/create", AuthorizeMiddleware.wed_authorize, AuthorizeMiddleware.checksubscription, UpsellController.upsell_create);
router.post("/upsell/create", upload.none(), AuthorizeMiddleware.wed_authorize, AuthorizeMiddleware.checksubscription, UpsellController.upsell_create);

router.get("/:store_id/upsells/:upsell_id/edit", AuthorizeMiddleware.wed_authorize, AuthorizeMiddleware.checksubscription, UpsellController.upsell_edit);
router.post("/upsells/edit", AuthorizeMiddleware.wed_authorize, AuthorizeMiddleware.checksubscription, UpsellController.upsell_edit);
router.post("/upsell/performance", AuthorizeMiddleware.wed_authorize, AuthorizeMiddleware.checksubscription, UpsellController.upsell_performance);

router.get("/:store_id/preview-upsell/:upsell_uuid", AuthorizeMiddleware.wed_authorize, AuthorizeMiddleware.checksubscription, UpsellController.upsell_preview);

router.delete("/delete-upsell", upload.none(), AuthorizeMiddleware.wed_authorize, UpsellController.delete_upsell);
router.delete("/delete-upsell-trigger", upload.none(), AuthorizeMiddleware.wed_authorize, UpsellController.delete_upsell_trigger);
router.delete("/delete-upsell-offer", upload.none(), AuthorizeMiddleware.wed_authorize, UpsellController.delete_upsell_offer);

/// API
router.post("/upsell-update", upload.none(), AuthorizeMiddleware.wed_authorize, UpsellController.upsell_update);
router.get("/upsell/lists", upload.none(), AuthorizeMiddleware.wed_authorize, UpsellController.upsell_lists);


// Cart Recovery
router.get("/:store_id/cart-recovery", AuthorizeMiddleware.wed_authorize, AuthorizeMiddleware.checksubscription, CartRecoveryEmails.cart_recovery);
router.post("/cart-recovery", upload.none(), AuthorizeMiddleware.wed_authorize, CartRecoveryEmails.cart_recovery);

router.get("/:store_id/cart-recovery/create", AuthorizeMiddleware.wed_authorize, AuthorizeMiddleware.checksubscription, CartRecoveryEmails.add_cart_recovery);
router.post("/cart-recovery/create", upload.none(), AuthorizeMiddleware.wed_authorize, CartRecoveryEmails.add_cart_recovery);

router.get("/:store_id/cart-recovery/:cart_recovery_uuid/edit", AuthorizeMiddleware.wed_authorize, AuthorizeMiddleware.checksubscription, CartRecoveryEmails.edit_cart_recovery);
router.post("/cart-recovery/edit", upload.none(), AuthorizeMiddleware.wed_authorize, CartRecoveryEmails.edit_cart_recovery);

router.get("/:store_id/cart-recovery/:cart_recovery_uuid/preview", AuthorizeMiddleware.wed_authorize, AuthorizeMiddleware.checksubscription, CartRecoveryEmails.preview_cart_recovery);

router.delete("/delete-cart-recovery", upload.none(), AuthorizeMiddleware.wed_authorize, CartRecoveryEmails.delete_cart_recovery);
router.delete("/cart-recovery/delete", upload.none(), AuthorizeMiddleware.wed_authorize, CartRecoveryEmails.delete_cart_recovery);

/*** Test Routers ***/
router.get("/test", TestController.test);
router.get("/test/mail", TestController.test_mail);
router.get("/test/store-create", TestController.test_store_create);
router.get("/test/shopify-webhook", TestController.test_shopify_webhook);
router.get("/test/store-currency", TestController.test_store_currency);
router.get("/test/checkout-template-update", TestController.checkout_template_update);
router.get("/test/checkout-tarnslation-update", TestController.checkout_tarnslation_update);

// Dummy Page Template
router.get("/test/checkout-template/:version", TestController.test_checkout_template);
router.get("/test/checkout-thankyou/:version", TestController.test_checkout_thankyou);
router.get("/test/checkout-digital", TestController.test_checkout_digital);
router.get("/test/landing-page", TestController.test_landing_page);

// Paypal Test Routers
router.get("/test/paypal", TestController.test_paypal);
router.get("/test/paypal/callback", TestController.test_paypal_callback);

// Stripe Test Routers
router.get("/test/stripe/price", TestController.stripe_price);
router.get("/test/stripe/customer", TestController.stripe_customer);
router.get("/test/stripe/subscription", TestController.stripe_subscription);
router.get("/test/stripe/subscription/update", TestController.stripe_subscription_update);
router.get("/test/stripe/subscription/get", TestController.stripe_subscription_get);
router.get("/test/stripe/upcoming/invoice/items", TestController.stripe_upcoming_invoice_items);

router.get("/test/update-store-count", TestController.test_update_store_count);

/******************************************************
*** Third Party Webhooks Router ***
******************************************************/
router.post("/stripe-webhook", upload.none(), StripeWebhook.StripeWebhook);
router.post("/:store_id/shopify-webhook", upload.none(), ShopifyWebhook.shopify_webhook);
router.post("/checkout-webhook", upload.none(), CheckoutWebhook.checkout_webhook);
router.post("/payout-master-webhook", upload.none(), PayoutMasterWebhook.payout_master_webhook);


/******************************************************
*** Backend Admin Router ***
******************************************************/
router.get("/get-products", upload.none(), AdminSubscriptionController.get_product);
router.post("/create-product", upload.none(), AdminSubscriptionController.create_product);
router.get("/get-subscription-packages", upload.none(), AdminSubscriptionController.get_subscription_packages);
router.post("/create-subscription-package", upload.none(), AdminSubscriptionController.create_subscription_packages);
router.post("/create-subscription-addon", upload.none(), AdminSubscriptionController.create_subscription_addon);

router.post("/create-subscription", upload.none(), AdminSubscriptionController.create_subscription);


/******************************************************
*** Shopify Frontend Router ***
******************************************************/
router.get("/Products", ShopifyStoreController.Test);
router.post("/pay", upload.none(), ShopifyStoreController.PaymentGateways);
router.post("/stripe-payment-intent", upload.none(), ShopifyStoreController.payment_intent);

// Shopify Cart CRUD Router
router.post("/c/:store_id/:checkout_id", upload.none(), CheckoutController.update_cart);
router.post("/create-checkout/:store_id", CheckoutController.create_checkout);
router.get("/get-checkout/:checkout_id/:store_id", CheckoutController.get_checkout);
router.put("/put-checkout/:checkout_id/:store_id", CheckoutController.update_checkout);

router.post("/abandoned_checkout", CheckoutController.abandoned_checkout);

// Shopify Checkout Router
router.get("/:store_id/checkout/:checkout_id", CheckoutController.shopify_checkout);
router.get("/:store_id/checkout-thankyou/:order_id", CheckoutController.shopify_thankyou);
router.get("/:store_id/get-checkout-domain-url", CheckoutController.get_checkout_domain_url);
router.get("/:store_id/get-store-subscription", CheckoutController.get_store_subscription);

router.get("/:store_id/cart-recovery-checkout/:checkout_id/:cart_performance_uuid", CartRecoveryEmails.cartPerformance);
router.post("/cart-recovery/filter", CartRecoveryEmails.filter_cart_performance);

// Shopify Check Discount
router.post("/check-discount-code", CheckoutController.check_discount_code);
router.post("/check-automatic-discount", CheckoutController.check_automatic_discount);

// Upsll Router
router.get("/:store_id/c/:checkout_id/o/:order_id/upsells/:upsell_id", CheckoutController.shopify_upsell);
router.post("/purchase-upsells", upload.none(), CheckoutController.shopify_purchase_upsell);

// BuyLink Router
router.get("/:store_id/buylink-checkout/:buylink_products", upload.none(), CheckoutController.shopify_buylink_checkout);

/////////////////////// Payment Gateway Roiter
// Apple Pay Router
router.post("/applepay-validateSession", upload.none(), ShopifyStoreController.applepay_validateSession);




module.exports = router;