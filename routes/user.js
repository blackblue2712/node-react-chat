const express = require('express');
const router = express.Router();
const { 
	userById,
	getUsers,
	getUser,
	updateUser,
	deleteUser
} = require('../controllers/user');
const { requireSignin } = require('../controllers/auth');

router.get('/', getUsers);
router.get('/:userId', requireSignin, getUser); 		// userId is the param below
router.put('/:userId', requireSignin, updateUser);
router.delete('/:userId', requireSignin, deleteUser);
// any route containg userId, our app will first execute userById()
router.param('userId', userById)

module.exports = router;