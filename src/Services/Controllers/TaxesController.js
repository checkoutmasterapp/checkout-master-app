const { Taxes, Stores } = require("../models");
const Sq = require("sequelize");

module.exports.taxes_index = async (req, res, next) => {
    const { auth_user, auth_store } = req;
    const { store_id } = req.params;

    let tax_rate = await Taxes.findAll({
        where: {
            store_id: store_id,
            user_id: auth_user.id,
        },
    });

    res.render("backend/Taxes/taxes", {
        store_id: store_id,
        auth_user: auth_user,
        auth_user: auth_user,
        auth_store: auth_store,
        active_menu: "taxes",

        tax_rate: tax_rate,
    });
};


module.exports.taxes_index_table = async (req, res, next) => {
    const { auth_user, auth_store } = req;
    const { store_id } = req.body;

    try {
        let tax_rates = await Taxes.findAndCountAll({
            where: {
                store_id: store_id,
            },
        })

        let client_data = [];
        if (tax_rates.rows) {
            for (let tax_rate of tax_rates.rows) {

                let countries = ''
                let othercountries = ''
                // tax_rate?.country_codes.forEach((country_code, index) => {
                //     if (index == 2) {
                //         othercountries = `${tax_rate?.country_codes.length - 2} others`
                //     }
                //     if (index <= 2)
                //         countries = `<div class="text-truncate mr-3"><span class="flags-icons fi fi-${country_code.toLowerCase()}"></span>
                //             + ${othercountries}
                //             </div>`
                // });

                console.log()
                client_data.push({
                    tax_rate_name: tax_rate?.tax_rate_name,
                    tax_rate_percentage: tax_rate?.tax_rate_percentage,
                    country_codes: countries,
                    action: `
                        <div class="d-flex">
                            <a
                                href="${process.env.APP_URL}/${store_id}/taxes/edit-tax-rate/${tax_rate?.id}"
                                class="btn"
                            >
                                <i class="bi bi-pencil-square"></i>
                            </a>
                            <a
                                    // href="javascript:void(0);"
                                    class="btn delete_tax_rate_data"
                                    id="${tax_rate?.id}"
                                    store_id="${store_id}"
                            >
                                <i class="bi bi-trash"></i>
                            </a>
                        </div>
                    `
                })
            }
        }

        return res.json({
            data: client_data,
            draw: req.body["draw"],
            recordsTotal: tax_rates.count,
            recordsFiltered: tax_rates.count,
        });

    } catch (error) {
        console.error("cart_recovery error-----------", error);
        return res.json({
            status: false,
            message: error?.message ? error.message : "Something went wrong. Please try again.",
        });
    }


};

module.exports.add_taxes = async (req, res, next) => {
    const { auth_user, auth_store } = req;
    const { store_id } = req.params;

    if (req.method === "POST") {
        try {
            let request_body = req.body;
            console.log("add_taxes request_body------", request_body);

            if (!request_body.tax_rate_name) {
                return res.json({
                    status: false,
                    message: "Missing Tax Name",
                });
            }
            if (
                await Taxes.findOne({
                    where: {
                        tax_rate_name: request_body.tax_rate_name,
                    },
                })
            ) {
                return res.send({
                    status: false,
                    message: "Tax Rate already Exist",
                });
            }

            const allTaxes = await Taxes.findAll({
                where: {
                    store_id: request_body.store_id,
                },
            })

            request_body.tax_preference_not_included = true;
            request_body.tax_preference_included = false;
            request_body.tax_preference_shipping_rate_charge = false

            let saveProcess = true
            if (allTaxes.length) {
                request_body.tax_preference_not_included = allTaxes[0].tax_preference_not_included;
                request_body.tax_preference_included = allTaxes[0].tax_preference_included;
                request_body.tax_preference_shipping_rate_charge = allTaxes[0].tax_preference_shipping_rate_charge;

                // allTaxes.forEach(tax => {
                //     if (!saveProcess) {
                //         return
                //     }
                //     const diff = tax.country_codes.filter(element => request_body?.country_codes.includes(element));

                //     if (diff.length) {
                //         saveProcess = false
                //     }
                // });
            }

            if (!saveProcess) {
                return res.send({
                    status: false,
                    message: "Duplicated countries include",
                });
            }



            request_body.user_id = auth_user?.id;
            request_body.tax_rate_percentage = request_body?.tax_rate_percentage || 0;

            await Taxes.create(request_body);

            // Update Store Table with Payment Method True
            await Stores.update(
                { taxes: true },
                {
                    where: {
                        id: request_body?.store_id,
                    },
                }
            );

            return res.json({
                status: true,
                message: "Tax added successfully",
                redirect_url: `${process.env.APP_URL}/${request_body?.store_id}/taxes`,
            });
        } catch (error) {
            console.log("add_taxes error------------", error);
            return res.json({
                status: false,
                message: "Something went wrong!Please try again.",
            });
        }
    }

    res.render("backend/Taxes/add_taxes", {
        store_id: store_id,
        auth_user: auth_user,
        auth_user: auth_user,
        auth_store: auth_store,
        active_menu: "taxes",
    });
};

