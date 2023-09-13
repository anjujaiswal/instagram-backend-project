const response = require('../response/index');
// const authJwt = require('../middleware');
const httpStatus = require('http-status');
const passwordHash = require('../utils/password');
const helper = require('../utils/helper');
const { User, Post } = require('../model/index');
const commonService = require('../services/common');
const fs = require('fs');
const constant = require('../constant/auth');

exports.userLists = async (req, res) => {
  try {
    const status = req.query.status || constant.userStatus.PENDING;
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const filter = req.query.filter || '';
    const query = {
      status,
      userType: constant.userType.USER
    };
    if (search) {
      if (filter === 'fullname') {
        query.fullname = { $regex: `.*${search}.*`, $options: 'i' };
      } else if (filter === 'email') {
        query.email = { $regex: `.*${search}.*`, $options: 'i' };
      } else {
        query.$or = [
          { fullname: { $regex: `.*${search}.*`, $options: 'i' } },
          { email: { $regex: `.*${search}.*`, $options: 'i' } }
        ];
      }
    }
    const data = await User.find(query)
      .select('id fullname email profileImage status')
      .skip(page * limit)
      .limit(parseInt(limit));
    const msgCode = 'DETAILS';
    return response.success(req, res, { msgCode, data }, httpStatus.OK);
  } catch (err) {
    console.log(err);
    return response.error(req, res, { msgCode: 'SOMETHING_WRONG' }, httpStatus.SOMETHING_WRONG);
  }
};

exports.changeUserStatus = async (req, res) => {
  try {
    const status = req.query.status;
    if (status === constant.userStatus.PENDING) return response.error(req, res, { msgCode: 'CANT CHANGE TO PENDING' }, httpStatus.BAD_REQUEST);
    const _id = req.query.id;
    const condition = { _id };
    const user = await commonService.getByCondition(User, condition);
    if (!user) {
      return response.error(req, res, { msgCode: 'USER_NOT_FOUND' }, httpStatus.BAD_REQUEST);
    }
    const content = { status };
    await commonService.updateByCondition(User, condition, content);
    const msgCode = 'S_UPDATE';
    const data = await commonService.getByCondition(User, condition);
    return response.success(req, res, { msgCode, data }, httpStatus.OK);
  } catch (err) {
    console.log(err);
    return response.error(req, res, { msgCode: 'SOMETHING_WRONG' }, httpStatus.SOMETHING_WRONG);
  }
};

exports.changePostStatus = async (req, res) => {
  try {
    const status = req.query.status;
    const _id = req.query.id;
    const condition = { _id };
    const post = await commonService.getByCondition(Post, condition);
    if (!post) {
      return response.error(req, res, { msgCode: 'POST_NOT_FOUND' }, httpStatus.BAD_REQUEST);
    }
    const content = { status };
    await commonService.updateByCondition(Post, condition, content);
    const msgCode = 'S_UPDATE';
    const data = await commonService.getByCondition(Post, condition);
    return response.success(req, res, { msgCode, data }, httpStatus.OK);
  } catch (err) {
    console.log(err);
    return response.error(req, res, { msgCode: 'SOMETHING_WRONG' }, httpStatus.SOMETHING_WRONG);
  }
};

// exports.userPostLists = async (req, res) => {
//   try {
//     const id = req.query.id;
//     if (!id) return response.error(req, res, { msgCode: 'MISSING_P' }, httpStatus.UNAUTHORIZED);
//     const page = parseInt(req.query.page) - 1 || 0;
//     const limit = parseInt(req.query.limit) || 10;
//     const search = req.query.search || '';
//     const status = req.query.status || constant.statusType.ACTIVE;
//     const order = req.query.order || -1;
//     const sort = req.query.sort || 'createdAt';
//     const condition = { userId: id, status, title: { $regex: `.*${search}.*`, $options: 'i' } };
//     const data = await Post.find(Post, condition)
//       .sort({ [sort]: order }) // Sort by the specified field in descending order
//       .skip(limit * page)
//       .limit(parseInt(limit));
//     return response.success(req, res, { msgCode: 'DETAILS', data }, httpStatus.OK);
//   } catch (err) {
//     return response.error(req, res, { msgCode: 'SOMETHING_WRONG' }, httpStatus.SOMETHING_WRONG);
//   }
// };
