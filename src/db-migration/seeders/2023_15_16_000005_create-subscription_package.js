"use strict";

module.exports = {
	async up(queryInterface, Sequelize) {

		let subscription_packages = [
			{
				stript_object_id: "price_1N7ZGeAchshsyWxPvaNmVJ2e",
				stript_object_type: "price",
				stripe_metered_price_id: "price_1N7ZGfAchshsyWxPPweESxzs",
				package_name: "Light plan",
				package_description: "$9.99/week + 1.5% transaction fee",
				billing_cycle: "week",
				price: 9.99,
				revenue_amount: 1.5,
				revenue_type: "percentage",
				created_at: new Date(),
				updated_at: new Date(),
			},
			{
				stript_object_id: "price_1N7ZGzAchshsyWxP2jWDzkCf",
				stript_object_type: "price",
				stripe_metered_price_id: "price_1N7ZH0AchshsyWxPuUggoKMC",
				package_name: "Scale plan",
				package_description: "$24.99/week + 1% transaction fee",
				billing_cycle: "week",
				price: 24.99,
				revenue_amount: 1,
				revenue_type: "percentage",
				created_at: new Date(),
				updated_at: new Date(),
			}
		];

		return queryInterface.bulkInsert("subscription_packages", subscription_packages);
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.bulkDelete("subscription_packages", null, {});
	},
};