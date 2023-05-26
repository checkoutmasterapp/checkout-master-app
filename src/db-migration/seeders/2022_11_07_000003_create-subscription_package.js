"use strict";

module.exports = {
	async up(queryInterface, Sequelize) {

		let subscription_packages = [
			{
				package_name: "Free Subscription",
				billing_cycle: "week",
				price: 0.00,
				is_freetrail: true,
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