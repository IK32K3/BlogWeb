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
const { authenticated , isAdmin, isAuthenticatedUserWithRole ,isBlogOwnerRole, isResourceOwner } = require("kernels/middlewares/authMiddleware");

// Import Validations (ensure these match exports)
const { registerValidation, loginValidation, forgotPasswordValidation, resetPasswordValidation, refreshTokenValidation } = require("modules/auth/validation/authValidations");
const { getAllUsersValidation, getUserByIdValidation, createUserValidation, updateUserValidation, updateProfileValidation, saveSettingsValidation, changePasswordValidation } = require("modules/users/validation/userValidations");
const { createPostValidation, updatePostValidation, getPostByIdValidation, getPostBySlugValidation, getPostsByCategoryValidation, getAllPostsValidation, getMyPostsValidation, searchPostsValidation, getPostsByAuthorValidation } = require("modules/posts/validation/postValidations");
const { getCommentsByPostValidation, addCommentValidation, updateCommentValidation, getMyCommentsValidation } = require("modules/comments/validation/commentValidations");
const { getAllCategoriesValidation, getCategoryByIdValidation, createCategoryValidation, updateCategoryValidation } = require("modules/categories/validation/categoryValidations");
const { getAllLanguagesValidation, getLanguageByIdValidation, createLanguageValidation, updateLanguageValidation } = require("modules/languages/validation/languageValidations");
const { getAllMediaValidation, getMediaByIdValidation, createMediaValidation, updateMediaValidation } = require("modules/media/validation/mediaValidations");
const comment = require("models/comment");

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
  // ─────────── Authenticated User Routes ─────────── //
  // Move this BEFORE the admin routes with parameters
  router.group("/me", middlewares([authenticated]), (router) => {
    router.get("/", userController.getProfile);
    router.put("/", validate(updateProfileValidation), userController.updateProfile);
    router.post("/settings", validate(saveSettingsValidation), userController.saveSettings);
    router.put("/changePassword", validate(changePasswordValidation), userController.changePassword);
  }); 

  // ─────────────── Admin Routes ─────────────── //
  router.group("/", middlewares([authenticated, isAdmin]), (router) => {
    router.get("/admin", validate(getAllUsersValidation), userController.getAllUsers);
    router.post("/admin", validate(createUserValidation), userController.createUser);
    router.get("/:id", validate(getUserByIdValidation), userController.getUserById);
    router.put("/:id", validate(updateUserValidation), userController.updateUser);
    router.delete("/:id", userController.deleteUser);
  });

});

// ===== Post Routes =====
router.group("/posts", (router) => {
   // --- Authenticated routes ---
   router.group("/", middlewares([authenticated]), (router) => { // Use 'authenticated' instead of 'isAuthenticated' if it's the primary check
    router.get("/my", validate(getMyPostsValidation), postController.getMyPosts); // Combined route for user's posts (can filter by status via query)
    // Post creation
    router.post("/", middlewares([isBlogOwnerRole]),validate(createPostValidation), postController.createPost);  
    router.put("/:id", middlewares([isResourceOwner(Post)]), validate(updatePostValidation), postController.updatePost);
    router.delete("/:id", middlewares([isResourceOwner(Post)]), postController.deletePost);
  });
  // --- Public routes (Read operations) ---
  router.get("/", validate(getAllPostsValidation), postController.getAllPosts);//done
  router.get("/search", validate(searchPostsValidation), postController.searchPosts); // Search functionality , done
  router.get("/slug/:slug", validate(getPostBySlugValidation), postController.getPostBySlug); // Get by slug before ID to avoid conflict if slug could be numeric , done
  router.get("/categories/:categoryId", validate(getPostsByCategoryValidation), postController.getPostsByCategory); // Posts by category , done
  router.get("/author/:userId", validate(getPostsByAuthorValidation), postController.getPostsByAuthor); // Corrected Path: Posts by author , dôn
  router.get("/:id", validate(getPostByIdValidation), postController.getPostById); // Get by ID (usually last among GET routes with params)

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
        router.put("/:commentId", middlewares([isResourceOwner(comment)]),validate(updateCommentValidation), commentController.updateComment);
        router.delete("/:commentId",middlewares([isResourceOwner(comment)]), commentController.deleteComment);
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
    router.delete("/:id",categoryController.deleteCategory);
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
    router.delete("/:id",  languageController.deleteLanguage);
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
       router.delete("/", mediaController.deleteMedia); // Delete media file and record
    });
  });
});

module.exports = router;