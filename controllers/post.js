const formidable = require('formidable');
const fs = require('fs');
const _ = require('lodash');

const Post = require("../models/post");

module.exports.postById = (req, res, next, id) => {
	Post.findById(id)
	.populate('postedBy', '_id name')
	.populate("comments.postedBy", "_id name photo.contentType")
	// .populate("comments", "_id text created")
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
					 .populate("comments.postedBy", "_id name photo.contentType")	
					//  .populate("comments", "_id text created")
					 .select('_id title body created photo.contentType likes')
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
			  .select("_id title photo.contentType likes")
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
	let form = formidable.IncomingForm();
	form.keepExtensions = true;
	form.parse(req, (err, fields, files) => {
		if(err) {
			return res.status(400).json( {error: "Photo could not be uploaded file"} );
		}
		// save post
		let post = req.post;
		post = _.extend(post, fields);
		post.updated = Date.now();

		if(files.photo) {
			post.photo.data = fs.readFileSync(files.photo.path);
			post.photo.contentType = files.photo.type;
		}

		post.save( (err) => {
			if(err) return res.status(400).json( {error: err} );

			res.json(post);
		})

	})
}

module.exports.postPhoto = async (req, res) => {
	res.set("Content-Type", req.post.photo.contentType);
	await res.send(req.post.photo.data);
}

module.exports.singlePost = (req, res) => {
	return res.json(req.post);
}

module.exports.like = (req, res) => {
	Post.findByIdAndUpdate( req.body.postId,
		{$push: {likes: req.body.userId}},
		{new: true} // Return giá trị sau khi đã update	
	).exec( (err, result) => {
		if(err) return res.status(400).json( {error: err})

		res.json(result);
	});	
}

module.exports.unlike = (req, res) => {
	Post.findByIdAndUpdate( req.body.postId,
		{$pull: {likes: req.body.userId}},
		{new: true} // Return giá trị sau khi đã update	
	).exec( (err, result) => {
		if(err) return res.status(400).json( {error: err})

		res.json(result);
	});
	
}

module.exports.comment = (req, res) => {

	const comment = req.body.comment;
	console.log(comment)
	const postId = req.body.postId;
	comment.postedBy = req.body.userId;

	Post.findByIdAndUpdate( postId,
		{$push: {comments: comment}},
		{new: true}
	)
	.populate("comments.postedBy", "_id name photo.contentType")	
	.populate("postedBy", "_id name photo.contentType")
	.exec( (err, result) => {
		if(err) return res.status(400).json( {error: err})

		res.json(result);
	});
}

module.exports.uncomment = (req, res) => {
	const comment = req.body.comment;
	const postId = req.body.postId;

	Post.findByIdAndUpdate( postId,
		{$pull: {comments: {_id: comment._id} }},
		{new: true}
	)
	.populate("comments.postedBy", "_id name photo.contentType")
	.exec( (err, result) => {
		if(err) return res.status(400).json( {error: err})

		res.json(result);
	});
}