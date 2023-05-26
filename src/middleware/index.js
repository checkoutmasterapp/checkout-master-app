"use strict";

module.exports.RestricDomainMiddleware = async (req, res, next) => {

    console.log("#######################################################");

    let original_host = req.hostname;
    let requested_host = req.header('x-forwarded-host');

    console.log("RestricDomainMiddleware original_host -----------", original_host);
    console.log("RestricDomainMiddleware requested_host -----------", requested_host);

    if (requested_host) {
        if (requested_host !== original_host) {
            return res.render("restric_domain");
        }
    }

    next();
};