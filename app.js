var express = require('express');
var request = require('request');
var compression = require('compression');
var bodyparser = require('body-parser');
var config = false;
try {
    config = require('./config.json');
} catch(e) {
    console.log('Shell alternatives will be accessed.');
}
var app = express();
var path = require('path');
var mongoose = require('mongoose');
var User = require('./models/user.js');
var uuidv4 = require('uuid/v4');
var bcryptUtil = require('./util/bcrypt.js');
var cookieParser = require('cookie-parser');
var validator = require('validator');
var softAuth = require('./auth/softAuth.js');

var sensitive;
if(config) {
    sensitive = {email_pass: config.email_pass, activation_code: config.activation_code, db_url: config.db_url};
} else {
    sensitive = {email_pass: process.env.email_pass, activation_code: process.env.activation_code, db_url: process.env.db_url};
}

const nodemailer = require('nodemailer');
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: "lwhwservice@gmail.com", // service is detected from the username
        pass: sensitive.email_pass
    }
});

var PORT = process.env.PORT || 5000;

mongoose.connect(sensitive.db_url, {useNewUrlParser: true});

app.use(cookieParser());
app.use(compression());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({
    extended: true
  }));


app.use(express.static('public'));


app.set('view engine', 'ejs');


app.get('/', (req, res) => {
    res.render('pages/index');
});

app.get('/login', softAuth, (req, res) => {
    res.render('pages/login');
});

app.get('/register', softAuth, (req, res) => {
    res.render('pages/register');
});

app.post('/verify', (req, res) => {
    if(req.body.code) {
        let code = req.body.code
        if(code.length == 0) {
            res.send({error: 1});
            return;
        }
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
    if(!(req.body.devCode === sensitive.activation_code)) {
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
            email: req.body.email,
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
                    transporter.sendMail({
                        from: 'lwhwservice@gmail.com',
                        to: `${userData.email}`,
                        subject: 'Verification Link',
                        text: `Your verification code is ${userData.activationCode}`,
                        html: `<p>Your verification code is ${userData.activationCode}</p>`
                    }, (err, info) => {
                        if(err) console.log(err);
                        if(info) console.log(info);
                    });
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

app.use("/dashboard", require("./routes/dashboard"));

app.use(function (req, res, next) {
    res.status(404).send("Sorry can't find that!")
})

app.listen(PORT, () => console.log(`Listening on port ${PORT}`))