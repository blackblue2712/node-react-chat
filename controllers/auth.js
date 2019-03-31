const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const User = require("../models/user");
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
	User.findOne({email: email}, (err, user) => {
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
		const token = jwt.sign({'_id': user._id}, process.env.JWT_SECRECT);
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
	secret: process.env.JWT_SECRECT,
	userProperty: 'payload'
})
