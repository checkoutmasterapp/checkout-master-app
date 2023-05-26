const { Users } = require("../models");
const bcrypt = require("bcryptjs");

// user account settings
module.exports.AccountSettings = async (req, res, next) => {
    const { store_id } = req.params;
    const { auth_user, auth_store } = req;

    if (req.method === "POST") {
        try {
            let request_body = req.body;
            console.log("AccountSettings request_body---------", request_body);

            await Users.update(request_body, {
                where: {
                    id: auth_user?.id,
                }
            });

            let redirect_url = "";
            if (request_body.store_id) {
                redirect_url = `${process.env.APP_URL}/accountSetting/${request_body?.store_id}`
            } else {
                redirect_url = `${process.env.APP_URL}/accountSettings`;
            }

            return res.json({
                status: true,
                redirect_url: redirect_url,
                message: "Data updated Successfully",
            });
        } catch (error) {
            return res.json({
                status: false,
                message: "Something went wrong",
            });
        }
    }

    res.render("backend/accountSettings", {
        select_store: true,
        store_id: store_id,
        user: auth_user,
        auth_user: auth_user,
    });
};

// user account settings
module.exports.AccountSettingsStore = async (req, res, next) => {
    const { store_id } = req.params;
    const { auth_user, auth_store } = req;

    // store_id = Buffer.from(req.params.store_id, 'base64').toString();

    res.render("backend/accountSettings", {
        // right_sides: [],
        user: auth_user,
        auth_user: auth_user,
        store_id: store_id,
    });
};


// user change password
module.exports.ChangePassword = async (req, res, next) => {
    const { auth_user } = req;
    let userId = auth_user.id
    try {
        if (req.method === "POST") {
            let request_body = req.body;
            if (userId !== null || userId !== undefined) {
                if (!request_body.current_password || !request_body.new_password || !request_body.confirm_password) {
                    return res.json({
                        status: false,
                        message: "Missing parameters",
                    });
                }
                if (request_body.new_password !== request_body.confirm_password) {
                    return res.json({
                        status: false,
                        message: "Confirm password not matched!",
                    });
                }
                const user = await Users.scope("withPassword").findOne({
                    where: {
                        id: userId,
                    },
                });
                if (!user || !(await bcrypt.compare(request_body.current_password, user.password))) {
                    return res.json({
                        status: false,
                        message: "Password does not matched with current password",
                    });
                }
                if (request_body.new_password) {
                    user.password = await bcrypt.hash(request_body.new_password, 10);
                }

                const updateUser = await Users.update(
                    {
                        password: user.password,
                    },
                    {
                        where: {
                            id: userId,
                        },
                    }
                );
                if (updateUser) {
                    res.clearCookie("auth_user", { path: "/" });
                    res.clearCookie("auth_store", { path: "/" });
                    res.clearCookie("store_id", { path: "/" });
                    res.clearCookie("token", { path: "/" });
                    res.clearCookie("user", { path: "/" });
                    res.clearCookie("auth_token", { path: "/" });
                    req.session.destroy();
                    return res.json({
                        status: true,
                        message: "Password updated Successfully",
                        redirect_url: `${process.env.APP_URL}/`
                    });
                } else {
                    return res.json({
                        status: false,
                        message: "Unable to update the password",
                    });
                }
            } else {
                return res.json({
                    status: false,
                    message: "Session User id not found!Please login again",
                });
            }
        }
    } catch (e) {
        return res.json({
            status: false,
            message: "Something went wrong",
        });
    }
    res.render("backend/accountSettings", {
        user: auth_user?.id,
    });
};
module.exports.ChangeAvatar = async (req, res, next) => {
    const auth_user = req.auth_user;
    try {
        const filename = req.file.filename
        const updateuserAvtar = await Users.update(
            {
                avatar: filename,
            },
            {
                where: {
                    id: auth_user?.id,
                },
            }
        );

        if (updateuserAvtar) {
            return res.json({
                status: true,
                message: "Profile Avatar added Successfully",

            })
        }
    } catch (error) {
        return res.json({
            status: false,
            message: "Something went wrong.Please try again.",
        });
    }
};
module.exports.DeleteAvatar = async (req, res, next) => {
    const auth_user = req.auth_user;

    try {
        const deleteuserAvtar = await Users.update(
            {
                avatar: null,
            },
            {
                where: {
                    id: auth_user?.id,
                },
            }
        );
        if (deleteuserAvtar) {
            return res.json({
                status: true,
                message: "Profile Avatar removed Successfully",

            })
        }
    } catch (error) {
        return res.json({
            status: false,
            message: "Something went wrong.Please try again.",
        });
    }

};