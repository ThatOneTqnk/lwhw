const express = require("express");
const app = module.exports = express.Router();
var cookieParser = require('cookie-parser');
var hardAuth = require('../auth/hardAuth.js');
var hardAuthAPI = require('../auth/hardAuthAPI.js');
var mongoose = require('mongoose');
var User = require('../models/user.js');
var bcryptUtil = require('../util/bcrypt.js');

let unauth = {"status":{"message":"Unauthenticated","status_code": 401}};

app.post('/courses', hardAuthAPI, (req, res) => {
    User.findOne({token: req.body.token}, async (err, resp) => {
        if(resp) {
            if(resp.course.length == 0) {
                res.send({"courses": []});
                return;
            } 
            let courses;
            try {
                courses = await bcryptUtil.getCourses(resp.course);
            } catch(e) {
                courses = e;
            }
            if(courses.err) {
                res.send({"error":{"message": "Could not fetch data"}});
                return;
            }
            res.send({"courses": courses});
            return;
        }
        if(err || !resp || (!err && !resp)) {
            res.send(unauth);
            return;
        }
    });
});

app.post('/courses/delete', hardAuthAPI, (req, res) => {
    User.findOne({token: req.body.token}, async (err, resp) => {
        if(resp) {
            if(resp.course.length == 0) {
                res.send({"error":{"message":"No courses found."}})
            }

        }
        if(err || !resp || (!err && !resp)) {
            res.send(unauth);
            return;
        }
    });
});

app.post('/assignments', hardAuthAPI, (req, res) => {
    User.findOne({token: req.body.token}, async (err, resp) => {
        if(resp) {
            if(resp.course.length == 0) {
                res.send({"assignments": []});
                return;
            } 
            let assignments;
            try {
                assignments = await bcryptUtil.getHW(resp.assign);
            } catch(e) {
                assignments = e;
            }
            if(assignments.err) {
                res.send({"error":{"message": "Could not fetch data"}});
                return;
            }
            res.send({"assignments": assignments});
            return;
        }
        if(err || !resp || (!err && !resp)) {
            res.send({"status":{"message":"Unauthenticated","status_code": 401}});
            return;
        }
    });
});

app.use(function (req, res, next) {
    res.status(404);
    res.send({"status":{"message":"Not Found", "status_code": 404}})
});