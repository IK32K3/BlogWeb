require("express-router-group");
const express = require("express");
const middlewares = require("kernels/middlewares"); // Assuming this correctly applies an array of middlewares
const { validate } = require("kernels/validations");

// Import Models (needed for isResourceOwner)
const { Post, Comment, Media } = require('models'); // Import necessary models directly

// Import Controllers
const authController = require("modules/auth/controller/authController");
const userController = require("modules/users/controller/userController");
const postController = require("modules/posts/controller/postController");
const commentController = require("modules/comments/controller/commentController");
const categoryController = require("modules/categories/controller/categoryController");
const languageController = require("modules/languages/controller/languageController");
const mediaController = require("modules/media/controller/mediaController");

// Import Middleware
// Ensure 'isResourceOwner' correctly handles model lookup and owner check (req.user.id vs resource.user_id)
// and potentially allows admins.
const { authenticated, isAdmin, isAuthenticated, isResourceOwner } = require("modules/auth/middleware/authMiddleware");

// Import Validations (ensure these match exports)
const { registerValidation, loginValidation, forgotPasswordValidation, resetPasswordValidation, refreshTokenValidation } = require("modules/auth/validation/authValidations");
const { getAllUsersValidation, getUserByIdValidation, createUserValidation, updateUserValidation, deleteUserValidation, updateProfileValidation, saveSettingsValidation } = require("modules/users/validation/userValidations");
const { createPostValidation, updatePostValidation, getPostByIdValidation, getPostBySlugValidation, deletePostValidation, getPostsByCategoryValidation, getAllPostsValidation, getMyPostsValidation, searchPostsValidation, getPostsByAuthorValidation } = require("modules/posts/validation/postValidations");
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
  // Consider adding a '/logout' route if using server-side sessions or blacklisting tokens
  // router.post("/logout", authenticated, authController.logout);
});

// ===== User Routes =====
router.group("/users", (router) => {
  // Admin only routes for managing all users
  router.group("/", middlewares([authenticated, isAdmin]), (router) => {
    router.get("/", validate(getAllUsersValidation), userController.getAllUsers);
    router.post("/", validate(createUserValidation), userController.createUser);
    router.get("/:id", validate(getUserByIdValidation), userController.getUserById); // Admin gets any user
    router.put("/:id", validate(updateUserValidation), userController.updateUser); // Admin updates any user
    router.delete("/:id", validate(deleteUserValidation), userController.deleteUser); // Admin deletes any user
  });

  // Authenticated user routes for their own profile
  router.group("/profile", middlewares([authenticated]), (router) => { // isAuthenticated might be redundant if authenticated covers it
    router.get("/", userController.getProfile); // Get own profile
    router.put("/", validate(updateProfileValidation), userController.updateProfile); // Update own profile
    // Settings might be part of profile PUT or separate if complex
    // router.post("/settings", validate(saveSettingsValidation), userController.saveSettings);
  });
});

// ===== Post Routes =====
router.group("/posts", (router) => {
  // --- Public routes (Read operations) ---
  router.get("/", validate(getAllPostsValidation), postController.getAllPosts);
  router.get("/search", validate(searchPostsValidation), postController.searchPosts); // Search functionality
  router.get("/slug/:slug", validate(getPostBySlugValidation), postController.getPostBySlug); // Get by slug before ID to avoid conflict if slug could be numeric
  router.get("/categories/:categoryId", validate(getPostsByCategoryValidation), postController.getPostsByCategory); // Posts by category
  router.get("/author/:userId", validate(getPostsByAuthorValidation), postController.getPostsByAuthor); // Corrected Path: Posts by author
  router.get("/:id", validate(getPostByIdValidation), postController.getPostById); // Get by ID (usually last among GET routes with params)

  // --- Authenticated routes ---
  router.group("/", middlewares([authenticated]), (router) => { // Use 'authenticated' instead of 'isAuthenticated' if it's the primary check
    // User's personal post views/management
    router.get("/my", validate(getMyPostsValidation), postController.getMyPosts); // Combined route for user's posts (can filter by status via query)
    // router.get("/my/drafts", postController.getMyDrafts); // Might be redundant if /my handles drafts via query param

    // Post creation
    router.post("/", validate(createPostValidation), postController.createPost);

    // --- Routes requiring specific post access (Owner or Admin) ---
    // Use :postId or :id consistently. Let's use :id as per convention above.
    router.group("/:id", middlewares([isResourceOwner(Post)]), (router) => {
       // isResourceOwner should check ownership OR admin status
       router.put("/", validate(updatePostValidation), postController.updatePost);
       router.delete("/", validate(deletePostValidation), postController.deletePost);

       // --- Potential Action Routes (Alternative to overloading PUT) ---
       // Example: Define specific actions on a post
       // router.post("/publish", postController.publishPost); // Needs isAdmin or owner check
       // router.post("/feature", middlewares([isAdmin]), postController.featurePost); // Example: Admin only action
    });
  });
});


