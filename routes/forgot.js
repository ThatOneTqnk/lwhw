const express = require("express");
const app = module.exports = express.Router();
var validator = require('validator');
var cookieParser = require('cookie-parser');
var mongoose = require('mongoose');
var User = require('../models/user.js');
var bcryptUtil = require('../util/bcrypt.js');

app.use((req, res, next) => {
    if (req.body.state) {
        res.redirect('/dashboard');
    } else {
        next();
    }
});


app.get('/', (req, res) => {
    bcryptUtil.renderData(res, "pages/forgot", {}, {state: req.body.state, username: req.body.plainuser});
});

app.post('/', (req, res) => {
    if(req.body.email) {
        if(!validator.isEmail(req.body.email)) {
            res.send({error: 1})
            return;
        }
        req.body.email = req.body.email.toLowerCase();
        User.findOne({email: req.body.email}, async(err, resp) => {
            if(resp) {
                let code;
                if(resp.forgot_code) {
                    code = resp.forgot_code
                } else {
                    code = bcryptUtil.verifyCode();
                }
                resp.set({forgot_code: code});
                let retained;
                try {
                    retained = await bcryptUtil.retainData(resp); 
                } catch(e) {
                    retained = e;
                }
                if(retained.error) {
                    res.send({error: -1});
                    return;
                } else {
                    bcryptUtil.sendForgotCode(resp.email, code);
                    res.send({good: true});
                    return;
                }
            }
            if(err || !resp || (!err && !resp)) {
                res.send({good: true}); // Do not inform user if email is in database
                return;
            }
        });
    } else {
        res.send({error: 101});
        return;
    }
});


app.post('/recover', (req, res) => {
    if(req.body.code && req.body.pass && req.body.cpass && req.body.email) {
        if(req.body.code.length > 5) {
            res.send({error: 1});
            return;
        }
        if(!validator.isEmail(req.body.email)) {
            res.send({error: 3})
            return;
        }
        if(req.body.pass != req.body.cpass) {
            res.send({error: 2});
            return;
        }
        User.findOne({forgot_code: req.body.code, email: req.body.email}, async(err, resp) => {
            if(resp) {
                resp.set({password: bcryptUtil.hash(req.body.pass)});
                resp.forgot_code = undefined;
                let retained;
                try {
                    retained = await bcryptUtil.retainData(resp); 
                } catch(e) {
                    retained = e;
                }
                if(retained.error) {
                    res.send({error: -1});
                    return;
                } else {
                    res.send({good: true});
                    return;
                }
            }
            if(err || !resp || (!err && !resp)) {
                res.send({error: 1});
                return;
            }
        });

    } else {
        res.send({error: 101});
        return;
    }
})


// app.use(function (req, res, next) {
//     res.status(404).send("Sorry can't find that!")
// })