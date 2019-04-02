const express = require('express');
const router = express.Router();
const {
    getUsers,
    signup,
    signin,
    signout,
    forgotPassword,
    resetPassword,
    socialLogin
} = require('../controllers/auth');
const { userById } = require('../controllers/user');
const { userSignupValidator, passwordResetValidator } = require('../middlewares/index');



router.get('/', getUsers);
router.post('/signup', userSignupValidator, signup);
router.post('/signin', signin);
router.get('/signout', signout);
router.post('/social-login', socialLogin);

router.put('/forgot-password', forgotPassword);
router.put('/reset-password', passwordResetValidator, resetPassword);

// any route containg userId, our app will first execute userById()
router.param('userId', userById)

module.exports = router;