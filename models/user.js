const mongoose = require('mongoose');
const uuidv1 = require('uuid/v1');
const crypto = require('crypto');
const userSchema = mongoose.Schema({
	name: {
		type: String,
		trim: true,
		requried: true
	},
	email: {
		type: String,
		trim: true,
		requried: true
	},
	hash_password: {
		type: String,
		trim: true,
		requried: true
	},
	salt: String,
	created: {
		type: Date,
		default: Date.now,
	},
	updated: Date
});

userSchema.virtual('password')
.set( function(password) {
	// create ttemporary variable
	this._password = password;
	// generate a timestamp
	this.salt = uuidv1();

	// encryptPassword
	this.hash_password = this.encryptPassword(password);

})
.get( function () {
	return this._password;
})

userSchema.methods = {
	authenticate: function (textPlain) {
		return this.encryptPassword(textPlain) === this.hash_password;
	},

	encryptPassword: function (password) {
		if (!password) return "";
		try {
			return crypto.createHmac('sha1', this.salt)
                   .update(password)
                   .digest('hex');
		} catch (err) {
			// password must be string
			return "";
		}
	}
}

User = mongoose.model('User', userSchema, 'users');

module.exports = User;
