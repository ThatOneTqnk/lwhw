const express = require("express");
const app = module.exports = express.Router();
var cookieParser = require('cookie-parser');
var hardAuth = require('../auth/hardAuth.js');
var mongoose = require('mongoose');
var User = require('../models/user.js');
var bcryptUtil = require('../util/bcrypt.js');

app.get('/', hardAuth, (req, res) => {
    bcryptUtil.renderData(res, "pages/hw", {}, {state: req.body.state, username: req.body.plainuser});
});

app.get('/list', hardAuth, (req, res) => {
    bcryptUtil.renderData(res, "pages/hwlist", {}, {state: req.body.state, username: req.body.plainuser});
});