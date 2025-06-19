const fs = require('fs');
const path = require('path');
const { cloudinary } = require('../../../configs/cloudinary');

class UploadService {
  /**
   * Xử lý file sau khi upload lên Cloudinary
   * @param {Object} file - File đã được upload qua multer-cloudinary
   * @param {Object} options - Các tùy chọn bổ sung
   * @returns {Object} - Thông tin file đã upload
   */
  processCloudinaryUpload(file, options = {}) {
    try {
      // Kiểm tra file có đúng định dạng không
      if (!file || !file.path) {
        throw new Error('File không hợp lệ');
      }

      // Xử lý URL Cloudinary
      const cloudinaryUrl = file.path;
      const publicId = file.filename;

      return {
        url: cloudinaryUrl,
        publicId: publicId,
        originalName: file.originalname,
        size: file.size,
        format: path.extname(file.originalname).replace('.', ''),
        type: options.type || 'image',
        width: file.width,
        height: file.height,
        createdAt: new Date()
      };
    } catch (error) {
      throw new Error(`Lỗi xử lý file Cloudinary: ${error.message}`);
    }
  }

  /**
   * Xử lý file sau khi upload lên disk
   * @param {Object} file - File đã được upload qua multer disk storage
   * @param {Object} options - Các tùy chọn bổ sung
   * @returns {Object} - Thông tin file đã upload
   */
  processLocalUpload(file, options = {}) {
    // Tạo URL public cho file
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
    const relativePath = file.path.split('public')[1].replace(/\\/g, '/');
    const publicUrl = `${baseUrl}${relativePath}`;

    return {
      url: publicUrl,
      path: file.path,
      originalName: file.originalname,
      filename: file.filename,
      size: file.size,
      format: path.extname(file.originalname).replace('.', ''),
      type: options.type || 'image',
      createdAt: new Date()
    };
  }

  /**
   * Xử lý nhiều file đã upload lên Cloudinary
   * @param {Array} files - Mảng các file đã được upload
   * @param {Object} options - Các tùy chọn bổ sung
   * @returns {Array} - Mảng thông tin các file đã upload
   */
  processMultipleCloudinaryUploads(files, options = {}) {
    try {
      if (!Array.isArray(files)) {
        throw new Error('Files phải là một mảng');
      }

      return files.map(file => this.processCloudinaryUpload(file, options));
    } catch (error) {
      throw new Error(`Lỗi xử lý nhiều file Cloudinary: ${error.message}`);
    }
  }

  /**
   * Xử lý nhiều file đã upload lên disk
   * @param {Array} files - Mảng các file đã được upload
   * @param {Object} options - Các tùy chọn bổ sung
   * @returns {Array} - Mảng thông tin các file đã upload
   */
  processMultipleLocalUploads(files, options = {}) {
    return files.map(file => this.processLocalUpload(file, options));
  }

  /**
   * Xử lý multipleFields từ multer fields
   * @param {Object} filesObj - Đối tượng các files từ multer fields
   * @param {Object} options - Các tùy chọn bổ sung
   * @returns {Object} - Đối tượng chứa thông tin các files đã upload
   */
  processFieldsUpload(filesObj, options = {}) {
    const result = {};
    for (const field in filesObj) {
      if (filesObj[field].length === 1) {
        // Nếu chỉ có 1 file, trả về thông tin file đó
        result[field] = this.processCloudinaryUpload(filesObj[field][0], options);
      } else {
        // Nếu có nhiều file, trả về mảng thông tin các file
        result[field] = this.processMultipleCloudinaryUploads(filesObj[field], options);
      }
    }
    return result;
  }

  /**
   * Xóa file trên Cloudinary
   * @param {String} publicId - Public ID của file trên Cloudinary
   * @returns {Promise} - Kết quả xóa file
   */
  async deleteFromCloudinary(publicId) {
    try {
      if (!publicId) {
        throw new Error('Public ID không được để trống');
      }

      const result = await cloudinary.uploader.destroy(publicId);
      return result;
    } catch (error) {
      throw new Error(`Lỗi khi xóa file từ Cloudinary: ${error.message}`);
    }
  }

  /**
   * Xóa file trên local disk
   * @param {String} filePath - Đường dẫn tới file cần xóa
   * @returns {Promise} - Kết quả xóa file
   */
  async deleteFromDisk(filePath) {
    return new Promise((resolve, reject) => {
      fs.unlink(filePath, (err) => {
        if (err) {
          reject(new Error(`Lỗi khi xóa file trên disk: ${err.message}`));
        } else {
          resolve({ success: true });
        }
      });
    });
  }

  /**
   * Xử lý upload từ editor (QuillJS)
   * @param {Object} file - File đã được upload
   * @returns {Object} - Thông tin file cần trả về cho editor
   */
  processEditorUpload(file) {
    try {
      if (!file || !file.path) {
        throw new Error('File không hợp lệ');
      }

      return {
        url: file.path,
        alt: file.originalname,
        name: file.originalname,
        size: file.size,
        type: file.mimetype
      };
    } catch (error) {
      throw new Error(`Lỗi xử lý file editor: ${error.message}`);
    }
  }

