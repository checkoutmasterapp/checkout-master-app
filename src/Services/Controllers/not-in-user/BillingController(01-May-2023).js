const Sq = require("sequelize");

const {
	Users, Stores, Countries,
	SubscriptionPackage, UserSubscriptions,
	UserSubscriptionBillingDetails, UserSubscriptionBillings, UserSubscriptionCardDetails,

} = require("../models");
const models = require("../models");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

function sleep(ms) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

module.exports.billing_details = async (req, res, next) => {
	const { store_id } = req.params;
	const { auth_user, auth_store } = req;

	// Post Action
	if (req.method === "POST") {
		try {
			let request_body = req.body;
			let store_id = request_body.store_id;
			let selected_card = request_body.card_id;
			if (request_body && request_body.card_number) {
				request_body.card_number = request_body.card_number.replace(/\s+/g, "");
			}

			// Get Subsccription Package Details
			let package_detail = await SubscriptionPackage.findOne({
				where: {
					id: request_body.subscription_package_id,
				},
			});

			// Get Current Store Subscription Billing
			let user_subscription_billings = await UserSubscriptionBillings.findOne({
				where: {
					user_id: auth_user?.id,
					store_id: store_id,
				},
				order: [["id", "DESC"]],
			});

			//////////////////////////////////// Create Stripe Customer Card ////////////////////////////////////
			let payment_method;
			let stripe_card_id, stripe_card_last4, exp_month, exp_year, stripe_card_brand;
			if (request_body.card_number && request_body.expiry_date && request_body.card_cvv) {
				let expiry_date = request_body?.expiry_date.split("/");

				// Create a PaymentMethod
				payment_method = await stripe.paymentMethods.create({
					type: "card",
					card: {
						number: request_body.card_number,
						exp_month: expiry_date[0],
						exp_year: expiry_date[1],
						cvc: request_body.card_cvv,
					},
				});

				stripe_card_last4 = payment_method?.card?.last4;
				exp_month = payment_method?.card?.exp_month;
				exp_year = payment_method?.card?.exp_year;
				stripe_card_brand = payment_method?.card?.brand;
			}

			//////////////////////////////////// Create Stripe Customer If not Exist ////////////////////////////////////
			let stripe_customer_id;
			if (auth_user?.stripe_customer_id) {
				stripe_customer_id = auth_user?.stripe_customer_id;

				// Attach a PaymentMethod to a Customer
				await stripe.paymentMethods.attach(
					payment_method?.id,
					{
						customer: stripe_customer_id
					}
				);
			} else {
				let stripe_customers = {
					email: auth_user.email,
					name: `${auth_user.first_name} ${auth_user.last_name}`,
					payment_method: payment_method.id,
					shipping: {
						address: {
							line1: request_body?.billing_address,
							city: request_body?.billing_city,
							// state: 'CA',
							postal_code: request_body?.billing_zip,
							country: request_body?.billing_country_code, // IN, US
						},
						name: `${auth_user.first_name} ${auth_user.last_name}`,
					},
					address: {
						line1: request_body?.billing_address,
						city: request_body?.billing_city,
						// state: 'CA',
						postal_code: request_body?.billing_zip,
						country: request_body?.billing_country_code, // IN, US
					},
				};
				await stripe.customers.create(stripe_customers).then(async function (customer) {
					stripe_customer_id = customer.id;
				});

				await Users.update({ stripe_customer_id: stripe_customer_id, }, {
					where: {
						email: auth_user.email,
					},
				});
			}

			// Make update card as Default card
			await stripe.customers.update(stripe_customer_id, {
				invoice_settings: {
					default_payment_method: payment_method?.id,
				},
			});

			let redirect_url;
			if (user_subscription_billings) {

				let stripe_subscription_id = user_subscription_billings?.stripe_subscription_id;

				const subscription_retrieve = await stripe.subscriptions.retrieve(stripe_subscription_id);

				let subscription_update = await stripe.subscriptions.update(stripe_subscription_id, {
					cancel_at_period_end: false,
					default_payment_method: payment_method?.id,
					items: [
						{
							id: subscription_retrieve.items.data[0].id,
							price: package_detail.stript_object_id
						}
					]
				});
				if (subscription_update?.status === "active") {
					redirect_url = `${process.env.APP_URL}/${store_id}/dashboard`;
				} else {
					// Stripe Invoice Paid 
					const pay_invoice = await stripe.invoices.retrieve(subscription_update.latest_invoice);
					redirect_url = pay_invoice?.hosted_invoice_url;
				}
			} else {

				//////////////////////////////////// Stripe Create Subscription ////////////////////////////////////
				let stripe_subscription = await stripe.subscriptions.create({
					customer: stripe_customer_id,
					items: [
						{
							price: package_detail.stript_object_id
						}
					],
				});

				// Add Temp records in the database
				await models.TempSubscription.create({
					user_id: auth_user?.id,
					store_id: store_id,
					request_body: request_body,
					package_detail: package_detail,
					subscription_id: stripe_subscription?.id,
				});

				if (stripe_subscription?.status === "active") {
					redirect_url = `${process.env.APP_URL}/${store_id}/dashboard`;
				} else {
					// Stripe Invoice Paid 
					const pay_invoice = await stripe.invoices.retrieve(stripe_subscription.latest_invoice);
					console.log("billing_details pay_invoice -----------------", pay_invoice);
					redirect_url = pay_invoice?.hosted_invoice_url;
				}
			}

			return res.json({
				status: true,
				message: "Subscription created successfully",
				redirect_url: redirect_url,
			});
		} catch (error) {
			console.error("billing_details error -----------------", error);
			return res.json({
				status: false,
				error: error?.message,
				message: "Something went wrong. Please try again.",
			});
		}
	}

	// Get Current Store Subscription
	let user_subscription = await UserSubscriptions.findOne({
		where: {
			store_id: store_id,
			user_id: auth_user?.id,
		}
	});

	let subscription_packages = await SubscriptionPackage.findAll({
		where: {
			is_freetrail: false
		},
		order: [["id", "ASC"]],
	});

	let user_subscription_cards;

	let billing_details = await UserSubscriptionBillingDetails.findOne({
		where: {
			user_id: auth_user?.id,
			store_id: store_id,
		},
		order: [["id", "DESC"]],
	});

	let user_billings_invoices = await UserSubscriptionBillings.findAll({
		where: {
			user_id: auth_user?.id,
			store_id: store_id,
		}
	});

	let countries = await Countries.findAll();
	countries = countries.sort(function (a, b) {
		return a.country_name < b.country_name ? -1 : a.country_name > b.country_name ? 1 : 0;
	});

	res.render("backend/Billing/billing_details", {
		store_id: store_id,
		auth_user: auth_user,
		auth_store: auth_store,
		active_menu: "billing-details",

		countries: countries,
		billing_details: billing_details,

		subscription_packages: subscription_packages,

		user_billings_invoices: user_billings_invoices,
		user_subscription_cards: user_subscription_cards,
	});
};