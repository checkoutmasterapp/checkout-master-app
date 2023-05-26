const moment = require("moment");

const { Stores, CartPerformance, CartRecoveryEmails, Translations, CustomizeCheckout, Cart, Checkouts } = require("../models");

module.exports.cart_recovery = async (req, res, next) => {
    const { store_id } = req.params;
    const { auth_user, auth_store } = req;

    if (req.method === "POST") {
        try {
            let request_body = req.body;

            let recovery_emails = await CartRecoveryEmails.findAndCountAll({
                order: [["id", "DESC"]],
                where: {
                    store_id: request_body?.store_id,
                },
            });

            let client_data = [];
            if (recovery_emails.rows) {
                for (let recovery_email of recovery_emails.rows) {
                    let email_schedule_time = '';
                    switch (recovery_email?.cart_recovery_schedule_time) {
                        case '10_mins':
                            sentTime = 10
                            email_schedule_time = 'Ten minutes after checkout'
                            break;
                        case 'one_hour':
                            email_schedule_time = 'One hour after checkout'
                            break;
                        case 'three_hours':
                            email_schedule_time = 'Three hours after checkout'
                            break;
                        case 'five_hours':
                            email_schedule_time = 'Five hours after checkout'
                            break;
                        case 'eight_hours':
                            email_schedule_time = 'Eight hours after checkout'
                            break;
                        case 'tweleve_hours':
                            email_schedule_time = 'Twelve hours after checkout'
                            break;
                        case 'one_day':
                            email_schedule_time = 'One day after checkout'
                            break;
                        case 'two_days':
                            email_schedule_time = 'Two days after checkout'
                            break;
                        case 'three_days':
                            email_schedule_time = 'Three days after checkout'
                            break;
                        case 'five_days':
                            email_schedule_time = 'Five days after checkout'
                        default:
                            break;
                    }
                    client_data.push({
                        email_title: recovery_email?.cart_recovery_email_title ? recovery_email.cart_recovery_email_title : `<span class="float-center">-</span>`,
                        schedule_time: email_schedule_time,
                        created_at: moment(recovery_email?.created_at).format("DD MMM YYYY"),
                        action: `
                            <div class="d-flex">
                                <a
                                    class="btn"
                                    href="${process.env.APP_URL}/${request_body?.store_id}/cart-recovery/${recovery_email.cart_recovery_uuid}/preview"
                                >
                                    <i class="bi bi-eye-fill"></i>
                                </a>
                                <a
                                        href="javascript:void(0);"
                                        class="btn delete_recovery_email"
                                        cart_recovery_id="${recovery_email?.id}"
                                        cart_recovery_uuid="${recovery_email?.recovery_email_uuid}"
                                >
                                    <i class="bi bi-trash"></i>
                                </a>
                                <a
                                    href="${process.env.APP_URL}/${request_body?.store_id}/cart-recovery/${recovery_email.cart_recovery_uuid}/edit"
                                    class="btn"
                                >
                                    <i class="bi bi-pencil-square"></i>
                                </a>
                            </div>
                        `
                    })
                }
            }

            return res.json({
                data: client_data,
                draw: request_body["draw"],
                recordsTotal: recovery_emails.count,
                recordsFiltered: recovery_emails.count,
            });
        } catch (error) {
            console.error("cart_recovery error-----------", error);
            return res.json({
                status: false,
                message: error?.message ? error.message : "Something went wrong. Please try again.",
            });
        }
    }

    let recovery_emails = await CartRecoveryEmails.findAll({
        where: {
            store_id: store_id,
            user_id: auth_user?.id,
        },
    });

    res.render("backend/CartRecoveryEmails/cart_recovery", {
        store_id: store_id,
        auth_user: auth_user,
        auth_store: auth_store,
        active_menu: "cart-recovery",

        recovery_emails: recovery_emails
    });
};

