const express = require("express");
const cors = require("cors");

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");

const bcrypt = require("bcrypt");
const saltRounds = 10;
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(
    cors({
        origin: ["https://nested-todo-nikbk.vercel.app"],
        methods: ["GET", "POST"],
        credentials: true,
    })
);
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
    session({
        key: "userId",
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            expires: 60 * 60 * 24,
        },
    })
);

const userData = [];

app.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    console.log({ username, password });

    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
            console.log(err);
        }
        userData.push({ username, password: hash });
    });
    res.send(userData);
});

app.get("/login", (req, res) => {
    if (req.session.user) {
        res.send({ loggedIn: true, user: req.session.user });
    } else {
        res.send({ loggedIn: false });
    }
});

app.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const curUser = userData.find((obj) => obj.username === username);
    if (!curUser) {
        res.send({ message: "User doesn't exist" });
    }
    else {
        bcrypt.compare(password, curUser.password, (error, response) => {
            if (response) {
                req.session.user = curUser;
                console.log(req.session.user);
                res.send(curUser);
            } else {
                res.send({ message: "Wrong username/password combination!" });
            }
        });
    }
});

app.listen(3333, () => {
    console.log("running server");
});