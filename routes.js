var path = require('path');
module.exports = function(app, passport) {
	//Home Page 
	app.get('/', function(request, response){
		response.sendFile('/public/views/index.html');
		// response.render path.join(__dirname, "/views/index.html")
	});


	// =================================================
	// ROUTES FOR AUTHENTICATING A USER STARTS
	// =================================================

	//Login Page
	app.get('/login', function(request, response){
		response.sendFile(path.join(__dirname,'/public/views/login.html'));
	});

	app.post('/login', passport.authenticate('local-login',{
		successRedirect: '/loggedinHomePage',
		failureRedirect: '/login',
		failureflash: true
	}));

	//Signup Page
	app.get('/signup', function(request, response){
		response.sendFile(path.join(__dirname,'/public/views/signup.html'));
		
	});

	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect: '/loggedinHomePage',
		failureRedirect: '/signup',
		failureflash: true
	}));

	//Show app homepage to only users who have logged in 
	//isLoggedIn is the function
	app.get('/loggedinHomePage', isLoggedIn, function(request, response){
		response.sendFile(path.join(__dirname,'/public/views/loggedinHomePage.html'), {
			user: request.user //user is retrieved out of the session and passed to Handlebars
		});
	});

	app.get('/logout', function(request, response){
		request.logout();
		response.redirect('/');
	});

	// ==============================================
	// FACEBOOK ROUTES
	// ==============================================

	// Facebook authentication and login
	app.get('/auth/facebook', passport.authenticate('facebook', {scope: 'email'}));

	// facebook authenticates, cllback is called
	app.get('/auth/facebook/callback',
		passport.authenticate('facebook', {
			successRedirect: '/loggedinHomePage',
			failureRedirect: '/'
		}));


	// ==============================================
	// TWITTER ROUTES
	// ==============================================
	app.get('/auth/twitter', passport.authenticate('twitter'));

	app.get('/auth/twitter/callback',
		passport.authenticate('twitter', {
			successRedirect: '/loggedinHomePage',
			failureRedirect: '/'
		}));

	// ===============================================
	// AUTHENTICATION ROUTES END
	// ===============================================


	// ================================================
	// ROUTES FOR AUTHORIZING USER STARTS
	// ================================================

	// local 
	app.get('/connect/local', function(request, response){
		response.sendFile(path.join(__dirname, '/public/views/connectLocal.html'));
	});
	app.post('/connect/local', passport.authenticate('local-signup', {
		successRedirect: '/loggedinHomePage',
		failureRedirect: '/connect/local',
		failureflash: true
	}));

	// Facebook linking

	app.get('/connect/facebook', passport.authorize('facebook', {scope: 'email'}));

	app.get('/connect/facebook/callback',
		passport.authorize('facebook', {
			successRedirect: '/profile',
			failureRedirect: '/'
		}));

	// Twitter linking 
	app.get('/connect/twitter', passport.authorize('twitter', {scope: 'email'}));

	app.get('/connect/twitter/callback',
		passport.authorize('twitter', {
			successRedirect: '/profile',
			failureRedirect: '/'
		}));

	// ====================================================
	// AUTHORIZATION ENDS
	// ====================================================


	// ====================================================
	// UNLINK ACCOUNTS 
	// ====================================================

	// Social accounts - remove token 
	app.get('/unlink/facebook', function(request, response){
		var user = request.user;
		console.log(user);
		user.facebook.token = undefined;
		console.log('User after deletion');
		console.log(user);
		user.save(function(err){
			response.redirect('/loggedinHomePage');
		});
	});

	app.get('/unlink/twitter', function(request, response){
		var user = request.user;

		user.twitter.token = undefined;
		user.save(function(err){
			response.redirect('/loggedinHomePage');
		});
	});
	// Local accounts - remove email and password 

	app.get('/unlink/local', function(request, response){
		var user = request.user;

		user.local.email = undefined;
		user.local.password = undefined;
		user.save(function(err){
			response.redirect('/loggedinHomePage');
		});
	});

	// User profiles will remain in case user wants to reconnect 



	
	
	// route for logging out 
	app.get('/logout', function(request, response){
		request.logout();
		response.redirect('/');
	});
};

var isLoggedIn = function(request, response, next) {
	console.log(request.isAuthenticated());
	//if user is authenticated in the current session
	if(request.isAuthenticated()) {
		return next();
	} else {
		response.redirect('/');
	}
}