let mongoose = require('mongoose');
let User = require('../models/user.js');
let bcryptUtil = require('../util/bcrypt.js');

module.exports = async function(req, res, next) {
    if(req.cookies.auth_token) {
        let verified;
        try {
            verified = await bcryptUtil.authenticate(req.cookies.auth_token);
        } catch(e) {
            verified = e;
        }
        if(verified.state) {
            return res.redirect(verified.active_link);;
        } else {
            next();
        }
    } else {
        next();
    }
}