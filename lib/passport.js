'use strict';

var BasicStrategy = require('passport-http').BasicStrategy;
var User = require('../models/user');

module.exports = function(passport) {
  var verify = function(userid, password, done) {
    User.findOne({'basic.email': userid}, function(err, user) {
      if (err) return done('server error');
      if (!user) return done('user does not exist');
      if (!user.validatePassword(password)) return done('access denied');
      return done(null, user);
    });
  };

  passport.use(new BasicStrategy(verify));
};
