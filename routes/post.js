const express = require("express");

const {
    getPosts,
    createPost,
    postByUser,
    postById,
    isPoster,
    deletePost,
    updatePost
} = require('../controllers/post');
const { createPostValidator } = require('../middlewares/index');
const { requireSignin } = require('../controllers/auth');
const { userById } = require('../controllers/user');
const router = express.Router();


router.get('/posts', getPosts);
router.post('/post/new/:userId', requireSignin, createPost, createPostValidator);
router.get('/post/by/:userId', requireSignin, postByUser);
router.delete('/post/:postId', requireSignin, isPoster, deletePost);
router.put('/post/:postId', requireSignin, isPoster, updatePost);

// any route containg userId, our app will first execute userById()
router.param('userId', userById);
// any route containg userId, our app will first execute postById()
router.param('postId', postById);
module.exports = router;