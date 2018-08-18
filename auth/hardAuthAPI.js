let mongoose = require('mongoose');
let User = require('../models/user.js');
let bcryptUtil = require('../util/bcrypt.js');

module.exports = async function(req, res, next) {
    if (req.body.token) {
        let isAuth;
        try {
            isAuth = await bcryptUtil.authenticate(req.body.token);
        } catch(e) {
            isAuth = e;
        }
        if(isAuth.state) {
            if(isAuth.active) {
                next()
            } else {
                // If account is not activated
                res.status(403);
                res.send({"status":{"message":"Forbidden","status_code":403, "extra": "Not activated"}});
            }
        } else {
            // If account's token is invalid
            res.status(403);
            res.send({"status":{"message":"Forbidden","status_code":403}});
        }
    } else {
        // If token is not in payload
        res.status(403);
        res.send({"status":{"message":"Forbidden","status_code":403}});
    }
}