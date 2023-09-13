const response = require('../response/index');
// const authJwt = require('../middleware');
const httpStatus = require('http-status');
const passwordHash = require('../utils/password');
const helper = require('../utils/helper');
const { User, Post, Follow } = require('../model/index');
const commonService = require('../services/common');
const constant = require('./../constant/auth');
const fs = require('fs');
// const { env } = require('../constant/environment');
// const bcrypt = require('bcryptjs');

exports.createUser = async (req, res) => {
  try {
    // const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const hashedPassword = await passwordHash.generateHash(req.body.password);
    const userData = {
      fullname: req.body.fullname,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
      password: hashedPassword
    };
    if (req.file) {
      userData.profileImage = req.file.filename;
    }
    const createUser = await commonService.create(User, userData);
    if (!createUser) {
      return response.error(req, res, { msgCode: helper.getErrorMsgCode(req) }, httpStatus.FORBIDDEN);
    }
    const data = createUser;
    // const data = userData;
    const msgCode = 'SIGNUP_SUCCESSFUL';
    return response.success(req, res, { msgCode, data }, httpStatus.OK);
  } catch (err) {
    if (req.file) fs.unlinkSync(req.file.path);
    return response.error(req, res, { msgCode: 'SOMETHING_WRONG' }, httpStatus.SOMETHING_WRONG);
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = req.user;
    if (!user._id) return response.error(req, res, { msgCode: 'MISSING_P' }, httpStatus.UNAUTHORIZED);
    const content = req.body;
    if (req.file) {
      if (user.profileImage) {
        const previousImagePath = `upload/users/${user.profileImage}`;
        if (fs.existsSync(previousImagePath)) {
          fs.unlinkSync(previousImagePath);
        }
      }
      content.profileImage = req.file.filename;
    }
    const condition = { _id: user._id };
    await commonService.updateByCondition(User, condition, content);
    const data = await commonService.getByCondition(User, condition, { _id: 1, fullname: 1, email: 1, profileImage: 1 });
    return response.success(req, res, { msgCode: 'P_UPDATE', data }, httpStatus.OK);
  } catch (err) {
    if (req.file) fs.unlinkSync(req.file.path);
    return response.error(req, res, { msgCode: 'SOMETHING_WRONG' }, httpStatus.SOMETHING_WRONG);
  }
};
exports.createPost = async (req, res) => {
  try {
    // Create the post and associate it with the authenticated user's ID
    const { userId } = req;
    const postData = {
      title: req.body.title,
      userId: req.userId
    };
    // console.log(req.file, "===")
    if (req.file) {
      postData.image = req.file?.filename;
    }
    const lastPost = await Post.findOne({ userId })
      .select('createdAt')
      .sort({ createdAt: -1 })
      .limit(1);
    if (lastPost) {
      const currentTime = new Date();
      const lastPostTime = new Date(lastPost.createdAt);
      const timeDifferenceMinutes = (currentTime - lastPostTime) / (1000 * 60);
      if (timeDifferenceMinutes < 10) {
        const remainingMinutes = 10 - timeDifferenceMinutes;
        if (req.file)fs.unlinkSync(req.file.path);
        const data = `${remainingMinutes} left to post another post`;
        return response.error(req, res, { msgCode: 'C_POST', data }, httpStatus.BAD_REQUEST);
      }
    }
    await commonService.create(Post, postData);
    const data = postData;
    return response.success(req, res, { msgCode: 'P_SUCCESS', data }, httpStatus.CREATED);
  } catch (err) {
    if (req.file) fs.unlinkSync(req.file.path);
    return response.error(req, res, { msgCode: 'SOMETHING_WRONG' }, httpStatus.SOMETHING_WRONG);
  }
};

