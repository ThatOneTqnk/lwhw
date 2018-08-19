var express = require('express');
var request = require('request');
var compression = require('compression');
var bodyparser = require('body-parser');
var app = express();
var path = require('path');
var mongoose = require('mongoose');

// Models
var User = require('./models/user.js');
var Assignment = require('./models/assignment.js');
var Course = require('./models/course.js');

var uuidv4 = require('uuid/v4');

var cookieParser = require('cookie-parser');
var validator = require('validator');
var softAuth = require('./auth/softAuth.js');
var hardAuth = require('./auth/hardAuth.js');
var bcryptUtil = require('./util/bcrypt.js');

var PORT = process.env.PORT || 5000;

mongoose.connect(bcryptUtil.sensitive.db_url, {useNewUrlParser: true});

app.use(cookieParser());
app.use(compression());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({
    extended: true
}));


app.use(express.static('public'));


app.set('view engine', 'ejs');

app.use("/api", require("./routes/api"));

app.use(async (req, res, next) => {
    req.body.state = false;
    req.body.plainuser = false;
    if (req.cookies.auth_token) {
        let isAuth;
        try {
            isAuth = await bcryptUtil.authenticate(req.cookies.auth_token);
        } catch(e) {
            isAuth = e;
        }
        req.body.state = isAuth.state;
        if(isAuth.state) {
            req.body.plainuser = isAuth.user;
            req.body.verified = isAuth.active;
        }
    }
    next();
});


app.get('/', (req, res) => {
    bcryptUtil.renderData(res, "pages/index", {}, {state: req.body.state, username: req.body.plainuser});
});

app.get('/login', softAuth, (req, res) => {
    bcryptUtil.renderData(res, "pages/login", {}, {state: req.body.state, username: req.body.plainuser});
});

app.get('/register', softAuth, (req, res) => {
    bcryptUtil.renderData(res, "pages/register", {}, {state: req.body.state, username: req.body.plainuser});
});

app.post('/verify', (req, res) => {
    if(req.body.code) {
        let code = req.body.code
        code = code.toUpperCase().slice(0, 5);
        User.findOne({token: req.cookies.auth_token}, (err, resp) => {
            if(resp) {
                if(code == resp.activationCode) {
                    resp.set({ active: true });
                    if (resp.resend_date) resp.resend_date = undefined;
                    if (resp.activationCode) resp.activationCode = undefined;
                    let retained;
                    try {
                        retained = await bcryptUtil.retainData(resp); 
                    } catch(e) {
                        retained = e;
                    }
                    if(retained.error) {
                        res.send({err: 101});
                        return;
                    } else {
                        res.send({good: true});
                        return;
                    }
                } else {
                    res.send({error: 3});
                    return;
                }
            }
            if(err || !resp || (!err && !resp)) {
                res.send({error: 2});
                return;
            }
        });
    } else {
        res.send({error: -1});
        return;
    }
});

app.post('/hw', async (req, res) => {
    if(!req.body.state) {
        res.status(401).send('Unauthorized');
        return;
    }
    if(req.body.title && req.body.desc) {
        if(req.body.title.length > 45) {
            res.send({err: 'Maximum title length is 45 characters.'});
            return;
        }
        if(req.body.desc.length > 500) {
            res.send({err: 'Description cannot be greater than 500 characters'});
            return;
        }
        var assignData = {
            title: req.body.title,
            desc: req.body.desc,
            created: (new Date).getTime()
        }
        let assignTry;
        try {
            assignTry = await bcryptUtil.createNote(assignData);
        } catch(e) {
            assignTry = e;
        }
        if(assignTry.err) {
            res.send(assignTry);
            return;
        }
        User.findOne({token: req.cookies.auth_token}, async (err, resp) => {
            if(resp) {
                resp.assign.push(assignTry.id);
                let retained;
                try {
                    retained = await bcryptUtil.retainData(resp); 
                } catch(e) {
                    retained = e;
                }
                if(retained.error) {
                    res.send({err: 'Could not save data. Try again.'});
                    return;
                } else {
                    res.send({good: true});
                    return;
                }
            }
            if(err || !resp || (!err && !resp)) {
                res.send({err: 'Not authenticated.'});
                return;
            }
        });
    } else {
        res.send({err: 'Must include assignment title and description.'});
        return;
    }
});

let acceptedColors = [
    'blue',
    'red',
    'green',
    'yellow',
    'gold',
    'teal',
    'purple'
]

