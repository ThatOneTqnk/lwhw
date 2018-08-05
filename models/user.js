var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
  active: {
    type: Boolean,
    default: false
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  username_lower: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
  },
  resend_date: {
    type: Date
  },
  forgot_code: {
    type: String
  },
  activationCode: {
    type: String
  },
  token: {
    type: String,
    unique: true,
    required: true
  }
});

var User = mongoose.model('User', UserSchema);
module.exports = User;