// ===== Comment Routes =====
router.group("/comments", (router) => {
  // Public: Get comments for a post
  router.get("/post/:postId", validate(getCommentsByPostValidation), commentController.getCommentsByPost); // Use /post/:postId for clarity

  // Authenticated user routes for managing comments
  router.group("/", middlewares([authenticated]), (router) => {
    router.post("/post/:postId", validate(addCommentValidation), commentController.addComment); // Add comment to specific post
    router.get("/my", validate(getMyCommentsValidation), commentController.getMyComments); // Get user's own comments

    // Actions on a specific comment (Owner or Admin)
    // Use :commentId consistently
    router.group("/:commentId", middlewares([isResourceOwner(Comment)]), (router) => { // Corrected Model Name
        // isResourceOwner should check ownership OR admin status
        router.put("/", validate(updateCommentValidation), commentController.updateComment);
        router.delete("/", validate(deleteCommentValidation), commentController.deleteComment);
    });
  });
});

// ===== Category Routes =====
router.group("/categories", (router) => {
  // Public routes
  router.get("/", validate(getAllCategoriesValidation), categoryController.getAllCategories);
  router.get("/:id", validate(getCategoryByIdValidation), categoryController.getCategoryById); // Or use slug /slug/:slug

  // Admin only routes for managing categories
  router.group("/", middlewares([authenticated, isAdmin]), (router) => {
    router.post("/", validate(createCategoryValidation), categoryController.createCategory);
    router.put("/:id", validate(updateCategoryValidation), categoryController.updateCategory);
    router.delete("/:id", validate(deleteCategoryValidation), categoryController.deleteCategory);
  });
});

// ===== Language Routes =====
router.group("/languages", (router) => {
  // Public routes (if languages are publicly listed)
  router.get("/", validate(getAllLanguagesValidation), languageController.getAllLanguages);
  router.get("/:id", validate(getLanguageByIdValidation), languageController.getLanguageById);

  // Admin only routes for managing languages
  router.group("/", middlewares([authenticated, isAdmin]), (router) => {
    router.post("/", validate(createLanguageValidation), languageController.createLanguage);
    router.put("/:id", validate(updateLanguageValidation), languageController.updateLanguage);
    router.delete("/:id", validate(deleteLanguageValidation), languageController.deleteLanguage);
  });
});

// ===== Media Routes =====
router.group("/media", (router) => {
  // Public routes? Usually media is accessed via its URL, but an API might list/get details.
  router.get("/", validate(getAllMediaValidation), mediaController.getAllMedia); // Consider if this needs auth/admin
  router.get("/:id", validate(getMediaByIdValidation), mediaController.getMediaById); // Consider if this needs auth/admin

  // Authenticated user routes (primarily for upload)
  router.group("/", middlewares([authenticated]), (router) => {
    router.post("/", validate(createMediaValidation), mediaController.createMedia); // Upload media

    // --- Routes requiring specific media access (Owner or Admin) ---
    // Use :mediaId or :id consistently. Let's use :id.
    router.group("/:id", middlewares([isResourceOwner(Media)]), (router) => { // Added Ownership Check
       // isResourceOwner should check ownership OR admin status
       router.put("/", validate(updateMediaValidation), mediaController.updateMedia); // Update media metadata (e.g., alt text)
       router.delete("/", validate(deleteMediaValidation), mediaController.deleteMedia); // Delete media file and record
    });
  });
});

module.exports = router;