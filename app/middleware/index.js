const errorHandler = require('./error-handler');
const { generateAuthJwt, verifyAuthToken, isUser, verifyToken, isAdmin, isLoginToken, isForgetToken, isResetToken } = require('./auth');
const { reqValidator } = require('./request-validator');
const uploading = require('./multer');
const { checkUniqueEmail, checkEmailExists, checkPassword } = require('./check');

module.exports = {
  generateAuthJwt,
  verifyAuthToken,
  isUser,
  verifyToken,
  isAdmin,
  errorHandler,
  reqValidator,
  uploading,
  checkUniqueEmail,
  checkEmailExists,
  checkPassword,
  isLoginToken,
  isForgetToken,
  isResetToken
};
