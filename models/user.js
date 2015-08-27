var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

// schema 

var userSchema = mongoose.Schema({
	local: {
		email: String,
		password: String,
	},
	facebook: {
		id: String,
		token: String,
		email: String,
		name: String
	},
	twitter: {
		id: String,
		token: String,
		displayName: String,
		userName: String
	},
	google: {
		id: String,
		token: String,
		email: String,
		name: String
	}
});

// Hash generation
userSchema.methods.generateHash = function(password) {
	var salt = bcrypt.genSaltSync(10);
	return bcrypt.hashSync(password, salt, null);
}

// Authenticating password
userSchema.methods.validPassword = function(password) {
	return bcrypt.compareSync(password, this.local.password);
}

// Mongoose models reprensent documents which are saved and retrieved from the db
module.exports = mongoose.model('User', userSchema);