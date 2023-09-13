const router = require('express').Router();
const auth = require('../../../controller/auth');
const admin = require('../../../controller/admin.controller');
const user = require('../../../controller/user.controller');
const {
  verifyAuthToken,
  isAdmin,
  reqValidator,
  // checkUniqueEmail,
  // checkEmailExists,
  // checkPassword,
  isLoginToken,
  // isForgetToken,
  // isResetToken
} = require('../../../middleware');
const schema = require('../../../validation/auth');

// router.post('/login', reqValidator(schema.login), controller.login, controller.createSession);

// router.post('/signup', uploading('users', 'profileImage'), reqValidator(schema.userSchema), checkUniqueEmail, admin.createUser);
// router.post('/login', reqValidator(schema.loginSchema), checkEmailExists, checkPassword, isAdmin, auth.login);
router.patch('/change-password', reqValidator(schema.passwordSchema), verifyAuthToken, isLoginToken, isAdmin, auth.chanegPassword);
// router.patch('/forget-password', reqValidator(schema.forgotPasswordSchema), checkEmailExists, isAdmin, auth.forgotPassword);
// router.patch('/verify-forgot', verifyAuthToken, isForgetToken, isAdmin, auth.verifyForgot);
// router.patch('/reset-password', reqValidator(schema.resetPasswordSchema), verifyAuthToken, isResetToken, isAdmin, auth.resetPassword);
router.patch('/change-status', verifyAuthToken, isAdmin, admin.changeUserStatus);

router.get('/userLists', verifyAuthToken, isAdmin, admin.userLists);
router.get('/getFollowers', verifyAuthToken, isAdmin, user.getFollowers);
router.get('/getFollowings', verifyAuthToken, isAdmin, user.getFollowings);
router.get('/getPosts', verifyAuthToken, isAdmin, user.getPosts);
router.patch('/changePostStatus', verifyAuthToken, isAdmin, admin.changePostStatus);
router.get('/userPosts', verifyAuthToken, isAdmin, user.findAllPosts);
module.exports = router;
