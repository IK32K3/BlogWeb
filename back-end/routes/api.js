// Các import ở đầu file không thay đổi nhiều, chỉ cập nhật tên cho nhất quán
require("express-router-group");
const express = require("express");
const middlewares = require("kernels/middlewares");
const { validate } = require("kernels/validations");
// Import middleware upload đã được cập nhật
const uploadMiddleware = require("modules/upload/middleware/uploadMiddleware");

// Import Models (đã có sẵn)
const { Post, Comment } = require('models');

// Import Controllers (cập nhật tên hàm của mediaController)
const authController = require("modules/auth/controller/authController");
const userController = require("modules/users/controller/userController");
const postController = require("modules/posts/controller/postController");
const commentController = require("modules/comments/controller/commentController");
const categoryController = require("modules/categories/controller/categoryController");
const languageController = require("modules/languages/controller/languageController");
// Cập nhật tên các hàm trong controller cho đúng với phiên bản mới
const contactController = require("modules/contact/controller/contactController");
const uploadController = require("modules/upload/controller/uploadController");
const { uploadSingleValidation, uploadMultipleValidation, uploadEditorValidation, deleteFileValidation } = require("modules/upload/validation/uploadValidation");

// Import Middleware (không đổi)
const { authenticated, isAdmin, isBlogOwnerRole, isResourceOwner } = require("kernels/middlewares/authMiddleware");

// Import Validations (cập nhật tên cho nhất quán)
const { registerValidation, loginValidation, forgotPasswordValidation, resetPasswordValidation, refreshTokenValidation, logoutValidation } = require("modules/auth/validation/authValidations");
const { getAllUsersValidation, getUserByIdValidation, createUserValidation, updateUserValidation, updateProfileValidation, saveSettingsValidation, changePasswordValidation } = require("modules/users/validation/userValidations");
const { createPostValidation, updatePostValidation, getPostByIdValidation, getPostBySlugValidation, getPostsByCategoryValidation, getAllPostsValidation, getMyPostsValidation, getPostsByAuthorValidation } = require("modules/posts/validation/postValidations");
const { getCommentsByPostValidation, addCommentValidation, updateCommentValidation, getMyCommentsValidation } = require("modules/comments/validation/commentValidations");
const { getAllCategoriesValidation, getCategoryByIdValidation, createCategoryValidation, updateCategoryValidation } = require("modules/categories/validation/categoryValidations");
const { getAllLanguagesValidation, getLanguageByIdValidation, createLanguageValidation, updateLanguageValidation } = require("modules/languages/validation/languageValidations");
// Cập nhật tên các validation cho media
const { contactFormValidation } = require("modules/contact/validation/contactValidations");

const router = express.Router({ mergeParams: true });

// ===== Auth Routes =====
router.group("/auth", (router) => {
  router.post("/register", 
    validate(registerValidation), 
    authController.register
  );
  router.post("/login", 
    validate(loginValidation), 
    authController.login
  );
  router.post("/forgot-password", 
    validate(forgotPasswordValidation), 
    authController.forgotPassword
  );
  router.post("/reset-password", 
    validate(resetPasswordValidation), 
    authController.resetPassword
  );
  router.post("/refresh-token", 
    validate(refreshTokenValidation), 
    authController.refreshToken
  );
  router.post("/logout", 
    authenticated, 
    validate(logoutValidation), 
    authController.logout
  );
});
// ===== User Routes =====
router.group("/users", (router) => {
  router.group("/me", middlewares([authenticated]), (router) => {
    router.get("/", userController.getProfile);
    router.put("/", validate(updateProfileValidation), userController.updateProfile);
    router.post("/settings", validate(saveSettingsValidation), userController.saveSettings);
    router.put("/changePassword", validate(changePasswordValidation), userController.changePassword);

    // Route upload avatar
    router.post(
      "/avatar",
      authenticated,
      uploadMiddleware.uploadSingleAvatar, // Dùng đúng middleware cho field 'avatar'
      userController.uploadAvatar
    );
  });

  router.group("/", middlewares([authenticated, isAdmin]), (router) => {
    router.get("/admin", validate(getAllUsersValidation), userController.getAllUsers);
    router.post("/admin", validate(createUserValidation), userController.createUser);
    router.get("/:id", validate(getUserByIdValidation), userController.getUserById);
    router.put("/:id", validate(updateUserValidation), userController.updateUser);
    router.delete("/:id", userController.deleteUser);
  });
});

// ===== Search Route =====