exports.updatePost = async (req, res) => {
  try {
    const user = req.user;
    // const id = req.params.id;
    const id = req.query.id;
    if (!id) {
      if (req.file) fs.unlinkSync(req.file.path);
      return response.error(req, res, { msgCode: 'MISSING_P' }, httpStatus.UNAUTHORIZED);
    }
    const content = req.body;
    const condition = { _id: id };
    const post = await commonService.getByCondition(Post, condition);
    if (!post) {
      if (req.file) fs.unlinkSync(req.file.path);
      return response.error(req, res, { msgCode: 'POST_NOT_FOUND' }, httpStatus.BAD_REQUEST);
    }
    if (req.file) {
      if (post.image) {
        const previousImagePath = `upload/posts/${post.image}`;
        if (fs.existsSync(previousImagePath)) {
          fs.unlinkSync(previousImagePath);
        }
      }
      content.image = req.file.filename;
    }
    if (!user._id.equals(post.userId)) {
      if (req.file) fs.unlinkSync(req.file.path);
      return response.error(req, res, { msgCode: 'CANT_UPDATE_OTHER_POSTS' }, httpStatus.BAD_REQUEST);
    }
    await commonService.updateByCondition(Post, condition, content);
    const data = await commonService.getByCondition(Post, condition);
    return response.success(req, res, { msgCode: 'P_UPDATE', data }, httpStatus.OK);
  } catch (err) {
    if (req.file) fs.unlinkSync(req.file.path);
    return response.error(req, res, { msgCode: 'SOMETHING_WRONG' }, httpStatus.SOMETHING_WRONG);
  }
};
exports.findAllPosts = async (req, res) => {
  try {
    const user = req.user;
    const userId = req.query.id || user._id;
    if (!userId) return response.error(req, res, { msgCode: 'MISSING_P' }, httpStatus.UNAUTHORIZED);
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    // const filter = req.query.filter || 'title';\
    const order = req.query.order || -1;
    const sort = req.query.sort || 'createdAt';
    const status = req.query.status || constant.userStatus.ACTIVE;
    const query = {
      userId,
      status,
      title: { $regex: `.*${search}.*`, $options: 'i' } // Case-insensitive search
    };
    const data = await Post.find(query)
      .sort({ [sort]: order }) // Sort by the specified field in descending order
      .skip(limit * page)
      .limit(parseInt(limit));
    return response.success(req, res, { msgCode: 'DETAILS', data }, httpStatus.OK);
  } catch (err) {
    return response.error(req, res, { msgCode: 'SOMETHING_WRONG' }, httpStatus.SOMETHING_WRONG);
  }
};
exports.deleteOnePost = async (req, res) => {
  try {
    const id = req.query.id;
    if (!id) return response.error(req, res, { msgCode: 'P_ID' }, httpStatus.BAD_REQUEST);
    const condition = { _id: id };
    const content = { status: constant.statusType.INACTIVE };
    const data = await commonService.getByCondition(Post, condition);
    if (!data) {
      return response.error(req, res, { msgCode: 'UPDATE_ERROR', data }, httpStatus.SOMETHING_WRONG);
    }
    if (!req.user._id.equals(data.userId)) {
      return response.error(req, res, { msgCode: 'P_DELETE_OF_ANOTHER', data }, httpStatus.SOMETHING_WRONG);
    }
    await commonService.updateByCondition(Post, condition, content);
    if (data.image) fs.unlinkSync(`upload/posts/${data.image}`);
    return response.success(req, res, { msgCode: 'DELETED', data }, httpStatus.OK);
  } catch (err) {
    return response.error(req, res, { msgCode: 'SOMETHING_WRONG' }, httpStatus.SOMETHING_WRONG);
  }
};

exports.createConnection = async (req, res) => {
  try {
    const user = req.user;
    const follow = req.body.follow;
    if (!follow) return response.error(req, res, { msgCode: 'BODY_MISSING' }, httpStatus.BAD_REQUEST);
    if (user._id.equals(follow)) return response.error(req, res, { msgCode: 'USER CANT FOLLOW' }, httpStatus.BAD_REQUEST);
    const condition = { userId: follow, followedBy: user._id };
    const connection = await commonService.getByCondition(Follow, condition);
    if (connection) {
      const data = await Follow.deleteOne({ userId: follow, followedBy: user._id });
      // const data = await commonService.deleteByCondition(Follow, condition);
      return response.success(req, res, { msgCode: 'USER_UNFOLLOW', data }, httpStatus.OK);
    }
    const data = await commonService.create(Follow, condition);
    return response.success(req, res, { msgCode: 'USER_FOLLOW', data }, httpStatus.OK);
  } catch (err) {
    return response.error(req, res, { msgCode: 'SOMETHING_WRONG' }, httpStatus.SOMETHING_WRONG);
  }
};