module.exports.add_cart_recovery = async (req, res, next) => {
    const { store_id } = req.params;
    const { auth_user, auth_store } = req;

    if (req.method === "POST") {
        try {
            let request_body = req.body;
            request_body.user_id = auth_user?.id;

            if (!request_body.cart_recovery_schedule_time) {
                return res.json({
                    status: false,
                    message: "Please add the schedule time",
                });
            }

            let cart_recovery = await CartRecoveryEmails.findOne({
                where: {
                    store_id: request_body?.store_id,
                    cart_recovery_schedule_time: request_body?.cart_recovery_schedule_time
                },
            });

            if (cart_recovery) {
                return res.json({
                    status: false,
                    message: `Already created with this time schedule`,
                });
            }

            await CartRecoveryEmails.create(request_body);

            return res.json({
                status: true,
                message: "Cart Recovery Email Created",
                redirect_url: `${process.env.APP_URL}/${request_body?.store_id}/cart-recovery`,
            });
        } catch (error) {
            console.error("add_cart_recovery error-----------", error);
            return res.json({
                status: false,
                message: error?.message ? error.message : "Something went wrong. Please try again.",
            });
        }
    }

    try {
        let cart = await CartRecoveryEmails.findOne({
            where: {
                store_id: store_id,
            },
        });

        res.render("backend/CartRecoveryEmails/add_cart_recovery", {
            store_id: store_id,
            auth_user: auth_user,
            auth_store: auth_store,
            active_menu: "cart-recovery",

            cart_data: cart,
        });
    } catch (error) {
        console.error("add_cart_recovery error------------", error);
        res.render("404");
    }
};

module.exports.edit_cart_recovery = async (req, res, next) => {
    const { auth_user, auth_store } = req;
    const { store_id, cart_recovery_uuid } = req.params;

    if (req.method === "POST") {
        try {
            let request_body = req.body;

            if (!request_body.cart_recovery_schedule_time) {
                return res.json({
                    status: false,
                    message: "Please add the schedule time",
                });
            }

            let cart_recovery = await CartRecoveryEmails.findOne({
                where: {
                    store_id: request_body?.store_id,
                    cart_recovery_schedule_time: request_body?.cart_recovery_schedule_time
                },
            });

            if (cart_recovery && cart_recovery?.id !== Number(request_body?.id)) {
                return res.json({
                    status: false,
                    message: `Already created with this time schedule`,
                });
            }

            await CartRecoveryEmails.update(request_body, {
                where: {
                    id: request_body?.id,
                },
            });
            return res.json({
                status: true,
                message: "Cart Recovery Email Updated",
                redirect_url: `${process.env.APP_URL}/${request_body?.store_id}/cart-recovery`,
            });
        } catch (error) {
            console.error("edit_cart_recovery error-----------", error);
            return res.json({
                status: false,
                message: error?.message ? error.message : "Something went wrong. Please try again.",
            });
        }
    }

    try {
        let cart_recovery = await CartRecoveryEmails.findOne({
            where: {
                store_id: store_id,
                cart_recovery_uuid: cart_recovery_uuid
            },
        });
        let cart_performance = await CartPerformance.findAll({
            where: {
                store_id: store_id,
                cart_recovery_id: cart_recovery?.id
            },
        });

        let sent_time = 0;
        let time_clicked = 0;
        let purchased_amount = 0.00;
        let purchased_time = 0;

        if (cart_performance && cart_performance.length) {
            cart_performance.forEach(async (cartPerformance) => {
                let purchaseAmount = parseFloat(cartPerformance?.purchased_amount || 0.00)
                sent_time += cartPerformance?.sent_time;
                time_clicked += cartPerformance?.time_clicked;
                purchased_amount += purchaseAmount;
                purchased_time += cartPerformance?.purchased_time;
            })
        }


        res.render("backend/CartRecoveryEmails/edit_cart_recovery", {
            store_id: store_id,
            auth_user: auth_user,
            auth_store: auth_store,
            active_menu: "cart-recovery",

            cart_recovery: cart_recovery,
            sent_time,
            time_clicked,
            purchased_amount,
            purchased_time,
        });

    } catch (error) {
        console.error("edit_cart_recovery error------------", error);
        res.render("404");
    }
};

