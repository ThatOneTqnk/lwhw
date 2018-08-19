const express = require("express");
const app = module.exports = express.Router();
var cookieParser = require('cookie-parser');
var hardAuth = require('../auth/hardAuth.js');
var hardAuthAPI = require('../auth/hardAuthAPI.js');
var mongoose = require('mongoose');
var User = require('../models/user.js');
var bcryptUtil = require('../util/bcrypt.js');

let unauth = {"status":{"message":"Unauthenticated","status_code": 401}};

app.post('/', hardAuthAPI, (req, res) => {
    if(!req.body.token) {
        res.send(unauth);
        return;
    }
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

app.post('/delete', hardAuthAPI, (req, res) => {
    if(!req.body.token || !req.body.id) {
        res.send({"error":{"message":"Missing correct fields"}});
        return;
    }
    User.findOne({token: req.body.token}, async (err, resp) => {
        if(resp) {
            if(resp.course.length == 0) {
                res.send({"error":{"message":"No courses found"}});
                return;
            } else if(resp.course.indexOf(req.body.id) > -1) {
                let delCourse;
                try {
                    delCourse = bcryptUtil.deleteCourse(req.body.id);
                } catch(e) {
                    delCourse = e;
                }
                if(delCourse.err) {
                    res.send({"error":{"message":"Could not delete course"}});
                    return;
                }
                res.send({"success": true});
                return;
            } else {
                res.send({"error":{"message":"Course not found"}})
            }
        }
        if(err || !resp || (!err && !resp)) {
            res.send(unauth);
            return;
        }
    });
});