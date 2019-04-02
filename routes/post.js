const express = require("express");

const {
    getPosts,
    createPost,
    postByUser,
    postById,
    isPoster,
    deletePost,
    updatePost,
    postPhoto,
    singlePost,
    like,
    unlike,
    comment,
    uncomment
} = require('../controllers/post');
const { createPostValidator } = require('../middlewares/index');
const { requireSignin } = require('../controllers/auth');
const { userById } = require('../controllers/user');
const router = express.Router();


router.get('/posts', getPosts);

// Like and unlike
router.put('/post/like', requireSignin, like);
router.put('/post/unlike', requireSignin, unlike);

// Comment and uncomment
router.put('/post/comment', requireSignin, comment);
router.put('/post/uncomment', requireSignin, uncomment);

router.post('/post/new/:userId', requireSignin, createPost, createPostValidator);
router.get('/post/by/:userId', requireSignin, postByUser);
router.get('/post/:postId', singlePost);
router.put('/post/:postId', requireSignin, isPoster, updatePost);
router.delete('/post/:postId', requireSignin, isPoster, deletePost);

router.get('/posts/:userId', requireSignin, postByUser);







// get post photo
router.get('/post/photo/:postId', postPhoto);

// any route containg userId, our app will first execute userById()
router.param('userId', userById);
// any route containg userId, our app will first execute postById()
router.param('postId', postById);
module.exports = router;