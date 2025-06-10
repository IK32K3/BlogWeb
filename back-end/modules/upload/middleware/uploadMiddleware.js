const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { createCloudinaryStorage } = require('../../../configs/cloudinary');

// Kiểm tra loại file
const fileFilter = (req, file, cb) => {
  // Chấp nhận các định dạng hình ảnh
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  
  // Kiểm tra MIME type
  const mimeOk = allowedTypes.test(file.mimetype);
  
  // Kiểm tra extension
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  
  if (mimeOk && extname) {
    return cb(null, true);
  }
  
  cb(new Error('Chỉ chấp nhận file hình ảnh: jpg, jpeg, png, gif, webp'), false);
};

// Cấu hình Multer cho Cloudinary storage
const cloudinaryUpload = multer({
  storage: createCloudinaryStorage(process.env.UPLOAD_FOLDER || 'uploads'),
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB
  fileFilter: fileFilter
});

// Các middleware riêng cho từng trường hợp sử dụng
const uploadMiddleware = {
  // Upload đơn - Cloudinary
  uploadSingleImage: cloudinaryUpload.single('image'),
  
  // Upload nhiều - Cloudinary (tối đa 10 ảnh)
  uploadMultipleImages: cloudinaryUpload.array('images', 10),
  
  // Upload cho editor - Cloudinary
  uploadEditorImage: cloudinaryUpload.single('upload')
};

module.exports = uploadMiddleware; 