// ===== Post Routes =====
router.group("/posts", (router) => {
  router.get("/", validate(getAllPostsValidation), postController.getAllPosts);
  
  router.group("/", middlewares([authenticated]), (router) => {
    router.get("/my", validate(getMyPostsValidation), postController.getMyPosts);
    router.post("/", 
      middlewares([isBlogOwnerRole]), 
      uploadMiddleware.uploadFields,
      validate(createPostValidation), 
      postController.createPost
    );
    router.put("/:id", 
      middlewares([isResourceOwner(Post)]), 
      uploadMiddleware.uploadFields,
      validate(updatePostValidation), 
      postController.updatePost
    );
    router.delete("/:id", 
      middlewares([isResourceOwner(Post)]), 
      postController.deletePost
    );
    router.patch("/:id/status", 
      middlewares([authenticated, isResourceOwner(Post)]), 
      postController.updateStatus
    );
  });

  router.get("/slug/:slug", validate(getPostBySlugValidation), postController.getPostBySlug);
  router.get("/categories/:categoryId", validate(getPostsByCategoryValidation), postController.getPostsByCategory);
  router.get("/author/:userId", validate(getPostsByAuthorValidation), postController.getPostsByAuthor);
  router.get("/:id", validate(getPostByIdValidation), postController.getPostById);

  // ===== Comment Routes (Nested under posts) =====
  router.get("/:postId/comments", validate(getCommentsByPostValidation), commentController.getCommentsByPost);
  router.post("/:postId/comments", middlewares([authenticated]), validate(addCommentValidation), commentController.addComment);
});

// ===== Comment Routes (Removed post-related routes)
router.group("/comments", (router) => {
  // router.get("/post/:postId", validate(getCommentsByPostValidation), commentController.getCommentsByPost); // Moved to /posts/:postId/comments

  router.group("/", middlewares([authenticated]), (router) => {
    // router.post("/post/:postId", validate(addCommentValidation), commentController.addComment); // Moved to /posts/:postId/comments
    router.get("/my", validate(getMyCommentsValidation), commentController.getMyComments);
    router.put("/:commentId", middlewares([isResourceOwner(Comment)]), validate(updateCommentValidation), commentController.updateComment);
    router.delete("/:commentId", middlewares([isResourceOwner(Comment)]), commentController.deleteComment);
  });
});

// ===== Category Routes =====
router.group("/categories", (router) => {
  router.get("/", validate(getAllCategoriesValidation), categoryController.getAllCategories);
  router.get("/:id", validate(getCategoryByIdValidation), categoryController.getCategoryById);

  router.group("/", middlewares([authenticated, isAdmin]), (router) => {
    router.post("/", validate(createCategoryValidation), categoryController.createCategory);
    router.put("/:id", validate(updateCategoryValidation), categoryController.updateCategory);
    router.delete("/:id", categoryController.deleteCategory);
  });
});

// ===== Language Routes =====
router.group("/languages", (router) => {
  router.get("/", validate(getAllLanguagesValidation), languageController.getAllLanguages);
  router.get("/:id", validate(getLanguageByIdValidation), languageController.getLanguageById);

  router.group("/", middlewares([authenticated, isAdmin]), (router) => {
    router.post("/", validate(createLanguageValidation), languageController.createLanguage);
    router.put("/:id", validate(updateLanguageValidation), languageController.updateLanguage);
    router.delete("/:id", languageController.deleteLanguage);
  });
});

// ===== Upload Routes =====
router.group("/uploads", (router) => {
  router.get('/', 
    authenticated, 
    uploadController.getAllMedia
  );
  
  router.post('/image', 
    authenticated, 
    validate(uploadSingleValidation),
    uploadMiddleware.uploadSingleImage,
    uploadController.uploadSingleImage
  );
  
  router.post('/images', 
    authenticated, 
    validate(uploadMultipleValidation),
    uploadMiddleware.uploadMultipleImages,
    uploadController.uploadMultipleImages
  );
  
  router.post('/editor', 
    authenticated, 
    validate(uploadEditorValidation),
    uploadMiddleware.uploadEditorImage,
    uploadController.uploadEditorImage
  );
  
  router.delete('/*', 
    authenticated, 
    validate(deleteFileValidation),
    uploadController.deleteUploadedFile
  );

});

// ===== Contact Routes =====
router.group("/contact", (router) => {
  router.post("/", validate(contactFormValidation), contactController.sendMessage);
});

module.exports = router;