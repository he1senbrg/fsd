const multer = require('multer');
const AppError = require('../utils/AppError');

// mem buffer before upload
const storage = multer.memoryStorage();

const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new AppError('Only image files are allowed.', 400), false);
  }
};

const mediaFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new AppError('Only image and video files are allowed.', 400), false);
  }
};

const uploadAvatar = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
}).single('avatar');

// cover: 5MB max
const uploadCover = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single('cover');

// up to 10 5MB each
const uploadMedia = multer({
  storage,
  fileFilter: mediaFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).array('media', 10);

// pdt images: up to 5 5MB each
const uploadProductImages = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).array('images', 5);

const uploadSingleImage = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single('image');

module.exports = {
  uploadAvatar,
  uploadCover,
  uploadMedia,
  uploadProductImages,
  uploadSingleImage,
};
