const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Tạo storage cho Cloudinary
const createCloudinaryStorage = (folder) => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: folder,
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
    }
  });
};

// Tạo uploader
const upload = multer({ storage: createCloudinaryStorage('blog_uploads') });

// Hàm upload file lên Cloudinary
const uploadToCloudinary = async (file, options = {}) => {
  try {
    // Nếu file là buffer
    if (Buffer.isBuffer(file)) {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream({
          folder: options.folder || process.env.CLOUDINARY_FOLDER || 'blog',
          resource_type: 'auto',
          ...options
        }, (error, result) => {
          if (error) reject(error);
          else resolve({
            url: result.secure_url,
            public_id: result.public_id,
            format: result.format,
            width: result.width,
            height: result.height,
            bytes: result.bytes
          });
        });
        uploadStream.end(file);
      });
    }
    
    // Nếu file là path
    const result = await cloudinary.uploader.upload(file, {
      folder: options.folder || process.env.CLOUDINARY_FOLDER || 'blog',
      resource_type: 'auto',
      ...options
    });

    return {
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes
    };
  } catch (error) {
    throw new Error(`Upload to Cloudinary failed: ${error.message}`);
  }
};

// Hàm xóa file từ Cloudinary
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new Error(`Delete from Cloudinary failed: ${error.message}`);
  }
};

// Hàm tạo URL cho ảnh
const getImageUrl = (publicId, options = {}) => {
  return cloudinary.url(publicId, {
    secure: true,
    ...options
  });
};

// Hàm tạo thumbnail
const getThumbnail = (publicId, width = 300, height = 300) => {
  return cloudinary.url(publicId, {
    secure: true,
    width,
    height,
    crop: 'fill',
    quality: 'auto'
  });
};

// Hàm tạo ảnh responsive
const getResponsiveImage = (publicId, options = {}) => {
  return cloudinary.url(publicId, {
    secure: true,
    responsive: true,
    ...options
  });
};

// Hàm tạo ảnh với watermark
const getWatermarkedImage = (publicId, watermarkText, options = {}) => {
  return cloudinary.url(publicId, {
    secure: true,
    overlay: {
      font_family: 'Arial',
      font_size: 60,
      text: watermarkText
    },
    ...options
  });
};

// Hàm tạo ảnh với filter
const getFilteredImage = (publicId, filter, options = {}) => {
  return cloudinary.url(publicId, {
    secure: true,
    effect: filter,
    ...options
  });
};

// Hàm tạo ảnh với transformation
const getTransformedImage = (publicId, transformations = []) => {
  return cloudinary.url(publicId, {
    secure: true,
    transformation: transformations
  });
};

// Hàm tạo ảnh với format khác
const getFormattedImage = (publicId, format, options = {}) => {
  return cloudinary.url(publicId, {
    secure: true,
    format,
    ...options
  });
};

// Hàm tạo ảnh với quality khác
const getQualityImage = (publicId, quality, options = {}) => {
  return cloudinary.url(publicId, {
    secure: true,
    quality,
    ...options
  });
};

// Hàm tạo ảnh với size khác
const getSizedImage = (publicId, width, height, options = {}) => {
  return cloudinary.url(publicId, {
    secure: true,
    width,
    height,
    crop: 'fill',
    ...options
  });
};

// Hàm tạo ảnh với crop khác
const getCroppedImage = (publicId, crop, options = {}) => {
  return cloudinary.url(publicId, {
    secure: true,
    crop,
    ...options
  });
};

// Hàm tạo ảnh với gravity khác
const getGravityImage = (publicId, gravity, options = {}) => {
  return cloudinary.url(publicId, {
    secure: true,
    gravity,
    ...options
  });
};

// Hàm tạo ảnh với angle khác
const getRotatedImage = (publicId, angle, options = {}) => {
  return cloudinary.url(publicId, {
    secure: true,
    angle,
    ...options
  });
};

// Hàm tạo ảnh với border
const getBorderedImage = (publicId, border, options = {}) => {
  return cloudinary.url(publicId, {
    secure: true,
    border,
    ...options
  });
};

// Hàm tạo ảnh với radius
const getRoundedImage = (publicId, radius, options = {}) => {
  return cloudinary.url(publicId, {
    secure: true,
    radius,
    ...options
  });
};

// Hàm tạo ảnh với opacity
const getOpacityImage = (publicId, opacity, options = {}) => {
  return cloudinary.url(publicId, {
    secure: true,
    opacity,
    ...options
  });
};

// Hàm tạo ảnh với background
const getBackgroundImage = (publicId, background, options = {}) => {
  return cloudinary.url(publicId, {
    secure: true,
    background,
    ...options
  });
};

// Hàm tạo ảnh với overlay
const getOverlayImage = (publicId, overlay, options = {}) => {
  return cloudinary.url(publicId, {
    secure: true,
    overlay,
    ...options
  });
};

// Hàm tạo ảnh với underlay
const getUnderlayImage = (publicId, underlay, options = {}) => {
  return cloudinary.url(publicId, {
    secure: true,
    underlay,
    ...options
  });
};

