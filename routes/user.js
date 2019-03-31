const express = require('express');
const router = express.Router();
const { userUpdateValidator } = require('../middlewares/index');
const { 
	userById,
	getUsers,
	getUser,
	updateUser,
	deleteUser,
	userPhoto,
	addFollower,
	addFollowing,
	removeFollowing,
	removeFollower,
	findPeople

} = require('../controllers/user');
const { requireSignin } = require('../controllers/auth');

// Đặt những router không có param lên trước, không thì nó sẽ lấy các subpath làm param
router.put('/follow', requireSignin, addFollowing, addFollower);
router.put('/unfollow', requireSignin, removeFollowing, removeFollower);

router.get('/findpeople/:userId', requireSignin, findPeople);


router.get('/', getUsers);
router.get('/:userId', requireSignin, getUser); 		// userId is the param below
router.put('/:userId', requireSignin, updateUser);
router.delete('/:userId', requireSignin, deleteUser);



router.get('/photo/:userId', userPhoto);
// any route containg userId, our app will first execute userById()
router.param('userId', userById)

module.exports = router;
