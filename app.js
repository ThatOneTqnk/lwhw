var express = require('express');
var request = require('request');
var compression = require('compression');
var bodyparser = require('body-parser');
var app = express();
var path = require('path');
var mongoose = require('mongoose');
var User = require('./models/user.js');
var uuidv4 = require('uuid/v4');

var cookieParser = require('cookie-parser');
var validator = require('validator');
var softAuth = require('./auth/softAuth.js');
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
                    resp.save(function (err, updated) {
                        if (err) {
                            res.send({error: 101});
                            return;
                        }
                        res.send({good: true});
                        return;
                    });
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
    res.status(404).send("Sorry can't find that!")
})

app.listen(PORT, () => console.log(`Listening on port ${PORT}`))