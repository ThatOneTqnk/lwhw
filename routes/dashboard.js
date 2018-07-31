const express = require("express");
const app = module.exports = express.Router();
var cookieParser = require('cookie-parser');
var mongoose = require('mongoose');
var User = require('../models/user.js');
var bcryptUtil = require('../util/bcrypt.js');

app.use(async (req, res, next) => {
    if (req.cookies.auth_token) {
        let isAuth;
        try {
            isAuth = await bcryptUtil.authenticate(req.cookies.auth_token);
        } catch(e) {
            isAuth = e;
        }
        if(isAuth) {
            next();
        } else {
            res.redirect('/');
        }
    } else {
        res.redirect('/');
    }
});

app.get('/', async (req, res) => {
    let verified;
    try {
        verified = await bcryptUtil.isVerified(req.cookies.auth_token);
    } catch(e) {
        verified = e;
    }
    if(!verified) {
        res.redirect('/dashboard/activate');
        return;
    }
    res.send('Will add shtuff here soon :). For now you are logged in.')
});

app.get('/activate', async (req, res) => {
    let verified;
    try {
        verified = await bcryptUtil.isVerified(req.cookies.auth_token);
    } catch(e) {
        verified = e;
    }
    if(verified) {
        res.redirect('/dashboard');
        return;
    }
    res.render('pages/activate');
});

app.use(function (req, res, next) {
    res.status(404).send("Sorry can't find that!")
})