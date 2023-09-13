const jwt = require('jsonwebtoken');
const response = require('../response/index');
const httpStatus = require('http-status');
const commonService = require('../services/common');
const model = require('../model/index');
const { env } = require('../constant/environment');
const constant = require('../constant/auth');
const fs = require('fs');
// This function is used for validate API key

exports.verifyApiKey = (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
      return response.error(req, res, { msgCode: 'MISSING_API_KEY' }, httpStatus.UNAUTHORIZED);
    }

    if (apiKey !== env.API_KEY) {
      return response.error(req, res, { msgCode: 'INVALID_API_KEY' }, httpStatus.UNAUTHORIZED);
    }
    return next();
  } catch (error) {
    return response.error(req, res, { msgCode: 'SOMETHING_WRONG' }, httpStatus.SOMETHING_WRONG);
  }
};

// This function is used for generate jwt token

exports.generateAuthJwt = (payload) => {
  const { expiresIn, ...params } = payload;
  const token = jwt.sign(params, env.SECRET_KEY, { expiresIn });
  if (!token) {
    return false;
  }
  return token;
};

exports.verifyAuthToken = (req, res, next) => {
  try {
    let token = req.headers.authorization;
    if (!token) {
      return response.error(req, res, { msgCode: 'MISSING_TOKEN' }, httpStatus.UNAUTHORIZED);
    }
    token = token.replace(/^Bearer\s+/, '');

    jwt.verify(token, env.SECRET_KEY, async (error, decoded) => {
      if (error) {
        let msgCode = 'INVALID_TOKEN';
        if (error.message === constant.errorMsg.EXPIRED) {
          msgCode = 'TOKEN_EXPIRED';
        }
        return response.error(req, res, { msgCode }, httpStatus);
      }
      // const sessionModel = model.Session;
      // const condition = { jwt: token };
      const User = model.User;
      const condition = { _id: decoded.id, email: decoded.email };
      const user = await commonService.getByCondition(User, condition);
      if (!user) {
        if (req.file)fs.unlink(req.file.path);
        return response.error(req, res, { msgCode: 'USER_NOT_FOUND' }, httpStatus.NOT_FOUND);
      }
      // console.log(user.session===token)
      if (user.session !== token) {
        if (req.file) fs.unlinkSync(req.file.path);
        return response.error(req, res, { msgCode: 'SESSION_EXPIRED' }, httpStatus.UNAUTHORIZED);
      }
      req.user = user; // Attach user data to the request
      req.userId = decoded.id;
      req.id = decoded.id;
      req.jwtData = decoded;
      return next();
      // if (!checkJwt) {
      //   return response.error(req, res, { msgCode: 'INVALID_TOKEN' }, httpStatus.UNAUTHORIZED);
      // } else {
      //   req.data = decoded;
      //   return next();
      // }
    });
  } catch (err) {
    console.log(err);
    return response.error(req, res, { msgCode: 'SOMETHING_WRONG' }, httpStatus.SOMETHING_WRONG);
  }
};
exports.isLoginToken = async (req, res, next) => {
  try {
    // console.log(req.data)
    if (req.jwtData.type !== constant.TokenType.LOGIN) {
      return response.error(req, res, { msgCode: 'NOT_LOGIN_TOKEN' }, httpStatus.UNAUTHORIZED);
    }
    return next();
  } catch (err) {
    console.log(err);
    return response.error(req, res, { msgCode: 'SOMETHING_WRONG' }, httpStatus.SOMETHING_WRONG);
  }
};
exports.isForgetToken = async (req, res, next) => {
  try {
    // console.log(req.data)
    if (req.jwtData.type !== constant.TokenType.FORGET) {
      return response.error(req, res, { msgCode: 'NOT_FORGET_TOKEN' }, httpStatus.UNAUTHORIZED);
    }
    return next();
  } catch (err) {
    console.log(err);
    return response.error(req, res, { msgCode: 'SOMETHING_WRONG' }, httpStatus.SOMETHING_WRONG);
  }
};

exports.isResetToken = async (req, res, next) => {
  try {
    // console.log(req.data)
    // data-decoded
    if (req.jwtData.type !== constant.TokenType.RESET) {
      return response.error(req, res, { msgCode: 'NOT_RESET_TOKEN' }, httpStatus.UNAUTHORIZED);
    }
    return next();
  } catch (err) {
    console.log(err);
    return response.error(req, res, { msgCode: 'SOMETHING_WRONG' }, httpStatus.SOMETHING_WRONG);
  }
};

// function to verify user type you can change it

exports.isUser = (req, res, next) => {
  try {
    // const jwtData = req.data;
    const user = req.user;
    // console.log(jwtData);
    // console.log(req.user);
    if (user.userType !== constant.userType.USER) {
      return response.success(req, res, { msgCode: 'PORTAL_NOT_FOR_ADMIN' }, httpStatus.UNAUTHORIZED);
    }
    if (user.status === constant.userStatus.PENDING || user.status === constant.userStatus.INACTIVE || user.status === constant.userStatus.BLOCK) {
      return response.success(req, res, { msgCode: 'CONNECT_WITH_ADMIN' }, httpStatus.UNAUTHORIZED);
    }
    return next();
  } catch (err) {
    return response.error(req, res, { msgCode: 'SOMETHING_WRONG' }, httpStatus.SOMETHING_WRONG);
  }
};

exports.isAdmin = (req, res, next) => {
  try {
    // check role
    // const jwtData = req.data;
    const user = req.user;
    // console.log(jwtData);
    // console.log(req.user);
    if (user.userType !== constant.userType.ADMIN) {
      return response.success(req, res, { msgCode: 'PORTAL_NOT_FOR_USER' }, httpStatus.UNAUTHORIZED);
    }
    if (user.status === constant.userStatus.PENDING || user.status === constant.userStatus.INACTIVE || user.status === constant.userStatus.BLOCK) {
      return response.success(req, res, { msgCode: 'CONNECT_WITH_ADMIN' }, httpStatus.UNAUTHORIZED);
    }
    // req.jwtData = jwtData;
    return next();
  } catch (err) {
    return response.error(req, res, { msgCode: 'SOMETHING_WRONG' }, httpStatus.SOMETHING_WRONG);
  }
};

exports.verifyToken = (req, res, next) => {
  try {
    const token = req.headers.token;
    if (!token) {
      return response.error(req, res, { msgCode: 'MISSING_TOKEN' }, httpStatus.UNAUTHORIZED);
    }
    jwt.verify(token, env.SECRET_KEY, async (error, decoded) => {
      console.log(error);
      if (error) {
        let msgCode = 'INVALID_TOKEN';
        if (error.message === constant.error_msg.EXPIRED) {
          msgCode = 'TOKEN_EXPIRED';
        }
        return response.error(req, res, { msgCode }, httpStatus.UNAUTHORIZED);
      }
      req.token = decoded;
      return next();
    });
  } catch (err) {
    return response.error(req, res, { msgCode: 'SOMETHING_WRONG' }, httpStatus.SOMETHING_WRONG);
  }
};
