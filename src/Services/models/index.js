"use strict";

const Users = require("./Users");
const Stores = require("./Stores");
const UserSubscriptions = require("./UserSubscriptions");
const UserSubscriptionBillingDetails = require("./UserSubscriptionBillingDetails");
const UserSubscriptionBillings = require("./UserSubscriptionBillings");
const UserSubscriptionCardDetails = require("./UserSubscriptionCardDetails");

const CheckoutTemplates = require("./CheckoutTemplates");
const CustomizeCheckout = require("./CustomizeCheckout");
const CustomizeAboutSections = require("./CustomizeAboutSections");
const ShippingRates = require("./ShippingRates");
const PaymentMethods = require("./PaymentMethods");

const SubscriptionProducts = require("./SubscriptionProducts");
const SubscriptionPackage = require("./SubscriptionPackage");


const StripeWebhookLogs = require("./StripeWebhookLogs");

const BuyLinks = require("./BuyLinks");
const Translations = require("./Translations");
const AutomaticDiscounts = require("./AutomaticDiscounts");
const Taxes = require("./Taxes");
const CartRecoveryEmails = require("./CartRecoveryEmails");

const Customers = require("./Customers");
const Orders = require("./Orders");
const Checkouts = require("./Checkouts");
const Cart = require("./Cart");
const CartPerformance = require("./CartPerformance");

const AbandonedCheckouts = require("./AbandonedCheckouts");

const Countries = require("./Countries");
const States = require("./States");

const TempCheckout = require("./TempCheckout");
const TempSubscription = require("./TempSubscription");

const Upsell = require("./Upsell");
const UpsellTrigger = require("./UpsellTrigger");
const UpsellTriggerOffer = require("./UpsellTriggerOffer");
const UpsellPerformance = require("./UpsellPerformance");

const CustomDomain = require("./CustomDomain");
const CustomDomainSSL = require("./CustomDomainSSL");

const RecoveryEmails = require("./RecoveryEmails");

module.exports = {
    Users,
    UserSubscriptions,
    UserSubscriptionBillingDetails,
    UserSubscriptionBillings,
    UserSubscriptionCardDetails,
    AbandonedCheckouts,

    Stores,
    CheckoutTemplates,
    CustomizeCheckout,
    CustomizeAboutSections,

    ShippingRates,
    PaymentMethods,

    BuyLinks,
    Translations,
    AutomaticDiscounts,
    Taxes,
    CartRecoveryEmails,

    SubscriptionProducts,
    SubscriptionPackage,
    StripeWebhookLogs,

    Customers,
    Orders,
    Checkouts,
    Cart,
    CartPerformance,

    Countries,
    States,

    TempCheckout,
    TempSubscription,

    Upsell,
    UpsellTrigger,
    UpsellTriggerOffer,
    UpsellPerformance,

    CustomDomain,
    CustomDomainSSL,


    RecoveryEmails,
};