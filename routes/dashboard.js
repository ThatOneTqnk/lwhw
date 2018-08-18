const express = require("express");
const app = module.exports = express.Router();
var cookieParser = require('cookie-parser');
var hardAuth = require('../auth/hardAuth.js');
var mongoose = require('mongoose');
var User = require('../models/user.js');
var bcryptUtil = require('../util/bcrypt.js');

app.use((req, res, next) => {
    if (!req.body.state) {
        res.redirect('/');
    } else {
        next();
    }
});

app.get('/', hardAuth, async (req, res) => {
    bcryptUtil.renderData(res, "pages/mainDash", {}, {state: req.body.state, username: req.body.plainuser});
});

app.get('/activate', async (req, res) => {
    if(req.body.verified) {
        res.redirect('/dashboard');
        return;
    }
    bcryptUtil.renderData(res, "pages/activate", {}, {state: req.body.state, username: req.body.plainuser});
});

app.use("/hw", require("./hw"));
app.use("/course", require("./course"));