app.post('/course', hardAuth, async (req, res) => {
    if(req.body.course && req.body.color) {
        if(req.body.course.length > 25) {
            res.send({err: 'Course length cannot exceed 25 characters.'});
            return;
        }
        let realColor = req.body.color.toLowerCase();
        if(acceptedColors.indexOf(realColor) < 0) {
            res.send({err: 'Color not recognized.'});
            return;
        }
        let courseData = {
            name: req.body.course,
            color: realColor,
            name_lower: req.body.course.toLowerCase()
        };
        User.findOne({token: req.cookies.auth_token}, async (err, resp) => {
            if(resp) {
                let mutualCourse;
                if(resp.course.length > 0) {
                    try {
                        mutualCourse = await bcryptUtil.matchCourse(courseData.name_lower);
                    } catch(e) {
                        mutualCourse = e;
                    }
                }
                if(mutualCourse) {
                    res.send({err: 'You already have a course by this name.'});
                    return;
                }
                let courseTry;
                try {
                    courseTry = await bcryptUtil.createCourse(courseData);
                } catch(e) {
                    courseTry = e;
                }
                if(courseTry.err) {
                    res.send({err:'An error occurred.'});
                    return;
                }
                resp.course.push(courseTry.id);
                let retained;
                try {
                    retained = await bcryptUtil.retainData(resp);
                } catch(e) {
                    retained = e;
                }
                if(retained.error) {
                    res.send({err: 'An error occurred.'});
                    return;
                } else {
                    res.send({good: true});
                    return;
                }

                if(err || !resp || (!err && !resp)) {
                    res.send({err: 'Not authenticated'});
                    return;
                }
            }
        });
        
    } else {
        res.send({err: 'All fields must be filled out.'});
        return;
    }
});


app.post('/resend', (req, res) => {
    if(req.body.token) {
        User.findOne({token: req.body.token}, async (err, resp) => {
            if(resp) {
                let date = (new Date).getTime();
                let changeDate = false;
                if(!resp.resend_date) {
                    changeDate = true;
                } else {
                    if(!(((date - resp.resend_date) / 1000) >= 60)) {
                        res.send({error: 2});
                        return;
                    } else {
                        changeDate = true;
                    }
                }
                if(changeDate) {
                    resp.set({resend_date: date});
                    let retained;
                    try {
                        retained = await bcryptUtil.retainData(resp); 
                    } catch(e) {
                        retained = e;
                    }
                    if(retained.error) {
                        res.send({error: 1});
                        return;
                    }
                }
                bcryptUtil.sendCode(resp.email, resp.activationCode);
                res.send({good: true});
                return;
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
});

app.post('/ghost_login', (req, res) => {
    if(req.body.user && req.body.pass) {
        let credentials = {user: req.body.user.toLowerCase(), pass: req.body.pass};
        if(credentials.user.length > 20 || credentials.user.pass > 100) {
            res.send({error: 1});
            return;
        }
        User.findOne({username_lower: credentials.user}, async (err, resp) => {
            if(resp) {
                let verified = bcryptUtil.validatePassword(credentials.pass, resp.password);
                if(verified) {
                    res.send({token: resp.token, activated: resp.active});
                    return;
                } else {
                    res.send({error: 1});
                    return;
                }
            }
            if(err || !resp || (!err && !resp)) {
                res.send({error: 1});
                return;
            }
        });

    } else {
        res.send({error: -1});
        return;
    }
});

app.post('/register', (req, res) => {
    if(!(req.body.devCode === bcryptUtil.sensitive.activation_code)) {
        res.send({error: 5});
        return;
    }
    if(req.body.email && req.body.username && req.body.password && req.body.passwordConf) {
        let goodie = /^.{4,20}$[a-zA-Z0-9_]*$/g.test(req.body.username);
        if(!goodie || req.body.username.indexOf(' ') > 0) {
            res.send({error: 6})
            return;
        }
        if(!validator.isEmail(req.body.email)) {
            res.send({error: 4})
            return;
        }
        if(req.body.password !== req.body.passwordConf) {
            res.send({error: 1});
            return;
        }
        var userData = {
            email: req.body.email.toLowerCase(),
            username_lower: req.body.username.toLowerCase(),
            username: req.body.username,
            password: bcryptUtil.hash(req.body.password),
            activationCode: bcryptUtil.verifyCode(),
            token: uuidv4()
        }
        console.log(userData);

        User.findOne({$or: [{username_lower: userData.username_lower}, {email: userData.email}]}, (err, resp) => {
            if(err) {
                console.log(`Error in retrieving data: ${err}`);
                res.send({error: 101});
                return;
            }
            if (resp) {
                if (resp.username_lower === userData.username_lower) {
                    console.log('\nRepeated username.\n');
                    res.send({error: 3});
                } else if (resp.email === userData.email) {
                    console.log('\nRepeated email.\n');
                    res.send({error: 2});
                }
                return;
            }

            User.create(userData, (err, user, next) => {
                if(err) {
                    res.send({error: 101});
                    return;
                } else {
                    console.log('reached this pt.');
                    bcryptUtil.sendCode(userData.email, userData.activationCode);
                    res.send({token: userData.token});
                    return;
                }
            });


        });
    } else {
        res.send({error: -1});
        return; 
    };
});

app.use("/forgot", require("./routes/forgot"));
app.use("/dashboard", require("./routes/dashboard"));

app.use(function (req, res, next) {
    res.status(404);
    bcryptUtil.renderData(res, "pages/notfound", {}, {state: req.body.state, username: req.body.plainuser});
})

app.listen(PORT, () => console.log(`Listening on port ${PORT}`))