  /**
   * Kiểm tra file có tồn tại trên Cloudinary không
   * @param {String} publicId - Public ID của file
   * @returns {Promise<Boolean>} - Kết quả kiểm tra
   */
  async checkFileExists(publicId) {
    try {
      const result = await cloudinary.api.resource(publicId);
      return !!result;
    } catch (error) {
      return false;
    }
  }

  /**
   * Lấy thông tin file từ Cloudinary
   * @param {String} publicId - Public ID của file
   * @returns {Promise<Object>} - Thông tin file
   */
  async getFileInfo(publicId) {
    try {
      const result = await cloudinary.api.resource(publicId);
      return {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        size: result.bytes,
        width: result.width,
        height: result.height,
        createdAt: result.created_at
      };
    } catch (error) {
      throw new Error(`Lỗi khi lấy thông tin file: ${error.message}`);
    }
  }

  /**
   * Lấy tất cả media từ Cloudinary
   * @param {Object} options - Các tùy chọn lọc và phân trang
   * @returns {Promise<Object>} - Danh sách media và thông tin phân trang
   */
  async getAllMediaFromCloudinary(options = {}) {
    try {
      const {
        folder = process.env.CLOUDINARY_FOLDER || 'blog_uploads',
        maxResults = 100,
        nextCursor = null,
        type = 'upload',
        prefix = null,
        tags = null
      } = options;

      const params = {
        type: type,
        max_results: maxResults,
        folder: folder
      };

      if (nextCursor) {
        params.next_cursor = nextCursor;
      }

      if (prefix) {
        params.prefix = prefix;
      }

      if (tags) {
        params.tags = tags;
      }

      const result = await cloudinary.api.resources(params);

      // Chuyển đổi dữ liệu để phù hợp với frontend
      const mediaItems = result.resources.map(resource => {
        const fileType = this.getFileTypeFromFormat(resource.format);
        const size = this.formatBytes(resource.bytes);
        const dimensions = resource.width && resource.height ? `${resource.width}×${resource.height}` : null;
        
        return {
          id: resource.public_id,
          name: resource.public_id.split('/').pop() || resource.public_id,
          type: fileType,
          size: size,
          dimensionsOrDuration: dimensions,
          url: resource.secure_url,
          thumbnailUrl: resource.secure_url,
          publicId: resource.public_id,
          format: resource.format,
          width: resource.width,
          height: resource.height,
          createdAt: new Date(resource.created_at),
          tagText: fileType,
          tagBgColor: this.getTagBgColor(fileType),
          tagTextColor: this.getTagTextColor(fileType),
          isChecked: false
        };
      });

      return {
        mediaItems: mediaItems,
        pagination: {
          nextCursor: result.next_cursor,
          hasMore: !!result.next_cursor,
          totalCount: result.resources.length
        }
      };
    } catch (error) {
      throw new Error(`Lỗi khi lấy danh sách media từ Cloudinary: ${error.message}`);
    }
  }

  /**
   * Xác định loại file từ format
   * @param {String} format - Format của file
   * @returns {String} - Loại file
   */
  getFileTypeFromFormat(format) {
    const imageFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
    const videoFormats = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'];
    const audioFormats = ['mp3', 'wav', 'ogg', 'aac', 'flac'];

    const lowerFormat = format.toLowerCase();
    
    if (imageFormats.includes(lowerFormat)) {
      return 'Image';
    } else if (videoFormats.includes(lowerFormat)) {
      return 'Video';
    } else if (audioFormats.includes(lowerFormat)) {
      return 'Audio';
    } else {
      return 'Document';
    }
  }

  /**
   * Format bytes thành string dễ đọc
   * @param {Number} bytes - Số bytes
   * @param {Number} decimals - Số chữ số thập phân
   * @returns {String} - String đã format
   */
  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  /**
   * Lấy màu nền cho tag
   * @param {String} type - Loại file
   * @returns {String} - Class màu nền
   */
  getTagBgColor(type) {
    switch (type) {
      case 'Image': return 'bg-blue-100';
      case 'Video': return 'bg-purple-100';
      case 'Document': return 'bg-green-100';
      case 'Audio': return 'bg-yellow-100';
      default: return 'bg-gray-100';
    }
  }

  /**
   * Lấy màu chữ cho tag
   * @param {String} type - Loại file
   * @returns {String} - Class màu chữ
   */
  getTagTextColor(type) {
    switch (type) {
      case 'Image': return 'text-blue-800';
      case 'Video': return 'text-purple-800';
      case 'Document': return 'text-green-800';
      case 'Audio': return 'text-yellow-800';
      default: return 'text-gray-800';
    }
  }
}

module.exports = new UploadService(); 