module.exports.edit_tax_rate = async (req, res, next) => {
    const { store_id } = req.params;
    const { id } = req.params;
    const auth_user = req.auth_user;
    const auth_store = req.auth_store;

    if (req.method === "POST") {
        try {
            let request_body = req.body;

            if (!request_body.tax_rate_name) {
                return res.json({
                    status: false,
                    message: "Missing Tax Name",
                });
            }

            if (
                await Taxes.findOne({
                    where: {
                        tax_rate_name: request_body.tax_rate_name,
                        id: { [Sq.Op.ne]: request_body?.id }
                    },
                })
            ) {
                return res.send({
                    status: false,
                    message: "Tax Rate already Exist",
                });
            }

            const allTaxes = await Taxes.findAll({
                where: {
                    store_id: request_body.store_id,
                    id: { [Sq.Op.ne]: request_body?.id }
                },
            })

            let saveProcess = true
            if (allTaxes.length) {
                allTaxes.forEach(tax => {
                    if (!saveProcess) {
                        return
                    }
                    const duplicateCountry = tax.country_codes.filter(element => request_body?.country_codes.includes(element));
                    if (duplicateCountry.length) {
                        saveProcess = false
                    }
                });
            }

            if (!saveProcess) {
                return res.send({
                    status: false,
                    message: "Duplicated countries include",
                });
            }

            request_body.tax_rate_percentage = request_body?.tax_rate_percentage || 0;

            await Taxes.update(request_body, {
                where: { id: request_body?.id },
            });

            return res.json({
                status: true,
                message: "Tax updated successfully",
                redirect_url: `${process.env.APP_URL}/${request_body?.store_id}/taxes`,
            });
        } catch (error) {
            console.log("edit_tax_rate error------------", error);
            return res.json({
                status: false,
                message: "Something went wrong!Please try again.",
            });
        }
    }

    let tax_rate = await Taxes.findOne({
        where: {
            id: id,
        },
    }).then((response) => {
        return response;
    });

    res.render("backend/Taxes/edit_taxes", {
        store_id: store_id,
        auth_user: auth_user,
        auth_user: auth_user,
        auth_store: auth_store,
        active_menu: "taxes",

        tax_rate: tax_rate,
    });
};

module.exports.delete_tax = async (req, res, next) => {
    if (req.method === "DELETE") {
        let request_body = req.body;

        try {
            await Taxes.destroy({
                where: {
                    id: request_body?.tax_rate_id,
                },
            });

            return res.json({
                status: true,
                message: "Tax deleted successfully",
                redirect_url: `${process.env.APP_URL}/${request_body?.store_id}/taxes`,
            });
        } catch (error) {
            console.log("delete_tax error------------", error);
            return res.json({
                status: false,
                message: "Something went wrong!Please try again.",
            });
        }
    }
};

module.exports.tax_preference = async (req, res, next) => {
    const { store_id } = req.params;
    const auth_user = req.auth_user;
    const auth_store = req.auth_store;
    const { tax_preference_shipping_rate_charge } = req.body;

    if (req.method === "POST") {
        try {
            let request_body = req.body;
            if (request_body.tax_preference_not_included == "on") {
                request_body.tax_preference_included = false;
            }
            if (request_body.tax_preference_included == "on") {
                request_body.tax_preference_not_included = false;
            }

            request_body.tax_preference_shipping_rate_charge = tax_preference_shipping_rate_charge === "on" ? true : false

            let ids = [];
            let tax_rate = await Taxes.findAll({
                where: {
                    store_id: request_body?.store_id,
                },
            });

            if (tax_rate != null) {
                if (tax_rate.length > 0) {
                    tax_rate.forEach(async (element) => {
                        ids.push(element.id);
                    });
                    if (ids.length > 0) {
                        await Taxes.update(request_body, {
                            where: {
                                id: ids,
                            },
                        });
                        return res.json({
                            status: true,
                            message: "Tax preference saved ",
                            redirect_url: `${process.env.APP_URL}/${request_body?.store_id}/taxes`,
                        });
                    }
                }
            }
        } catch (error) {
            console.log("tax_preference error------------", error);
            return res.json({
                status: false,
                message: "Something went wrong!Please try again.",
            });
        }
    }
};