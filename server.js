"use strict";

require("dotenv").config({
    path: __dirname + "/.env",
});

const https = require("https");
const fs = require("fs");
const cors = require("cors");
const path = require("path");
const cookie = require("cookie");
const express = require("express");
const jwt = require("jsonwebtoken");
var cookieParser = require("cookie-parser");

const flash = require("express-flash-messages");
const expressSession = require("express-session");

const app = express();

app.use(cors());
app.use(flash());

// Set Global
global.appRoot = __dirname;
global.server_url = process.env.APP_URL;

// cookieParser middleware
app.use(cookieParser());

// Custom Request helper
app.use(require("./src/libs/RequestHelper"));

app.use(expressSession({
    secret: "P5&A%R3s1Z3Ea!dN@n!T3R7A",
    cookie: {
        secure: false,
        maxAge: 3600000,
        expires: new Date(Date.now() + 3600000),
    },
    resave: true,
    saveUninitialized: false,
}));

app.use(function (req, res, next) {
    res.locals.session = req.session;
    next();
});

// Parsers for POST data
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: false })); // for parsing application/x-www-form-urlencoded

//set public folder path
app.use(express.static(__dirname + "/public"));
app.set(express.static(path.join(__dirname, "public/upload")));

// Check Server Cookies For Auth User
app.get("/*", (req, res, next) => {
    let server_cookie = req.cookies;
    let server_session = req?.session;

    if (!server_session?.token && server_cookie?.user) {
        let user = server_cookie?.user;
        // Create token
        const token = jwt.sign({ user_id: user.id }, process.env.JWT_SECRET_TOKEN);

        // Set User Session
        req.session.user = user;
        req.session.token = token;

        req.session.store_id = server_cookie?.store_id;
    }
    next();
});

app.use(require("./src/Services"));

// set the view engine to pug
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.set(express.static(path.join(__dirname, "public/upload")));

//The 404 Route (ALWAYS Keep this as the last route)
app.get("*", function (req, res) {
    return res.redirect("/");
    // res.render("404");
});

let http_options = {};
if (process.env.Site_Environmental === "production" || process.env.Site_Environmental === "development") {
    http_options = {
        ...http_options,
        key: fs.readFileSync("/etc/apache2/ssl/private.key", "utf8"),
        cert: fs.readFileSync("/etc/apache2/ssl/8abad7430ef5b65c.crt", "utf8"),
    };
}


/*** Get port from environment and store in Express. ***/
const http_port = process.env.http_port || "8000";
const httpServer = require("http").Server(app);
httpServer.listen(http_port, function () {
    console.log(`httpServer App started on port ${http_port}`);
});

/*** Create an HTTPS service identical to the HTTP service. ***/
const https_port = process.env.https_port || "8001";
var httpsServer = https.createServer(http_options, app);
httpsServer.listen(https_port, () => {
    console.log(`httpsServer App started on port ${https_port}`);
});

////////////////////////////////////////////// Socket Connection //////////////////////////////////////////////
let socket_server;
if (process.env.Site_Environmental === "production" || process.env.Site_Environmental === "development") {
    socket_server = httpsServer;
} else {
    socket_server = httpServer;
}

const io = require("socket.io")(socket_server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

let client_count = 0;
io.on("connection", (socket) => {
    client_count++;

    // console.log(`socket user connection id-----------${socket.id}`);

    socket.emit("socket_connected", {
        socket_id: socket.id,
        client_count: client_count,
    });
});

app.set("socketio", io);