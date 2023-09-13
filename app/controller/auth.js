const response = require('../response/index');
const authJwt = require('../middleware');
const httpStatus = require('http-status');
const passwordHash = require('../utils/password');
const helper = require('../utils/helper');
const { User, Session } = require('../model/index');
const commonService = require('../services/common');
const { env } = require('../constant/environment');
const constant = require('../constant/auth');

const accountSID = process.env.accountSID;
const authToken = process.env.authToken;
const client = require('twilio')(accountSID, authToken);
// exports.login = async (req, res) => {
//   try {
//     const user = req.user;
//     if (!req.query.password) return sendResponse(res, false, 'Provide the password', {}, {}, 400);
//     if (user.status === pending) {
//       return sendResponse(res, false, 'Connect with the admin', {}, {}, 400);
//     }
//     if (user.status === blocked) {
//       return sendResponse(res, false, 'You cannot login, your account is blocked', {}, {}, 400);
//     }
//     // console.log(user.phoneNumber);
//     // function sendTextMessages () {
//     //   client.messages.create({
//     //     to: user.phoneNumber,
//     //     from: process.env.twilioNum,
//     //     body: 'Hello from, you are logged in'
//     //   }).then(console.log('message sent successfully'))
//     //     .catch(error => console.log(error));
//     // }
//     // sendTextMessages();
//     const payload = {
//       email: user.email,
//       id: user.id,
//       type: 'login'
//     };
//     const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '24h' });
//     user.session = token;
//     await user.save();
//     return sendResponse(res, true, 'User logged in', user, {}, 200);
//   } catch (error) {
//     return sendResponse(res, false, error.message, {}, error, 500);
//   }
// };
exports.login = async (req, res, next) => {
  try {
    // const { email, deviceId, deviceToken, deviceType } = req.body;
    const { email } = req.body;
    const condition = { email };
    const checkUser = await commonService.getByCondition(User, condition);
    if (!checkUser) {
      return response.error(req, res, { msgCode: 'USER_NOT_FOUND' }, httpStatus.UNAUTHORIZED);
    }
    const isLogin = passwordHash.comparePassword(req.body.password, checkUser.password);
    if (!isLogin) {
      return response.error(req, res, {
        msgCode: 'INVALID_CREDENTIALS'
      }, httpStatus.UNAUTHORIZED);
    }
    // For block user
    if (checkUser.status === constant.userStatus.BLOCK) {
      return response.error({ msgCode: 'BLOCK_MSG' }, res, httpStatus.UNAUTHORIZED);
    }
    // For maximum login limitations

    // const totalLogin = await commonService.count(Session, { auth_id: checkUser.id });
    // if (totalLogin > (env.MAX_LOGIN_DEVICE * 1)) {
    //   return response.error({ msgCode: 'TOTAL_LOGIN' }, res, httpStatus.UNAUTHORIZED);
    // }
    const { password, ...resultData } = checkUser;
    resultData.token = authJwt.generateAuthJwt({
      id: checkUser._id,
      expiresIn: env.TOKEN_EXPIRES_IN,
      email,
      type: constant.TokenType.LOGIN
      // deviceId
    });
    if (!resultData.token) {
      return response.error(req, res, { msgCode: 'SOMETHING_WRONG' }, httpStatus.SOMETHING_WRONG);
    }
    // req.loginData = {
    //   device_details: { deviceId, deviceToken, deviceType },
    //   auth_details: resultData
    // };
    // return next();
    const content = { session: resultData.token };
    await commonService.updateByCondition(User, condition, content);
    const attr = { fullname: 1, session: 1, email: 1 };
    const data = await commonService.getByCondition(User, condition, attr);
    const msgCode = 'LOGIN_SUCCESSFUL';
    function sendTextMessages () {
      client.messages.create({
        to: `+91${checkUser.phoneNumber}`,
        from: process.env.twilioNum,
        body: 'Hello from, you are logged in'
      }).then(console.log('message sent successfully'))
        .catch(error => console.log(error));
    }
    sendTextMessages();
    return response.success(req, res, { msgCode, data }, httpStatus.OK);
  } catch (err) {
    console.log(err);
    return response.error(req, res, { msgCode: 'SOMETHING_WRONG' }, httpStatus.SOMETHING_WRONG);
  }
};

exports.createSession = async (req, res) => {
  try {
    const { deviceId, deviceToken, deviceType } = req.loginData.device_details;
    const condition = { deviceId };

    const checkSession = await commonService.getByCondition(Session, condition);
    if (checkSession) {
      const destroySession = await commonService.removeById(Session, checkSession._id);
      if (!destroySession) {
        return response.error(req, res, { msgCode: helper.getErrorMsgCode(req) }, httpStatus.FORBIDDEN);
      }
    }
    const sessionData = {
      auth_id: req.loginData.auth_details._id,
      deviceId,
      deviceToken,
      deviceType,
      jwt_token: req.loginData.auth_details.token
    };

    console.log('sessionData', sessionData);
    const createSession = await commonService.create(Session, sessionData);
    if (!createSession) {
      return response.error(req, res, { msgCode: helper.getErrorMsgCode(req) }, httpStatus.FORBIDDEN);
    }

    const { ...data } = req.loginData.auth_details;
    const msgCode = 'LOGIN_SUCCESSFUL';
    return response.success(req, res, { msgCode, data }, httpStatus.OK);
  } catch (err) {
    return response.error(req, res, { msgCode: 'SOMETHING_WRONG' }, httpStatus.SOMETHING_WRONG);
  }
};

