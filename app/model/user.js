const db = require('../config/database').getUserDB();
const { statusType, userType } = require('../constant/auth');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullname: {
    type: String
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: [statusType.ACTIVE, statusType.INACTIVE, statusType.DELETE, statusType.PENDING],
    required: true,
    default: statusType.PENDING
  },
  phoneNumber: {
    type: String,
    required: true
  },
  session: {
    type: String,
    default: ''
  },
  profileImage: {
    type: String
  },
  userType: {
    type: String,
    enum: [userType.USER, userType.ADMIN],
    required: true,
    default: userType.USER
  }
},
{
  timestamps: true
}

);
const User = db.model('users', userSchema);
module.exports = User;

// const userSchema = new mongoose.Schema({
//   firstName: {
//     type: String
//   },
//   lastName: {
//     type: String
//   },
//   email: {
//     type: String,
//     required: true
//   },
//   password: {
//     type: String,
//     required: true
//   },
//   shippingAddress: [{
//     address: {
//       type: String,
//       required: true
//     },
//     location: {
//       type: {
//         type: String,
//         enum: ['Point'],
//         required: true
//       },
//       coordinates: [Number] // longitude then latitude
//     },
//     default: {

//     }
//   }],
//   status: {
//     type: Number,
//     enum: [statusType.ACTIVE, statusType.INACTIVE, statusType.DELETE],
//     required: true
//   },
//   orderCount: {
//     type: Number,
//     default: ''
//   },
//   notificationCount: {
//     type: Number,
//     default: 0
//   },
//   cartCount: {
//     type: Number,
//     default: 0
//   },
//   profileImage: {
//     type: String,
//     default: ''
//   },
//   userType: {
//     type: Number,
//     enum: [userType.USER, userType.ADMIN],
//     required: true
//   },
//   link: {
//     type: String
//   },
//   fullName: {
//     type: String
//   },
//   phoneNumber: {
//     type: String,
//     required: true
//   },
//   otp: {
//     type: Number
//   },
//   displayOrder: {
//     type: Number
//   },
//   createdBy: {
//     type: Number,
//     enum: [userType.ADMIN, userType.USER],
//     required: true
//   },
//   usedCouponIds: {
//     type: Array,
//     default: []
//   }
// },
// {
//   timestamps: true,
//   versionKey: false
// }
// );
