let mongoose = require('mongoose');
let User = require('../models/user.js');
let bcryptUtil = require('../util/bcrypt.js');

module.exports = async function(req, res, next) {
    if (req.method == "GET") {
        if(req.body.verified) {
            next()
        } else {
            res.redirect('/dashboard/activate');
        }
    } else {
        if(req.body.verified) {
            next()
        } else {
            return res.send({err: 'Not authenticated.'})
        }
    }
}