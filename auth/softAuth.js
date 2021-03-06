let mongoose = require('mongoose');
let User = require('../models/user.js');
let bcryptUtil = require('../util/bcrypt.js');

module.exports = async function(req, res, next) {
    if(req.body.state) {
        if(req.body.verified) {
            return res.redirect('/dashboard/');
        } else {
            return res.redirect('/dashboard/activate');
        }
    } else {
        next();
    }
}