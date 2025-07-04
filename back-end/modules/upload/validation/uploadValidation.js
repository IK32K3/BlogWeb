const { check } = require('express-validator');

/**
 * Validation cho upload file đơn
 * @desc: Lưu ý: Ở giai đoạn này, req.body có thể chưa chứa các trường text từ multipart/form-data vì Multer (middleware tiếp theo) mới là thằng xử lý chính multipart/form-data. Do đó, validation các trường text ở bước này có thể không hiệu quả. Validation trường text đi kèm nên thực hiện sau Multer hoặc trong Controller. Tuy nhiên, vì rule type là optional, nên nó sẽ không gây lỗi nếu req.body rỗng.
 */
const uploadSingleValidation = [
  check('type')
    .optional()
    .isIn(['avatar', 'thumbnail', 'post', 'gallery'])
    .withMessage('Loại file không hợp lệ')
];

// Validation cho upload nhiều file
const uploadMultipleValidation = [
  check('type')
    .optional()
    .isIn(['avatar', 'thumbnail', 'post', 'gallery'])
    .withMessage('Loại file không hợp lệ')
];

// Validation cho upload file trong editor
const uploadEditorValidation = [
  check('type')
    .optional()
    .isIn(['editor', 'post', 'content'])
    .withMessage('Loại file không hợp lệ')
];

// Validation cho việc xóa file
const deleteFileValidation = [
  check('0')
    .notEmpty()
    .withMessage('PublicId không được để trống')
];

module.exports = {
  uploadSingleValidation,
  uploadMultipleValidation,
  uploadEditorValidation,
  deleteFileValidation
}; 