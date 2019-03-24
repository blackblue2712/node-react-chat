const _ = require('lodash');
const User = require('../models/user');

module.exports.userById = (req, res, next, id) => {
	User.findById(id).exec( (err, user) => {
		if (err || !user) return res.status(400).json({
			user: 'User not found'
		});
		req.profile = user;
		next();
	});
}

module.exports.hasAuthorization = (req, res, next) => {
	const authorized = req.profile && req.payload && req.profile._id === req.payload._id;
	if (!authorized) {
		res.status(403).json({
			error: '!hasAuthorization. User not authorized to perform this action'
		})
	}
}

module.exports.getUsers = (req, res) => {
	User.find( (err, users) => {
		if (err) return res.status(400).json( {error: err} );
		res.json( {users} );
	}).select('name email created updated');
}

module.exports.getUser = (req, res) => {
	req.profile.hash_password = undefined;
	req.profile.salt = undefined;
	res.json( req.profile );
}

module.exports.updateUser = (req, res) => {
	let user = req.profile;
	user = _.extend(user, req.body);
	user.updated = Date.now();
	user.save( (err) => {
		if (err) res.status(400).json({
			error: 'Error was occurred, may be you not authorized to perform this action. Please try again'
		});

		user.hash_password = undefined;
		user.salt = undefined;
		res.json( {user} );
	});
}

module.exports.deleteUser = (req, res) => {
	let user = req.profile;
	user.remove( (err) => {
		if (err) return res.json( {error: err} );
		res.json( {message: 'User deleted successfully'} );
	});
}