exports.logout = async (req, res) => {
  try {
    // auth id and device id we get from token
    const condition = {
      auth_id: req.data.id,
      deviceId: req.data.deviceId
    };

    const destroySession = await commonService.deleteByField(Session, condition);
    if (!destroySession) {
      return response.error(req, res, { msgCode: 'USER_NOT_FOUND' }, httpStatus.SOMETHING_WRONG);
    }
    return response.success(req, res, { msgCode: 'LOGOUT_SUCCESSFUL' }, httpStatus.OK);
  } catch (err) {
    return response.error(req, res, { msgCode: 'SOMETHING_WRONG' }, httpStatus.SOMETHING_WRONG);
  }
};

exports.chanegPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const passwordMatches = await passwordHash.comparePassword(currentPassword, req.user.password);
    if (!passwordMatches) {
      return response.error(req, res, { msgCode: 'INVALID_CREDENTIALS' }, httpStatus.UNAUTHORIZED);
    }
    const hashedNewPassword = await passwordHash.generateHash(newPassword);
    const condition = { email: req.jwtData.email };
    const content = { password: hashedNewPassword };
    await commonService.updateByCondition(User, condition, content);
    const msgCode = 'PASSWORD_UPDATE';
    const data = await commonService.getByCondition(User, condition);
    return response.success(req, res, { msgCode, data }, httpStatus.OK);
  } catch (error) {
    return response.error(req, res, { msgCode: 'SOMETHING_WRONG' }, httpStatus.SOMETHING_WRONG);
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const condition = { email };
    const user = req.user;
    const { password, ...resultData } = user;
    resultData.token = authJwt.generateAuthJwt({
      id: user._id,
      expiresIn: env.TOKEN_EXPIRES_IN,
      email,
      otp: env.OTP,
      type: constant.TokenType.FORGET
    });
    if (!resultData.token) {
      return response.error(req, res, { msgCode: 'SOMETHING_WRONG' }, httpStatus.SOMETHING_WRONG);
    }
    const content = { session: resultData.token };
    await commonService.updateByCondition(User, condition, content);
    // const data = await commonService.getByCondition(User, condition);
    const data = {};
    data.token = resultData.token;
    // data.otp = env.OTP;
    const msgCode = 'OTP_SEND';
    return response.success(req, res, { msgCode, data }, httpStatus.OK);
  } catch (error) {
    return response.error(req, res, { msgCode: 'SOMETHING_WRONG' }, httpStatus.SOMETHING_WRONG);
  }
};

exports.verifyForgot = async (req, res) => {
  try {
    const { otp } = req.body;
    const user = req.user;
    const otpMatches = otp === env.OTP;
    if (!otpMatches) {
      return response.error(req, res, { msgCode: 'INVALID_OTP' }, httpStatus.UNAUTHORIZED);
    }
    const token = authJwt.generateAuthJwt({
      id: user._id,
      expiresIn: env.TOKEN_EXPIRES_IN,
      email: user.email,
      type: constant.TokenType.RESET
    });
    if (!token) {
      return response.error(req, res, { msgCode: 'SOMETHING_WRONG' }, httpStatus.SOMETHING_WRONG);
    }
    const content = { session: token };
    const condition = { email: user.email };
    await commonService.updateByCondition(User, condition, content);
    const data = {};
    data.token = token;
    // data.otp = env.OTP;
    const msgCode = 'TOKEN_SENT_SUCCESSFULLY';
    return response.success(req, res, { msgCode, data }, httpStatus.OK);
  } catch (error) {
    return response.error(req, res, { msgCode: 'SOMETHING_WRONG' }, httpStatus.SOMETHING_WRONG);
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const password = req.body.password;
    const hashedNewPassword = await passwordHash.generateHash(password);
    const condition = { email: req.jwtData.email };
    const content = { password: hashedNewPassword, session: '' };
    await commonService.updateByCondition(User, condition, content);
    const msgCode = 'PASSWORD_UPDATED';
    const data = commonService.getByCondition(User, condition);
    return response.success(req, res, { msgCode, data }, httpStatus.OK);
  } catch (error) {
    return response.error(req, res, { msgCode: 'SOMETHING_WRONG' }, httpStatus.SOMETHING_WRONG);
  }
};

exports.logout = async (req, res) => {
  try {
    const user = req.user;
    console.log(user);
    const condition = { _id: user._id, email: user.email };
    const content = { session: '' };
    await commonService.updateByCondition(User, condition, content);
    const data = await commonService.getByCondition(User, condition);
    return response.success(req, res, { msgCode: 'LOGOUT_SUCCESSFUL', data }, httpStatus.OK);
  } catch (error) {
    return response.error(req, res, { msgCode: 'SOMETHING_WRONG' }, httpStatus.SOMETHING_WRONG);
  }
};