// Hàm tạo ảnh với color
const getColorImage = (publicId, color, options = {}) => {
  return cloudinary.url(publicId, {
    secure: true,
    color,
    ...options
  });
};

// Hàm tạo ảnh với dpr
const getDprImage = (publicId, dpr, options = {}) => {
  return cloudinary.url(publicId, {
    secure: true,
    dpr,
    ...options
  });
};

// Hàm tạo ảnh với fetch_format
const getFetchFormatImage = (publicId, fetch_format, options = {}) => {
  return cloudinary.url(publicId, {
    secure: true,
    fetch_format,
    ...options
  });
};

// Hàm tạo ảnh với flags
const getFlaggedImage = (publicId, flags, options = {}) => {
  return cloudinary.url(publicId, {
    secure: true,
    flags,
    ...options
  });
};

// Hàm tạo ảnh với if
const getConditionalImage = (publicId, condition, options = {}) => {
  return cloudinary.url(publicId, {
    secure: true,
    if: condition,
    ...options
  });
};

// Hàm tạo ảnh với page
const getPagedImage = (publicId, page, options = {}) => {
  return cloudinary.url(publicId, {
    secure: true,
    page,
    ...options
  });
};

// Hàm tạo ảnh với density
const getDensityImage = (publicId, density, options = {}) => {
  return cloudinary.url(publicId, {
    secure: true,
    density,
    ...options
  });
};

// Hàm tạo ảnh với delay
const getDelayedImage = (publicId, delay, options = {}) => {
  return cloudinary.url(publicId, {
    secure: true,
    delay,
    ...options
  });
};

// Hàm tạo ảnh với offset
const getOffsetImage = (publicId, offset, options = {}) => {
  return cloudinary.url(publicId, {
    secure: true,
    offset,
    ...options
  });
};

// Hàm tạo ảnh với duration
const getDurationImage = (publicId, duration, options = {}) => {
  return cloudinary.url(publicId, {
    secure: true,
    duration,
    ...options
  });
};

// Hàm tạo ảnh với start_offset
const getStartOffsetImage = (publicId, start_offset, options = {}) => {
  return cloudinary.url(publicId, {
    secure: true,
    start_offset,
    ...options
  });
};

// Hàm tạo ảnh với end_offset
const getEndOffsetImage = (publicId, end_offset, options = {}) => {
  return cloudinary.url(publicId, {
    secure: true,
    end_offset,
    ...options
  });
};

// Hàm tạo ảnh với video_codec
const getVideoCodecImage = (publicId, video_codec, options = {}) => {
  return cloudinary.url(publicId, {
    secure: true,
    video_codec,
    ...options
  });
};

// Hàm tạo ảnh với audio_codec
const getAudioCodecImage = (publicId, audio_codec, options = {}) => {
  return cloudinary.url(publicId, {
    secure: true,
    audio_codec,
    ...options
  });
};

// Hàm tạo ảnh với bit_rate
const getBitRateImage = (publicId, bit_rate, options = {}) => {
  return cloudinary.url(publicId, {
    secure: true,
    bit_rate,
    ...options
  });
};

// Hàm tạo ảnh với fps
const getFpsImage = (publicId, fps, options = {}) => {
  return cloudinary.url(publicId, {
    secure: true,
    fps,
    ...options
  });
};

// Hàm tạo ảnh với keyframe_interval
const getKeyframeIntervalImage = (publicId, keyframe_interval, options = {}) => {
  return cloudinary.url(publicId, {
    secure: true,
    keyframe_interval,
    ...options
  });
};

// Hàm tạo ảnh với streaming_profile
const getStreamingProfileImage = (publicId, streaming_profile, options = {}) => {
  return cloudinary.url(publicId, {
    secure: true,
    streaming_profile,
    ...options
  });
};

// Hàm tạo ảnh với fallback
const getFallbackImage = (publicId, fallback, options = {}) => {
  return cloudinary.url(publicId, {
    secure: true,
    fallback,
    ...options
  });
};

module.exports = {
  cloudinary,
  upload,
  uploadToCloudinary,
  deleteFromCloudinary,
  getImageUrl,
  getThumbnail,
  getResponsiveImage,
  getWatermarkedImage,
  getFilteredImage,
  getTransformedImage,
  getFormattedImage,
  getQualityImage,
  getSizedImage,
  getCroppedImage,
  getGravityImage,
  getRotatedImage,
  getBorderedImage,
  getRoundedImage,
  getOpacityImage,
  getBackgroundImage,
  getOverlayImage,
  getUnderlayImage,
  getColorImage,
  getDprImage,
  getFetchFormatImage,
  getFlaggedImage,
  getConditionalImage,
  getPagedImage,
  getDensityImage,
  getDelayedImage,
  getOffsetImage,
  getDurationImage,
  getStartOffsetImage,
  getEndOffsetImage,
  getVideoCodecImage,
  getAudioCodecImage,
  getBitRateImage,
  getFpsImage,
  getKeyframeIntervalImage,
  getStreamingProfileImage,
  getFallbackImage,
  createCloudinaryStorage
};