module.exports.delete_cart_recovery = async (req, res, next) => {
    if (req.method === "DELETE") {
        let request_body = req.body;

        try {

            // await CartPerformance.destroy({
            //     where: {
            //         cart_recovery_id: request_body?.cart_recovery_id,
            //     },
            // });

            await CartRecoveryEmails.destroy({
                where: {
                    id: request_body?.cart_recovery_id,
                },
            });
            return res.json({
                status: true,
                message: "Cart Recovery email deleted successfully",
                redirect_url: `${process.env.APP_URL}/${request_body?.store_id}/cart-recovery`,
            });
        } catch (error) {
            console.error("delete_cart_recovery error------------", error);
            return res.json({
                status: false,
                message: "Something went wrong!Please try again.",
            });
        }
    }
};

module.exports.preview_cart_recovery = async (req, res, next) => {
    const { auth_user, auth_store } = req;
    const { store_id, cart_recovery_uuid } = req.params;

    let cart_recovery = await CartRecoveryEmails.findOne({
        where: {
            store_id: store_id,
            cart_recovery_uuid: cart_recovery_uuid
        },
    });

    let translation_data = await Translations.findOne({
        where: {
            store_id: store_id
        },
    });

    // Get Store Customize Checkout
    let customize_checkout = await CustomizeCheckout.findOne({
        where: {
            store_id: store_id,
            user_id: auth_user?.id,
        },

    });


    res.render("backend/CartRecoveryEmails/preview_cart_recovery", {
        store_id: store_id,
        auth_user: auth_user,
        auth_store: auth_store,
        active_menu: "cart-recovery",

        cart_recovery: cart_recovery,
        translation_data: translation_data,
        customize_checkout: customize_checkout
    });
};

module.exports.filter_cart_performance = async (req, res, next) => {
    const Sq = require("sequelize");
    try {
        let { store_id, cart_recovery_id, startDate, endDate } = req.body;

        startDate = new Date(startDate)
        endDate = new Date(endDate)
        endDate.setDate(endDate.getDate() + 1);

        let cart_recovery = await CartRecoveryEmails.findOne({
            where: {
                store_id: store_id,
                id: cart_recovery_id
            },
        });
        let cart_performance = await CartPerformance.findAll({
            where: {
                store_id: store_id,
                cart_recovery_id: cart_recovery_id,
                created_at: {
                    [Sq.Op.between]: [startDate, endDate]
                },
            },
        });

        let sent_time = 0;
        let time_clicked = 0;
        let purchased_amount = 0.00;
        let purchased_time = 0;

        if (cart_performance && cart_performance.length) {
            cart_performance.forEach(async (cartPerformance) => {
                let purchaseAmount = parseFloat(cartPerformance?.purchased_amount || 0.00)
                sent_time += cartPerformance?.sent_time;
                time_clicked += cartPerformance?.time_clicked;
                purchased_amount += purchaseAmount;
                purchased_time += cartPerformance?.purchased_time;
                console.log("purchased_time", purchased_time, purchased_amount)
            })
        }


        res.send({
            store_id: store_id,
            cart_recovery: cart_recovery,
            sent_time,
            time_clicked,
            purchased_amount,
            purchased_time,
        });

    } catch (error) {
        console.log(error)
    }
};

module.exports.cartPerformance = async (req, res, next) => {
    const { store_id, checkout_id, cart_performance_uuid } = req.params;
    console.log("cartPerformance", store_id, checkout_id, cart_performance_uuid)

    try {
        let checkouts = await Checkouts.findOne({
            where: {
                shop_id: store_id,
                checkout_uuid: checkout_id
            },
        });

        let cart_performance = await CartPerformance.findOne({
            where: {
                store_id: store_id,
                checkout_id: checkouts?.id,
                cart_performance_uuid
            },
        })
        if (!cart_performance) {
            return;
        }

        cart_performance.time_clicked = 1,
            cart_performance.save();
        req.session.cart_performance_uuid = {
            [`${checkout_id}cart_performance`]: cart_performance_uuid,
        };
        req.session.save();
        console.log("req.session", req.session)
        res.redirect(`${process.env.APP_URL}/${store_id}/checkout/${checkout_id}`);
    } catch (error) {
        console.log(error)
    }
};
