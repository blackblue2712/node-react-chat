const formidable = require('formidable');
const fs = require('fs');
const _ = require('lodash');

const Post = require("../models/post");

module.exports.postById = (req, res, next, id) => {
	Post.findById(id)
	.populate('postedBy', '_id name')
	.exec( (err, post) => {
		if (err) return res.status(400).json( {error: err} );
		req.post = post;
		next();
	});
}

module.exports.isPoster = (req, res, next) => {
	let isPoster = req.post && req.payload && req.post.postedBy._id == req.payload._id;
	
	if (!isPoster) {
		return res.status(403).json( {error: '!isPoster. No authorized'} );
	}
	next();
}

module.exports.getPosts = (req, res) => {
	const post = Post.find()
					 .populate('postedBy', '_id name photo.contentType')
					 .select('_id title body created')
					 .sort({created: -1})
					 .then( posts => res.json(posts) )
					 .catch( err => console.log(err) )

}

module.exports.createPost = (req, res) => {
	let form = new formidable.IncomingForm();
	form.keepExtensions = true;
	form.parse(req, (err, fields, files) => {
		if (err) return res.status(400).json({
			error: 'Image could not be uploaded'
		});

		let post = new Post(fields);
		req.profile.hash_password = undefined;
		req.profile.salt = undefined;
		post.postedBy = req.profile._id;

		if (files.photo) {
			post.photo.data = fs.readFileSync(files.photo.path);
			post.photo.contentType = files.photo.type;	
		}

		post.save( (err, result) => {
			if (err) return res.status(400).json({
				error: err
			});
			res.json(result);
		});
	});
}

module.exports.postByUser = (req, res) => {
	Post.find( {postedBy: req.profile._id} )
			  .populate('postedBy', '_id name')
			  .sort('created')
			  .exec( (err, posts) => {
		if (err) return res.status(400).json({error: err});
		res.json(posts);
	});
}

module.exports.deletePost = (req, res) => {
	let post = req.post;
	post.remove( (err, post) => {
		if(err) return res.status(403).json( {error: err} );
		res.json( {'message': 'Post deleted successfully'} );
	});
}

module.exports.updatePost = (req, res) => {
	let post = req.post;
	post = _.extend(post, req.body);

	post.save( (err, post) => {
		if (err) return res.status(400).json( {error: err} );
		res.json(post);
	});
}