const db = require('../config/database').getUserDB();
const mongoose = require('mongoose');
const { statusType } = require('../constant/auth');

const PostSchema = new mongoose.Schema({
  title: {
    type: String
  },
  image: {
    type: String
  },
  status: {
    type: String,
    enum: [statusType.ACTIVE, statusType.INACTIVE],
    default: statusType.ACTIVE
  },
  userId: {
    type: mongoose.Types.ObjectId,
    ref: 'users',
    required: true
  }
},
{
  timestamps: true,
  versionKey: false
}
);

const Post = db.model('posts', PostSchema);

module.exports = Post;
