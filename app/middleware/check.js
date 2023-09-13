// const jwt = require('jsonwebtoken');
const response = require('../response/index');
const httpStatus = require('http-status');
const commonService = require('../services/common');
const model = require('../model/index');
const bcrypt = require('bcryptjs');
// const { env } = require('../constant/environment');
// const constant = require('../constant/auth');
const fs = require('fs');
const checkUniqueEmail = async (req, res, next) => {
  try {
    const User = model.User;
    const condition = { email: req.body.email };
    const existingUser = await commonService.getByCondition(User, condition);
    if (existingUser) {
      if (req.file) { fs.unlinkSync(req.file.path); }
      return response.error(req, res, { msgCode: 'ALREADY_REGISTERED' }, httpStatus.ALREADY_REPORTED);
    }
    return next();
  } catch (error) {
    fs.unlinkSync(req.file.path);
    return response.error(req, res, { msgCode: 'SOMETHING_WRONG' }, httpStatus.SOMETHING_WRONG);
  }
};
const checkEmailExists = async (req, res, next) => {
  try {
    const User = model.User;
    const condition = { email: req.body.email };
    const existingUser = await commonService.getByCondition(User, condition);
    if (!existingUser) {
      return response.error(req, res, { msgCode: 'USER_NOT_FOUND' }, httpStatus.NOT_FOUND);
    }
    req.user = existingUser;
    req.session = existingUser.session;
    req.data = existingUser;
    return next();
  } catch (error) {
    if (req.file) fs.unlink(req.file.path);
    return response.error(req, res, { msgCode: 'SOMETHING_WRONG' }, httpStatus.SOMETHING_WRONG);
  }
};

const checkPassword = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const User = model.User;
    const condition = { email };
    const existingUser = await commonService.getByCondition(User, condition);
    const isPasswordValid = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordValid) {
      return response.error(req, res, { msgCode: 'WRONG_PASS' }, httpStatus.UNAUTHORIZED);
    }
    return next();
  } catch (error) {
    if (req.file) fs.unlink(req.file.path);
    return response.error(req, res, { msgCode: 'SOMETHING_WRONG' }, httpStatus.SOMETHING_WRONG);
  }
};

module.exports = {
  checkUniqueEmail,
  checkEmailExists,
  checkPassword
};
