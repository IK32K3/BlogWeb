require("express-router-group");
const express = require("express");
const middlewares = require("kernels/middlewares");
const { validate } = require("kernels/validations");

// Import controllers
const authController = require("modules/auth/controller/authController");
const userController = require("modules/users/controller/userController");
const postController = require("modules/posts/controller/postController");
const commentController = require("modules/comments/controller/commentController");
const categoryController = require("modules/categories/controller/categoryController");
const languageController = require("modules/languages/controller/languageController");
const mediaController = require("modules/media/controller/mediaController");

// Import middleware
const { authenticated, isAdmin, isBlogOwner, isAuthenticated, isResourceOwner } = require("modules/auth/middleware/authMiddleware");

// Import validations
const { registerValidation, loginValidation, forgotPasswordValidation, resetPasswordValidation, refreshTokenValidation } = require("modules/auth/validation/authValidations");
const { getAllUsersValidation, getUserByIdValidation, createUserValidation, updateUserValidation, deleteUserValidation, updateProfileValidation, saveSettingsValidation } = require("modules/users/validation/userValidations");
const { createPostValidation, updatePostValidation, getPostByIdValidation, deletePostValidation, getPostsByCategoryValidation, getAllPostsValidation } = require("modules/posts/validation/postValidations");
const { getCommentsByPostValidation, addCommentValidation, updateCommentValidation, deleteCommentValidation, getMyCommentsValidation } = require("modules/comments/validation/commentValidations");
const { getAllCategoriesValidation, getCategoryByIdValidation, createCategoryValidation, updateCategoryValidation, deleteCategoryValidation } = require("modules/categories/validation/categoryValidations");
const { getAllLanguagesValidation, getLanguageByIdValidation, createLanguageValidation, updateLanguageValidation, deleteLanguageValidation } = require("modules/languages/validation/languageValidations");
const { getAllMediaValidation, getMediaByIdValidation, createMediaValidation, updateMediaValidation, deleteMediaValidation } = require("modules/media/validation/mediaValidations");

const router = express.Router({ mergeParams: true });

// ===== Auth Routes =====
router.group("/auth", (router) => {
  router.post("/register", validate(registerValidation), authController.register);
  router.post("/login", validate(loginValidation), authController.login);
  router.post("/forgot-password", validate(forgotPasswordValidation), authController.forgotPassword);
  router.post("/reset-password", validate(resetPasswordValidation), authController.resetPassword);
  router.post("/refresh-token", validate(refreshTokenValidation), authController.refreshToken);
});

// ===== User Routes =====
router.group("/users", (router) => {
  // Admin only routes
  router.group("/", middlewares([authenticated, isAdmin]), (router) => {
    router.get("/", validate(getAllUsersValidation), userController.getAllUsers);
    router.post("/", validate(createUserValidation), userController.createUser);
    router.get("/:id", validate(getUserByIdValidation), userController.getUserById);
    router.put("/:id", validate(updateUserValidation), userController.updateUser);
    router.delete("/:id", validate(deleteUserValidation), userController.deleteUser);
  });
  
  // Authenticated user routes
  router.group("/profile", middlewares([authenticated, isAuthenticated]), (router) => {
    router.get("/", userController.getProfile);
    router.put("/", validate(updateProfileValidation), userController.updateProfile);
    router.post("/settings", validate(saveSettingsValidation), userController.saveSettings);
  });
});

// ===== Post Routes =====
router.group("/posts", (router) => {
  // Public routes
  router.get("/", validate(getAllPostsValidation), postController.getAllPosts);
  router.get("/:id", validate(getPostByIdValidation), postController.getPostById);
  router.get("/categories/:categoryId", validate(getPostsByCategoryValidation), postController.getPostsByCategory);
  
  // Authenticated user routes
  router.group("/", middlewares([authenticated, isAuthenticated]), (router) => {
    router.get("/my/posts", postController.getMyPosts);
  });
  
  // Blog owner routes
  router.group("/", middlewares([authenticated, isBlogOwner]), (router) => {
    router.post("/", validate(createPostValidation), postController.createPost);
    router.put("/:id", validate(updatePostValidation), middlewares([isResourceOwner(require('models').Post)]), postController.updatePost);
    router.delete("/:id", validate(deletePostValidation), middlewares([isResourceOwner(require('models').Post)]), postController.deletePost);
  });
});

// ===== Comment Routes =====
router.group("/comments", (router) => {
  // Public routes
  router.get("/posts/:postId", validate(getCommentsByPostValidation), commentController.getCommentsByPost);
  
  // Authenticated user routes
  router.group("/", middlewares([authenticated, isAuthenticated]), (router) => {
    router.post("/posts/:postId", validate(addCommentValidation), commentController.addComment);
    router.put("/:commentId", validate(updateCommentValidation), middlewares([isResourceOwner(require('models').comments)]), commentController.updateComment);
    router.delete("/:commentId", validate(deleteCommentValidation), middlewares([isResourceOwner(require('models').comments)]), commentController.deleteComment);
    router.get("/my", validate(getMyCommentsValidation), commentController.getMyComments);
  });
});

// ===== Category Routes =====
router.group("/categories", (router) => {
  // Public routes
  router.get("/", validate(getAllCategoriesValidation), categoryController.getAllCategories);
  router.get("/:id", validate(getCategoryByIdValidation), categoryController.getCategoryById);
  
  // Admin only routes
  router.group("/", middlewares([authenticated, isAdmin]), (router) => {
    router.post("/", validate(createCategoryValidation), categoryController.createCategory);
    router.put("/:id", validate(updateCategoryValidation), categoryController.updateCategory);
    router.delete("/:id", validate(deleteCategoryValidation), categoryController.deleteCategory);
  });
});

// ===== Language Routes =====
router.group("/languages", (router) => {
  // Public routes
  router.get("/", validate(getAllLanguagesValidation), languageController.getAllLanguages);
  router.get("/:id", validate(getLanguageByIdValidation), languageController.getLanguageById);
  
  // Admin only routes
  router.group("/", middlewares([authenticated, isAdmin]), (router) => {
    router.post("/", validate(createLanguageValidation), languageController.createLanguage);
    router.put("/:id", validate(updateLanguageValidation), languageController.updateLanguage);
    router.delete("/:id", validate(deleteLanguageValidation), languageController.deleteLanguage);
  });
});

// ===== Media Routes =====
router.group("/media", (router) => {
  // Public routes
  router.get("/", validate(getAllMediaValidation), mediaController.getAllMedia);
  router.get("/:id", validate(getMediaByIdValidation), mediaController.getMediaById);
  
  // Authenticated user routes
  router.group("/", middlewares([authenticated, isAuthenticated]), (router) => {
    router.post("/", validate(createMediaValidation), mediaController.createMedia);
    router.put("/:id", validate(updateMediaValidation), mediaController.updateMedia);
    router.delete("/:id", validate(deleteMediaValidation), mediaController.deleteMedia);
  });
});

module.exports = router;