exports.getFollowers = async (req, res) => {
  try {
    const user = req.user;
    const id = req.query.id || user._id;
    // console.log(id);
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const filter = req.query.filter || '';
    const sort = req.query.sort || 'fullname';
    const order = parseInt(req.query.order) || -1;
    const users = await Follow.find({ userId: id }).distinct('followedBy');
    // const condition = { _id: { $in: users } };
    const condition = {};
    const attr = { fullname: 1, email: 1, _id: 1 };
    if (search) {
      if (filter === 'fullname') {
        condition['users.fullname'] = { $regex: `.*${search}.*`, $options: 'i' };
      } else if (filter === 'email') {
        condition['users.email'] = { $regex: `.*${search}.*`, $options: 'i' };
      } else {
        condition.$or = [
          { 'users.fullname': { $regex: `.*${search}.*`, $options: 'i' } },
          { 'users.email': { $regex: `.*${search}.*`, $options: 'i' } }
        ];
      }
    }
    // const data = await User.find(condition, attr)
    //   .sort({ [sort]: order })
    //   .skip(limit * page)
    //   .limit(parseInt(limit));
    const data = await Follow.aggregate([{ $match: { userId: id } },
      {
        $lookup:
        {
          from: 'users',
          //  let: { <var_1>: <expression>, …, <var_n>: <expression> },
          localField: 'followedBy',
          foreignField: '_id',
          pipeline: [{ $project: attr }
            // { $match: condition }
          ],
          as: 'users'
        }
      },
      { $project: { userId: 1, followedBy: 1, users: 1} },
      { $match: condition },
      { $sort: { [`users.${sort}`]: order } }
    ])
    // sort({ [sort]: order })
      .skip(limit * page)
      .limit(parseInt(limit));

    return response.success(req, res, { msgCode: 'DETAILS', data }, httpStatus.OK);
  } catch (err) {
    return response.error(req, res, { msgCode: 'SOMETHING_WRONG' }, httpStatus.SOMETHING_WRONG);
  }
};
exports.getFollowings = async (req, res) => {
  try {
    const user = req.user;
    const id = req.query.id || user._id;
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const filter = req.query.filter || '';
    const sort = req.query.sort || 'fullname';
    const order = parseInt(req.query.order) || -1;
    const users = await Follow.find({ followedBy: id }).distinct('userId');
    const condition = { _id: { $in: users } };
    const attr = { fullname: 1, email: 1, _id: 1 };
    if (search) {
      if (filter === 'fullname') {
        condition.fullname = { $regex: `.*${search}.*`, $options: 'i' };
      } else if (filter === 'email') {
        condition.email = { $regex: `.*${search}.*`, $options: 'i' };
      } else {
        condition.$or = [
          { fullname: { $regex: `.*${search}.*`, $options: 'i' } },
          { email: { $regex: `.*${search}.*`, $options: 'i' } }
        ];
      }
    }
    const data = await User.find(condition, attr)
      .sort({ [sort]: order })
      .skip(limit * page)
      .limit(parseInt(limit));
    return response.success(req, res, { msgCode: 'DETAILS', data }, httpStatus.OK);
  } catch (err) {
    return response.error(req, res, { msgCode: 'SOMETHING_WRONG' }, httpStatus.SOMETHING_WRONG);
  }
};

exports.getFollowingsPosts = async (req, res) => {
  try {
    const user = req.user;
    const id = req.query.id || user._id;
    const search = req.query.search || '';
    const sort = req.query.sort || 'createdAt';
    const order = parseInt(req.query.order) || -1;
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit) || 10;
    const followingsIdList = await Follow.find({ followedBy: id }).distinct('userId');
    const condition = { userId: { $in: followingsIdList }, status: constant.statusType.ACTIVE };
    if (search) {
      condition.title = { $regex: `.*${search}.*`, $options: 'i' };
    }
    const data = await Post.aggregate([
      {
        $match: condition
        // {
        //   userId: {
        //     $in: followingsIdList
        //   }
        // }
      },
      {
        $lookup:
      {
        from: 'users',
        //  let: { <var_1>: <expression>, …, <var_n>: <expression> },
        localField: 'userId',
        foreignField: '_id',
        pipeline: [{
          $project: { fullname: 1, _id: 1 }
        }],
        as: 'users'
      }
      }
      // {
      //   $match: {
      //     'users': { $ne: [] }
      //   }
      // }
    ])
      .sort({ [sort]: order })
      .skip(limit * page)
      .limit(parseInt(limit));
    return response.success(req, res, { msgCode: 'DETAILS', data }, httpStatus.OK);
  } catch (err) {
    return response.error(req, res, { msgCode: 'SOMETHING_WRONG' }, httpStatus.SOMETHING_WRONG);
  }
};

exports.getPosts = async (req, res) => {
  try {
    const user = req.user;
    const id = req.query.id || user._id;
    const search = req.query.search || '';
    const sort = req.query.sort || 'createdAt';
    const order = parseInt(req.query.order) || -1;
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit) || 10;
    const followingsIdList = await Follow.find({ followedBy: id }).distinct('userId');
    const condition = { userId: { $in: followingsIdList }, status: constant.statusType.ACTIVE };
    if (search) {
      condition.title = { $regex: `.*${search}.*`, $options: 'i' };
    }
    const data = await Post.find(condition).populate('userId', ['_id', 'fullname'])
      .sort({ [sort]: order })
      .skip(limit * page)
      .limit(parseInt(limit));
    return response.success(req, res, { msgCode: 'DETAILS', data }, httpStatus.OK);
  } catch (err) {
    return response.error(req, res, { msgCode: 'SOMETHING_WRONG' }, httpStatus.SOMETHING_WRONG);
  }
};
