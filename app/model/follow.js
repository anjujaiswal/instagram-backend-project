const db = require('../config/database').getUserDB();
const mongoose = require('mongoose');

const FollowSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: 'users',
    required: true
  },
  followedBy: {
    type: mongoose.Types.ObjectId,
    ref: 'users',
    required: true
  }
},
{
  timestamps: true
}
);

const Follow = db.model('follows', FollowSchema);

module.exports = Follow;
