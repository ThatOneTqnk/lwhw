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
        if(isAuth.state) {
            req.body.verified = isAuth.active;
            next();
        } else {
            res.redirect('/');
        }
    } else {
        res.redirect('/');
    }
});

app.get('/', async (req, res) => {
    if(!req.body.verified) {
        res.redirect('/dashboard/activate');
        return;
    }
    res.render('pages/mainDash')
});

app.get('/activate', async (req, res) => {
    if(req.body.verified) {
        res.redirect('/dashboard');
        return;
    }
    res.render('pages/activate');
});

app.use(function (req, res, next) {
    res.status(404).send("Sorry can't find that!")
})