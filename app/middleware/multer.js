const multer = require('multer');
const path = require('path');

const response = require('../response/index');
const httpStatus = require('http-status');
const maxSize = 1 * 1024 * 1024;// <=1MB
// dest user or posts
const uploading = (dest, field) => (req, res, next) => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, `upload/${dest}`); // Use the provided destination
    },
    filename: function (req, file, cb) {
      cb(null, `${file.fieldname}_${Date.now()}_${path.extname(file.originalname)}`);
    }
  });
  const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
      if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true);
      } else {
        cb(null, false);
        return cb(new Error('Only .png, .jpg and .jpeg format allowed'));
      }
    },
    limits: { fileSize: maxSize }
  }).single(field);
  upload(req, res, (err) => {
    if (err) {
      return response.error(req, res, { msgCode: 'FAILED_TO_ADD' }, httpStatus.PRECONDITION_FAILED);
    } else {
      return next();
    }
  });
};

module.exports = uploading;
