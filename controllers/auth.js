const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const User = require("../models/user");

const _ = require("lodash");
const { sendMail } = require("../helpers");
// load env
const dotenv = require("dotenv");
dotenv.config();


require('dotenv').config();

module.exports.getUsers = (req, res) => {
	const user = User.find()
					 .select()
					 .then( users => res.json(users) )
					 .catch( err => console.log(err) )

}

module.exports.signup = async (req, res) => {
	const existUser  = await User.findOne( {email: req.body.email} );
	if (existUser) {
		return res.json({error: "Email is taken!"});
	}
	const user = await new User(req.body);
	await user.save()
			  .then(result => { res.json({message: 'Signup sucess, please login'}) });
}

module.exports.signin = (req, res, next) => {
	// find the user based on email
	const { email, password } = req.body;
	console.log("=========",email)
	User.findOne({email: email}, (err, user) => {
		console.log("=========",user)
		// if error or no user
		if (err || !user) return res.status(401).json({
			error: 'User with that email does not exist. Please sign in again'
		});
		// if user is found, make sure email and password match
		// create authenticate method in model and use here
		if (!user.authenticate(password)) {
			return res.status(401).json({
				error: 'Email or password do not match'
			});
		}

		// generate a token with user id and secret
		const token = jwt.sign({'_id': user._id}, process.env.JWT_SECRET);
		// persist the token as 't' in cookie with expiry date
		res.cookie('t', token, { expire: new Date() + 3600 });
		// return response with user and token to frontend client
		const { _id, email, name } = user;
		return res.json({ token, user: {_id, email, name} });
	});	
}

module.exports.signout = (req, res) => {
	res.clearCookie('t');
	return res.json({
		message: 'Singout success'
	})
}

module.exports.requireSignin = expressJwt({
	// if the token is valid, express jwt appends the verified users id
	// in an auth key to the request object
	secret: process.env.JWT_SECRET,
	userProperty: 'payload'
})

module.exports.forgotPassword = (req, res) => {
	if(!req.body) return res.status(400).json( {error: "No request body"} );
	if(!req.body.email) return res.status(400).json( {error: "No email in request body"});

	console.log("forgot password finding user with that email");
	const email = req.body.email;
	// console.log("signin request.body", email);
	// Find the user based on email
	User.findOne( {email}, (err, user) => {
		if(err || !user) return res.status(401).json( {error: "User with that email  does not exist!"})

		// Generate a token with userid and secret
		const token = jwt.sign(
			{_id: user._id, iss: "NODEAPI"},
			process.env.JWT_SECRET
		);

		// Email data
		const emailData = {
            from: "noreply@node-react.com",
            to: email,
            subject: "Password Reset Instructions",
            text: `Please use the following link to reset your password: ${
                process.env.CLIENT_URL
            }/reset-password/${token}`,
            html: `<p>Please use the following link to reset your password:</p> <p>${
                process.env.CLIENT_URL
            }/reset-password/${token}</p>`
		};
		
		return user.updateOne( {resetPasswordLink: token }, (err, success) => {
			if(err) return res.status(400).json( {error: err} );
			else {
				sendMail(emailData);
				return res.status(200).json(
					{message: `Email has been send to ${email}. Follow the instructions to reset your password.`}
				)
			}
		})


	});
}

module.exports.resetPassword = (req, res) => {
	const { resetPasswordLink, newPassword } = req.body;
	
	User.findOne( {resetPasswordLink }, (err, user) => {
		if(err || !user) {
			return res.status(401).json( {error: "Invalid link!"} );
		}
		const updateFields = {
			password: newPassword,
			resetPasswordLink: ""
		}

		user = _.extend(user, updateFields);
		user.updated = Date.now();

		user.save(  (err, result) => {
			if(err) return res.status(400).json( {error:err} );
			res.json( {message: "Great! Now you can login with your new password."});
		});
	});
}

module.exports.socialLogin = (req, res) => {
	// try finding  user with  req.body.email
	User.findOne( {email: req.body.email} ,(err, user) => {
		if(err || !user) {
			// Create new user and login
			user = new User(req.body);
			req.profile = user;
			user.save();

			// Generate token with userid and secret 
			const token = jwt.sign(
				{_id: user._id, iss: "NODEAPI"},
				process.env.JWT_SECRET
			);
			res.cookie("t", token, {expire: new Date() + 3600});
			// return response with user and token to fronted client
			const { _id, name, email } = user;
			return res.json( {token, user: {_id, name, email}} );
		} else {
			// update existing user with new social info and login
			req.profile = user;
			usre = _.extend(user, req.body);
			user.updated = Date.now();
			user.save();
			const token = jwt.sign(
                { _id: user._id, iss: "NODEAPI" },
                process.env.JWT_SECRET
            );
            res.cookie("t", token, { expire: new Date() + 3600 });
            // return response with user and token to frontend client
            const { _id, name, email } = user;
            return res.json({ token, user: { _id, name, email } });
		}
	});
}