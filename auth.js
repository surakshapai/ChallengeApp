// User is sent to Facebook's OAuth to authenticate his details. Facebook does the 
// authentication and sends back user data, which, is handled here. 
module.exports = {
	'facebookAuth': {
		'clientID': '418912111652983',
		'clientSecret': '4336d66a9431fd54c34c18d0cb7c05c6',
		'callbackURL': 'http://localhost:8080/auth/facebook/callback'
	},
	'twitterAuth': {
		'consumerKey': 'vAMokDMGcyKHIpx1mn5KwIDqI',
		'consumerSecret': 'r62XHmjvuRKeWw7B5SENgBpW61UdlmnifwHxtAbQxzjHfZIi6w',
		'callbackURL': 'http://localhost:8080/auth/twitter/callback'
	},
	'googleAuth': {
		'clientID': '',
		'clientSecret': '',
		'callbackURL': 'http://localhost:8080/auth/google/callback'
	}
};