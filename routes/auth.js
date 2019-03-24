const express = require('express');
const router = express.Router();
const { getUsers, signup, signin, signout} = require('../controllers/auth');
const { userById } = require('../controllers/user');
const { userSignupValidator } = require('../middlewares/index');



router.get('/', getUsers);
router.post('/signup', userSignupValidator, signup);
router.post('/signin', signin);
router.get('/signout', signout);

// any route containg userId, our app will first execute userById()
router.param('userId', userById)

module.exports = router;