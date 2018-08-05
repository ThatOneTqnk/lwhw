var config = false;
try {
    config = require('../config.json');
} catch(e) {
    console.log('Shell alternatives will be accessed.');
}
if(config) {
    exports.sensitive = {email_pass: config.email_pass, activation_code: config.activation_code, db_url: config.db_url};
} else {
    exports.sensitive = {email_pass: process.env.email_pass, activation_code: process.env.activation_code, db_url: process.env.db_url};
}

var bcrypt = require('bcrypt');
const saltRounds = 10;
const verCodeOpts = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
const User = require('../models/user.js')
const mongoose = require('mongoose');

const nodemailer = require('nodemailer');
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: "lwhwservice@gmail.com",
        pass: this.sensitive.email_pass
    }
});

exports.validatePassword = function(password, compare) {
    return bcrypt.compareSync(password, compare);
}

exports.hash = function(password) {
    return bcrypt.hashSync(password, saltRounds);
}

exports.verifyCode = function() {
    let totalStr = '';
    for(let x = 0; x < 5; x++) {
        totalStr += verCodeOpts.charAt(Math.random() * (verCodeOpts.length - 1));
    }
    return totalStr;
}

exports.isVerified = function(incToken) {
    return new Promise((resolve, reject) => {
        User.findOne({token: incToken}, (err, resp) => {
            if(resp) {
                if(resp.active) {
                    resolve(true);
                } else {
                    reject(false);
                }
            } 
            if(err || !resp || (!err && !resp)) {
                reject(false);
            }
        });
    });
}


// Also brings back email-verification status on trip
exports.authenticate = function(incToken) {
    return new Promise((resolve, reject) => {
        User.findOne({token: incToken}, (err, resp) => {
            let link = "/dashboard/activate"
            if(resp) {
                if(resp.active) link = "/dashboard/"
                resolve({
                    active_link: link,
                    state: true,
                    active: resp.active,
                    user: resp.username
                });
            }
            if(err || !resp || (!err && !resp)) {
                reject({state: false});
            }
        });
    });
}

exports.renderData = function(res, page, opts, info) {
    opts.logged = info.state;
    opts.username = info.username;
    return res.render(page, opts);
}


exports.sendCode = function(email, code) {
    transporter.sendMail({
        from: 'lwhwservice@gmail.com',
        to: `${email}`,
        subject: 'Verification Link',
        text: `Your verification code is ${code}`,
        html: `<p>Your verification code is ${code}</p>`
    }, (err, info) => {
        if(err) console.log(err);
        if(info) console.log(info);
    });
}
exports.sendForgotCode = function(email, code) {
    transporter.sendMail({
        from: 'lwhwservice@gmail.com',
        to: `${email}`,
        subject: 'Forgot Password Reset',
        text: `Forgot your password? Here is the reset code: ${code}`,
        html: `<p>Forgot your password? Here is the reset code: ${code}</p>`
    }, (err, info) => {
        if(err) console.log(err);
        if(info) console.log(info);
    });
}

exports.retainData = function(userDoc) {
    return new Promise((resolve, reject) => {
        userDoc.save(function (err, updated) {
            if (err) reject({error: 1});
            resolve({good: true});
        });
    });
}

// Simple function to oreturn what route to go to depending on email verification state
// exports.routeActive = function(bool) {
//     let state = "/dashboard/activate"
//     if(bool) state = "/dashboard/"
//     return state;
// }