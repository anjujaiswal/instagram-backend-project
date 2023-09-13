const router = require('express').Router();
// const auth = require('../../../controller/auth');
const {
  // generateAuthJwt,
  verifyAuthToken,
  isUser,
  // verifyToken,
  isAdmin,
  // errorHandler,
  reqValidator,
  // uploading,
  // checkUniqueEmail,
  checkEmailExists,
  checkPassword,
  // isLoginToken,
  isForgetToken,
  isResetToken
} = require('../../../middleware');
const schema = require('../../../validation/auth');
const controller = require('../../../controller/auth');
// const user = require('../../../controller/user.controller');

// router.post('/login', reqValidator(schema.login), controller.login, controller.createSession);
router.post('/user/login', reqValidator(schema.loginSchema), checkEmailExists, checkPassword, isUser, controller.login);
router.post('/admin/login', reqValidator(schema.loginSchema), checkEmailExists, checkPassword, isAdmin, controller.login);
router.patch('/user/forget-password', reqValidator(schema.forgotPasswordSchema), checkEmailExists, isUser, controller.forgotPassword);
router.patch('/admin/forget-password', reqValidator(schema.forgotPasswordSchema), checkEmailExists, isAdmin, controller.forgotPassword);
router.patch('/admin/verify-forgot', verifyAuthToken, isForgetToken, isAdmin, controller.verifyForgot);
router.patch('/admin/reset-password', reqValidator(schema.resetPasswordSchema), verifyAuthToken, isResetToken, isUser, controller.resetPassword);
router.patch('/user/verify-forgot', verifyAuthToken, isForgetToken, isAdmin, controller.verifyForgot);
router.patch('/user/reset-password', reqValidator(schema.resetPasswordSchema), verifyAuthToken, isResetToken, isUser, controller.resetPassword);

router.patch('/user/logout', verifyAuthToken, isUser, controller.logout);
router.patch('/admin/logout', verifyAuthToken, isAdmin, controller.logout);

module.exports = router;
