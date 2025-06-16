const { processCloudinaryUpload, processMultipleCloudinaryUploads, processEditorUpload, deleteFromCloudinary } = require('../service/uploadService');
const responseUtils = require('../../../utils/responseUtils');
const uploadService = require('../service/uploadService');

class UploadController {
  /**
   * Upload single image
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async uploadSingleImage(req, res) {
    try {
      if (!req.file) {
        return responseUtils.badRequest(res, 'No file uploaded');
      }

      const result = await uploadService.processCloudinaryUpload(req.file, { type: 'avatar' });
      return responseUtils.success(res, result, 'File uploaded successfully');
    } catch (error) {
      console.error('[UploadController.uploadSingleImage] Error:', error);
      return responseUtils.error(res, error, 'Failed to upload file');
    }
  }

  /**
   * Upload multiple images
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async uploadMultipleImages(req, res) {
    try {
      if (!req.files || req.files.length === 0) {
        return responseUtils.badRequest(res, 'No files uploaded');
      }

      const results = await uploadService.processMultipleCloudinaryUploads(req.files, { type: 'gallery' });
      return responseUtils.success(res, results, 'Files uploaded successfully');
    } catch (error) {
      console.error('[UploadController.uploadMultipleImages] Error:', error);
      return responseUtils.error(res, error, 'Failed to upload files');
    }
  }

  /**
   * Upload image from editor
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async uploadEditorImage(req, res) {
    try {
      if (!req.file) {
        return responseUtils.badRequest(res, 'No file uploaded');
      }

      const editorData = await uploadService.processEditorUpload(req.file);
      return responseUtils.success(res, editorData, 'File uploaded successfully');
    } catch (error) {
      console.error('[UploadController.uploadEditorImage] Error:', error);
      return responseUtils.error(res, error, 'Failed to upload file');
    }
  }

  /**
   * Delete uploaded file
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteUploadedFile(req, res) {
    try {
      const { publicId } = req.params;

      if (!publicId) {
        return responseUtils.badRequest(res, 'Public ID is required');
      }

      const result = await uploadService.deleteFromCloudinary(publicId);

      if (result.result === 'ok') {
        const exists = await uploadService.checkFileExists(publicId);
        const fileInfo = await uploadService.getFileInfo(publicId);
        return responseUtils.success(res, result, 'File deleted successfully');
      } else {
        return responseUtils.error(res, null, 'Failed to delete file', 400);
      }
    } catch (error) {
      console.error('[UploadController.deleteUploadedFile] Error:', error);
      return responseUtils.error(res, error, 'Failed to delete file');
    }
  }
}

module.exports = new UploadController(); 