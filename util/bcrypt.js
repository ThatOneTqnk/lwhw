var bcrypt = require('bcrypt');
const saltRounds = 10;
const verCodeOpts = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
const User = require('../models/user.js')
const mongoose = require('mongoose');

exports.validatePassword = function(password, compare) {
    return new Promise((resolve, reject) => {
        resolve(bcrypt.compare(password, compare));
    });
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

exports.authenticate = function(incToken) {
    return new Promise((resolve, reject) => {
        User.findOne({token: incToken}, (err, resp) => {
            if(resp) resolve(true);
            if(err || !resp || (!err && !resp)) {
                reject(false);
            }
        });
    });
}