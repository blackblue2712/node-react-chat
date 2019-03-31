module.exports.createPostValidator = (req, res, next) => {
	// Title
	req.check('title', 'Title is requried').notEmpty();
	req.check('title', 'Title must be between 4 to 150 characters').isLength({
		min: 4,
		max: 150
	});

	// Body
	req.check('body', 'Body is requried').notEmpty();
	req.check('body', 'Body must be between 4 to 2000 characters').isLength({
		min: 4,
		max: 2000
	});

	// Check for errors
	const errors = req.validationErrors();
 	// If error show the first one as they happend
 	if (errors) {
 		const firstError = errors.map( err => err.msg)[0];
 		return res.status(400).json({
 			error: firstError 
 		});
 	}

 	// process to next middleware
 	next();
}
module.exports.userSignupValidator = (req, res, next) => {
	req.check('name', 'Name is required').notEmpty();
	req.check('email', 'Email is requried').notEmpty();
	req.check('email')
	   .matches(/.+\@.+\..+/)
	   .withMessage('Invalid email')
	   .isLength( {min: 4, max: 32})
	   .withMessage('Email must between 4 to 32 characters');

	// check for password
	req.check('password', 'Password is required').notEmpty();
	req.check('password')
	.isLength({min: 6})
	.withMessage('Password must contain at least 6 characters')
	.matches(/\d/)
	.withMessage('Password must has a number');

	// Check for errors
	const errors = req.validationErrors();
 	// If error show the first one as they happend
 	if (errors) {
 		const firstError = errors.map( err => err.msg)[0];
 		return res.status(400).json({
 			error: firstError 
 		});
 	}

 	// process to next middleware
 	next();
}

module.exports.userUpdateValidator = (req, res, next) => {
	req.check('name', 'Name is required').notEmpty();
	req.check('email', 'Email is requried').notEmpty();
	req.check('email')
	   .matches(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)
	   .withMessage('Invalid email')
	   .isLength( {min: 4, max: 32})
	   .withMessage('Email must between 4 to 32 characters');

	// Check for errors
	const errors = req.validationErrors();
 	// If error show the first one as they happend
 	if (errors) {
 		const firstError = errors.map( err => err.msg)[0];
 		return res.status(400).json({
 			error: firstError 
 		});
 	}

 	// process to next middleware
 	next();
}