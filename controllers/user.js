const _ = require('lodash');
const formidable = require('formidable');
const fs = require('fs');
const User = require('../models/user');

module.exports.userById = (req, res, next, id) => {
	User.findById(id)
	.populate("following", "_id name about photo.contentType")
	.populate("followers", "_id name about photo.contentType")
	.exec( (err, user) => {
		if (err) return res.status(400).json({
			error: err
		});
		req.profile = user;
		next();
	});
}

module.exports.hasAuthorization = (req, res, next) => {
	const authorized = req.profile && req.payload && req.profile._id == req.payload._id;
	if (!authorized) {
		res.status(403).json({
			error: '!hasAuthorization. User not authorized to perform this action'
		})
	}
}

module.exports.getUsers = (req, res) => {
	User.find( (err, users) => {
		if (err) return res.status(400).json( {error: err} );
		res.json( users );
	}).select('name email created updated photo.contentType');
}

module.exports.getUser = (req, res) => {
	req.profile.hash_password = undefined;
	req.profile.salt = undefined;
	res.json( req.profile );
}

module.exports.updateUser = (req, res) => {
	let form = formidable.IncomingForm();
	form.keepExtensions = true;
	form.parse(req, (err, fields, files) => {
		if(err) {
			return res.status(400).json( {error: "Photo could not be uploaded file"} );
		}
		// save user
		let user = req.profile;
		user = _.extend(user, fields);
		user.updated = Date.now();

		if(files.photo) {
			user.photo.data = fs.readFileSync(files.photo.path);
			user.photo.contentType = files.photo.type;
		}

		user.save( (err, result) => {
			if(err) return res.status(400).json( {error: err} );

			user.hash_password = undefined;
			user.salt = undefined;
			res.json(user);
		})

	})
}

module.exports.deleteUser = (req, res) => {
	let user = req.profile;
	user.remove( (err) => {
		if (err) return res.json( {error: err} );
		res.json( {message: 'User deleted successfully'} );
	});
}

module.exports.userPhoto = (req, res, next) => {
	if(req.profile.photo.data) {
		res.set("Content-Type", req.profile.photo.contentType);
		res.send(req.profile.photo.data);
	}
	next();
}


// Follow and unfollow
module.exports.addFollowing = (req, res, next) => {
	User.findByIdAndUpdate( req.body.userId, {$push: {following: req.body.followId}}, (err, result) => {
		if(err) return res.status(400).json({error: err});
		next();
	});
}

module.exports.addFollower = (req, res) => {
	User.findByIdAndUpdate( req.body.followId,
							{$push: {followers: req.body.userId}},
							{new: true},
	)
	.populate("following", "_id name")
	.populate("followers", "_id name")
	.exec( (err, result) => {
		if(err) return res.status(400).json({error: err});
		result.hash_password = undefined;
		result.salt = undefined;
		return res.json(result)
	});
}

// unFollow and unfollow
module.exports.removeFollowing = (req, res, next) => {
	User.findByIdAndUpdate( req.body.userId, {$pull: {following: req.body.followId}}, (err, result) => {
		if(err) return res.status(400).json({error: err});
		next();
	});
}

module.exports.removeFollower = (req, res) => {
	User.findByIdAndUpdate( req.body.followId,
							{$pull: {followers: req.body.userId}},
							{new: true},
	)
	.populate("following", "_id name")
	.populate("followers", "_id name")
	.exec( (err, result) => {
		if(err) return res.status(400).json({error: err});
		result.hash_password = undefined;
		result.salt = undefined;
		return res.json(result)
	});
}


// find user not following - recommend follow user
module.exports.findPeople = async (req, res) => {
	let idsFollowing = req.profile.following;
	idsFollowing.push(req.profile._id);

	await User.find( {_id: {$nin: idsFollowing}} , (err, data) => {
		if(err) return res.status(400).json({error: err})
		res.json(data);
	}).select("_id name photo.contentType");
}