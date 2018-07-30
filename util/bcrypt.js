var bcrypt = require('bcrypt');
const saltRounds = 10;
const verCodeOpts = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';

exports.validatePassword = function(password, compare) {
    return bcrypt.compare(password, compare);
}

exports.hash = function(password) {
    return bcrypt.hashSync(password, saltRounds);
}

exports.verifyCode = function() {
    let totalStr = '';
    for(let x = 0; x < 5; x++) {
        totalStr += verCodeOpts.charAt(Math.random() * (verCodeOpts.length - 1));
    }
    return totalStr;
}