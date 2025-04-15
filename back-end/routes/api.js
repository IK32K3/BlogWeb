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

const { createPostValidation,
  updatePostValidation,
  getPostByIdValidation,
  getPostBySlugValidation,
  deletePostValidation,
  getPostsByCategoryValidation,
  getAllPostsValidation,
  getUserPostsValidation,
  getMyPostsValidation,
  searchPostsValidation,
  getPostsByAuthorValidation } = require("modules/posts/validation/postValidations");

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
  // Public routes (no authentication required)
  router.get("/", validate(getAllPostsValidation), postController.getAllPosts);
  router.get("/:id", validate(getPostByIdValidation), postController.getPostById);
  router.get("/slug/:slug",validate() , postController.getPostBySlug); // Slug-based lookup
  router.get("/categories/:categoryId", validate(getPostsByCategoryValidation), postController.getPostsByCategory);
  //router.get("/tags/:tag", postController.getPostsByTag); // Filter by tag
  router.get("/search", validate(searchPostsValidation), postController.searchPosts); // Search functionality
  router.get("/posts/author/:userId", validate(getPostsByAuthorValidation), postController.getPostsByAuthor); // Posts by author

  // Authenticated routes
  router.group("/", middlewares([authenticated, isAuthenticated]), (router) => {
    // User's personal post management
    router.get("/my/posts", postController.getMyPosts);
    router.get("/my/drafts", postController.getMyDrafts);
    // router.get("/my/bookmarks", postController.getBookmarkedPosts);

    // Post interactions
    //router.post("/:id/like", postController.likePost);
    // router.post("/:id/bookmark", postController.bookmarkPost);
    //router.post("/:id/share", postController.sharePost);

    // Post creation
    router.post("/", validate(createPostValidation), postController.createPost);
    router.post("/draft", validate(createPostValidation), postController.saveAsDraft);

    // Routes requiring post ownership
    router.group("/:id", middlewares([isResourceOwner(require('models').Post)]), (router) => {
      router.put("/", validate(updatePostValidation), postController.updatePost);
      router.patch("/", postController.partialUpdatePost);
      router.delete("/", validate(deletePostValidation), postController.deletePost);

      // Additional post actions
      router.post("/publish", postController.publishPost);
      router.post("/schedule", postController.schedulePost);
      router.post("/feature-image", postController.uploadFeatureImage);
    });
  });
});

  
  // Admin-only routes
  router.group("/admin", middlewares([authenticated, isAdmin]), (router) => {
    router.get("/all", postController.getAllPostsAdmin); // Includes drafts, scheduled, etc.
    router.patch("/:id/status", postController.changePostStatus); // Change post status
    router.post("/:id/feature", postController.featurePost); // Feature a post
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