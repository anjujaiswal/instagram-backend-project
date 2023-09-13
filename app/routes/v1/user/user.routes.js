const router = require('express').Router();
const auth = require('../../../controller/auth');
const user = require('../../../controller/user.controller');
const {
  // generateAuthJwt,
  verifyAuthToken,
  isUser,
  // verifyToken,
  // isAdmin,
  // errorHandler,
  reqValidator,
  uploading,
  checkUniqueEmail,
  // checkEmailExists,
  // checkPassword,
  isLoginToken
  // isForgetToken,
  // isResetToken
} = require('../../../middleware');
const schema = require('../../../validation/auth');

// router.post('/login', reqValidator(schema.login), controller.login, controller.createSession);

router.post('/signup', uploading('users', 'profileImage'), reqValidator(schema.userSchema), checkUniqueEmail, user.createUser);
router.patch('/updateUser', uploading('users', 'profileImage'), verifyAuthToken, isUser, user.updateUser);
// router.post('/login', reqValidator(schema.loginSchema), checkEmailExists, checkPassword, isUser, auth.login);
router.patch('/change-password', reqValidator(schema.passwordSchema), verifyAuthToken, isLoginToken, isUser, auth.chanegPassword);
// router.patch('/forget-password', reqValidator(schema.forgotPasswordSchema), checkEmailExists, isUser, auth.forgotPassword);
// router.patch('/verify-forgot', verifyAuthToken, isForgetToken, isUser, auth.verifyForgot);
// router.patch('/reset-password', reqValidator(schema.resetPasswordSchema), verifyAuthToken, isResetToken, isUser, auth.resetPassword);
router.post('/createPost', uploading('posts', 'image'), reqValidator(schema.postSchema), verifyAuthToken, user.createPost);
router.get('/allPosts', verifyAuthToken, isUser, user.findAllPosts);
router.patch('/deletePost', verifyAuthToken, isUser, user.deleteOnePost);
router.patch('/updatePost', uploading('posts', 'image'), verifyAuthToken, isUser, user.updatePost);

router.post('/createConnection', verifyAuthToken, isUser, user.createConnection);
router.get('/getFollowers', verifyAuthToken, isUser, user.getFollowers);
router.get('/getFollowings', verifyAuthToken, isUser, user.getFollowings);
router.get('/getPosts', verifyAuthToken, isUser, user.getPosts);
router.get('/gfp', verifyAuthToken, isUser, user.getFollowingsPosts);
module.exports = router;
