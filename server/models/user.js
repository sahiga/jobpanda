/*================ REQUIRE DEPENDENCIES ================*/
var db 				= require('../config/config'),
    JobUser   = require('./job_user'),
    Promise   = require('bluebird'),
    bcrypt    = require('bcrypt'),
    Listing 	= require('./listing');

/*============== SET SCHEMA RELATIONSHIPS ==============*/
var User = db.Model.extend({
	tableName: 'users',
  //if the section below looks very familiar... that's because it is
	initialize: function(){
    // hash password when new user is created
    this.on('creating', this.hashPassword);
  },
  comparePassword: function(attemptedPassword, callback) {
    bcrypt.compare(attemptedPassword, this.get('password'), function(err, isMatch) {
      callback(isMatch);
    });
  },
  hashPassword: function(){
    var cipher = Promise.promisify(bcrypt.hash);
    // return a promise - bookshelf will wait for the promise
    // to resolve before completing the create action
    console.log('password inside of hashPassword: ', this.get('password'));
    return cipher(this.get('password'), null)
      .bind(this)
      .then(function(hash) {
        console.log('hash: ', hash);
        this.set('password', hash);
      });
  },
	listings: function(){
		return this.belongsToMany(Listing).through(JobUser);
	}
});

/*=================== EXPORT MODULE ===================*/
module.exports = User;