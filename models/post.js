const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;
const Schema = mongoose.Schema;

const postSchema = new Schema ({
	title: {
		type: String,
		requried: "Title is requried",
		minlength: 4,
		maxlength: 150
	},
	body: {
		type: String,
		requried: "Body is requried",
		minlength: 4,
		maxlength: 2000	
	},
	photo: {
		data: Buffer,
		contentType: String
	},
	postedBy: {
		type: ObjectId,
		ref: 'User'
	},
	created: {
		type: Date,
		default: Date.now,
	},
	updated: Date,
	likes: [{type: ObjectId, ref: "User"}],
	comments: [
		{
			text: String,
			created: {type: Date, default: Date.now},
			postedBy: {type: ObjectId, ref:"User"}
		}
	]
});

const Post = mongoose.model("Post", postSchema, "post");

module.exports = Post;