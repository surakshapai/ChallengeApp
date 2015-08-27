// All passport configuration is in this file 

//The local strategy that comes with passport 
var localStrategy = require('passport-local').Strategy;
var facebookStrategy = require('passport-facebook').Strategy;
var twitterStrategy = require('passport-twitter').Strategy;

var User = require('../models/user.js');
var configAuth = require('../auth');

module.exports = function(passport) {
	// ===================================
	// SESSION SETUP
	// ====================================

	/* Function determines what data from the user must be stored in the session. 
	The result is attached to req.session.passport.user = {}
	Here - req.session.passport.user = {id:'someId'}
	he user.id sent in this function is saved in the session and the user object is retrieved using this in the deserialize function
	The key can be anything including ID, name, email etc */
	passport.serializeUser(function(user, done) {
		done(null, user.id);
	});

	/* Whole object is retrieved in this function using the same user ID.
	The object is retrieved from the connected db 
	*/
	passport.deserializeUser(function(id, done) {
		User.findById(id, function(err, user) {
			done(err, user);
		});
	});

	// =========================================
	// FACEBOOK LOGIN
	// Profile sends user ID, email and name which gets saved (and authenticated) here
	// =========================================

	passport.use(new facebookStrategy({
			clientID: configAuth.facebookAuth.clientID,
			clientSecret: configAuth.facebookAuth.clientSecret,
			callbackURL: configAuth.facebookAuth.callbackURL,
			passReqToCallback: true
		},
		function(request, token, refreshToken, profile, done) {
			process.nextTick(function() {
				if (!request.user) {
					User.findOne({
						'facebook.id': profile.id
					}, function(err, user) {
						if (err) {
							return done(err);
						}
						if (user) {
							if(!user.facebook.token) {
								user.facebook.token = token;
								user.facebook.name = profile.name.givenName+ ' ' + profile.name.familyName;
								user.facebook.email = profile.emails[0].value;

								user.save(function(err){
									if(err) {
										throw err;
									}
									return done(null, user);
								});
							}

							return done(null,user); //i.e: if user is found
						} else {
							var newUser = new User();
							newUser.facebook.id = profile.id;
							newUser.facebook.token = token; //FB Token 
							newUser.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
							// newUser.facebook.email = profile.emails[0].value;

							// Saving user to the database 
							newUser.save(function(err) {
								if (err) {
									console.log("Error saving user in the DB");
									throw err;
								}
								return done(null, newUser);
							});
						}
					});
				} else {
					var user = request.user;

					user.facebook.id = profile.id;
					user.facebook.token = token;
					user.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
					user.facebook.email = profile.emails[0].value;

					user.save(function(err) {
						if (err) {
							throw err;
						}
						return done(null, user);
					});
				}

			});
		}

	));

// =========================================
// SIGNUP SETUP
// =========================================

passport.use('local-signup', new localStrategy({
		// The default localStrategy uses username and password for auth, here, we override with email 
		usernameField: 'email',
		passwordField: 'password',
		passReqToCallback: true //allows us to pass back the entire request to the callback
	},
	function(req, email, password, done) {
		process.nextTick(function() {
			// Find the user whose email is same as the entered email
			// Check if user already exists 
			User.findOne({
				'local.email': email
			}, function(err, user) {
				if (err) {
					return done(err);
				}
				if (user) {
					return done(null, false, req.flash('signupMessage', 'That emaail is already in use'));
				} else {
					var newUser = new User();
					newUser.local.email = email;
					newUser.local.password = newUser.generateHash(password);

					newUser.save(function(err) {
						if (err) {
							throw err;
						}
						return done(null, newUser);
					});
				}
			});
		});
	}
));

// ===============================================
// LOCAL LOGIN SETUP
// ===============================================

passport.use('local-login', new localStrategy({
		// Overriding with email 
		usernameField: 'email',
		passwordField: 'password',
		passReqToCallback: true
	},
	function(req, email, password, done) {
		User.findOne({
			'local.email': email
		}, function(err, user) {
			if (err) {
				return done(err);
			}
			if (!user) {
				return done(null, false, req.flash('loginMessage', 'No user found'));
			}
			// If entered password is wrong
			if (!user.validPassword(password)) {
				return done(null, false, req.flash('loginMessage', 'Ooops! Wrong Password'));
			}
			return done(null, user);
		});
	}));

// ===============================================
// TWITTER LOGIN
// ===============================================

passport.use(new twitterStrategy({
		consumerKey: configAuth.twitterAuth.consumerKey,
		consumerSecret: configAuth.twitterAuth.consumerSecret,
		callbackURL: configAuth.twitterAuth.callbackURL,
		passReqToCallback: true
	},
	function(request, token, tokenSecret, profile, done) {
		process.nextTick(function() {
			if (!request.user) {
				User.findOne({
					'twitter.id': profile.id
				}, function(err, user) {
					if (err) {
						return done(err);
					}
					if (user) {
						if(!user.twitter.token) {
							user.twitter.token = token;
							user.twitter.username = profile.username;
							user.twitter.displayName = profile.displayName;

							user.save(function(err){
								if(err) {
									throw err;
								}
								return done(null, user);
							});
						}
						return done(null, user);
					} else {
						var newUser = new User();
						newUser.twitter.id = profile.id;
						newUser.twitter.token = token;
						newUser.twitter.username = profile.username;
						newUser.twitter.displayName = profile.displayName;

						newUser.save(function(err) {
							if (err) {
								throw err;
							}
							return done(null, newUser);
						});
					}
				});
			} else {
				var user = request.user;

				user.twitter.id = profile.id;
				user.twitter.token = token;
				user.twitter.username = profile.displayName;
				user.twitter.displayName = profile.displayName;

				user.save(function(err){
					if(err) {
						throw err;
					}
					return done(null, user);
				})
			}

		});
	}
));
};