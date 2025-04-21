const postService = require('../service/postService');
const responseUtils = require('utils/responseUtils'); // Assuming this provides standardized responses

// Helper to parse integers from query/params with defaults
const parseIntOrDefault = (value, defaultValue) => {
    // Nếu value là undefined/null -> trả về giá trị mặc định
    if (value === undefined || value === null) return defaultValue;
    
    // Chuyển đổi sang số nguyên (base 10)
    const parsed = parseInt(value, 10);
    
    // Nếu kết quả không phải số (NaN) -> trả về giá trị mặc định
    return isNaN(parsed) ? defaultValue : parsed;
  };
const parsePositiveInt = (value) => {
    // If value is undefined or null, it's not valid
    if (value === undefined || value === null) return null;

    // Try to parse as integer (base 10)
    const parsed = parseInt(value, 10);

    // Check if it's a valid number AND strictly positive
    // isNaN checks for non-numeric strings. <= 0 checks for zero and negatives.
    return isNaN(parsed) || parsed <= 0 ? null : parsed;
    };
class PostController {
    // [GET] /posts - Get all posts (public facing, filtered)
    async getAllPosts(req, res) {
        try {
            const {
                page,
                limit,
                category_id, // Keep snake_case if client sends this way
                search,
                user_id,     // Keep snake_case if client sends this way
                sort,
                status       // Added based on validation rules
            } = req.query;

            // Use helper for safe parsing and defaults
            const parsedPage = parseIntOrDefault(page, 1);
            const parsedLimit = parseIntOrDefault(limit, 10);

            // Pass validated/parsed data to the service
            const result = await postService.getAllPosts({
                page: parsedPage,
                limit: parsedLimit,
                categoryId: category_id ? parsePositiveInt (category_id) : null, // Ensure categoryId is number or null
                search,
                userId: user_id ? parsePositiveInt (user_id) : null,          // Ensure userId is number or null
                sort: sort || 'latest', // Use default from service if not provided
                status: status ?? null // Default to published for public view unless specified
            });

            return responseUtils.success(res, result);
        } catch (error) {
            console.error('[PostController.getAllPosts] Error:', error);
            return responseUtils.serverError(res, 'Failed to retrieve posts'); // Generic error message
        }
    }

    // [GET] /posts/search - Search posts with more filters
    async searchPosts(req, res) {
        try {
            const {
                query: searchQuery = '', // Renamed to avoid conflict with req.query object
                page,
                limit,
                category_id,
                user_id,
                status,
                sort,
                date_from,
                date_to
            } = req.query;

            const parsedPage = parseIntOrDefault(page, 1);
            const parsedLimit = parseIntOrDefault(limit, 10);

            // Example: Allow filtering by any status only for Admins
            // Adjust role checking based on your actual auth implementation
            const isAdmin = req.user?.role === 'Admin'; // Use optional chaining
            const finalStatus = isAdmin ? status : (status || 'published'); // Default non-admins to published

            const result = await postService.searchPosts({
                query: searchQuery,
                page: parsedPage,
                limit: parsedLimit,
                category_id: category_id ? parsePositiveInt (category_id) : null,
                user_id: user_id ? parsePositiveInt (user_id) : null,
                status: finalStatus,
                sort: sort || 'newest', // Default sort for search
                date_from,
                date_to
            });

            // Return a structured response for search
            return responseUtils.success(res, {
                searchQuery,
                results: result.posts,
                pagination: result.pagination,
                // Optionally return applied filters for frontend display
                filters: {
                    category_id: category_id ? parsePositiveInt (category_id) : null,
                    user_id: user_id ? parsePositiveInt (user_id) : null,
                    status: finalStatus,
                    sort: sort || 'newest',
                    date_range: { from: date_from, to: date_to }
                }
            });
        } catch (error) {
            console.error('[PostController.searchPosts] Error:', error);
            return responseUtils.serverError(res, 'Failed to search posts');
        }
    }

    // [GET] /posts/my - Get posts created by the logged-in user
    async getMyPosts(req, res) {
        try {
            const userId = req.user?.id; // Get userId from authenticated user
            if (!userId) {
                return responseUtils.unauthorized(res, 'Authentication required');
            }

            const { page, limit, include_drafts } = req.query; // Allow client to request drafts

            const parsedPage = parseIntOrDefault(page, 1);
            const parsedLimit = parseIntOrDefault(limit, 10);
            // Convert include_drafts query param to boolean
            const shouldIncludeDrafts = include_drafts === 'true' || include_drafts === '1';

            const result = await postService.getUserPosts(userId, { // Pass userId and options object
                page: parsedPage,
                limit: parsedLimit,
                includeDrafts: shouldIncludeDrafts // Pass boolean based on query
            });

            return responseUtils.success(res, result);
        } catch (error) {
            console.error('[PostController.getMyPosts] Error:', error);
            return responseUtils.serverError(res, 'Failed to retrieve your posts');
        }
    }

    // Note: getMyDrafts might be redundant if getMyPosts accepts an `include_drafts` param
    // If you want a dedicated endpoint, it's fine:
    // async getMyDrafts(req, res) { ... call postService.getUserPosts(userId, { ..., includeDrafts: true }); ... }

    // [GET] /posts/category/:categoryId - Get posts by category ID
    async getPostsByCategory(req, res) {
        try {
            const { categoryId } = req.params;
            const { page, limit } = req.query;

            const parsedCategoryId = parsePositiveInt (categoryId);
            if (parsedCategoryId === null) {
                 return responseUtils.badRequest(res, 'Invalid Category ID');
            }

            const parsedPage = parseIntOrDefault(page, 1);
            const parsedLimit = parseIntOrDefault(limit, 10);

            const result = await postService.getPostsByCategory(parsedCategoryId, { // Pass categoryId and options object
                 page: parsedPage,
                 limit: parsedLimit
            });

            if (!result) {
                // Service returns null if category itself not found
                return responseUtils.notFound(res, 'Category not found');
            }

            return responseUtils.success(res, result);
        } catch (error) {
            console.error('[PostController.getPostsByCategory] Error:', error);
            return responseUtils.serverError(res, 'Failed to retrieve posts for this category');
        }
    }

    // [GET] /posts/author/:userId - Get posts by a specific author's ID
    async getPostsByAuthor(req, res) {
        try {
            const { userId } = req.params;
            const { page, limit, status, sort } = req.query;

            const parsedUserId = parsePositiveInt (userId);
            if (parsedUserId === null) {
                 return responseUtils.badRequest(res, 'Invalid User ID');
            }

            const parsedPage = parseIntOrDefault(page, 1);
            const parsedLimit = parseIntOrDefault(limit, 10);

            // Authorization check: Allow viewing non-published only by admin or the author themselves
            const requesterId = req.user?.id;
            const isAdmin = req.user?.role === 'Admin';
            const isOwner = requesterId === parsedUserId;

            // Default to 'published' unless authorized to see other statuses
            let finalStatus = 'published';
            if ((isAdmin || isOwner) && status) {
                finalStatus = status; // Allow authorized user to specify status
            }

            const result = await postService.getPostsByAuthor({ // Pass options object
                userId: parsedUserId,
                page: parsedPage,
                limit: parsedLimit,
                status: finalStatus,
                sort: sort || 'newest'
            });

            // Consider fetching author details separately if needed for the page
            // const author = await userService.getUserById(parsedUserId);
            // if (!author) return responseUtils.notFound(res, 'Author not found');

            return responseUtils.success(res, {
                // author: { id: author.id, username: author.username }, // Example
                ...result // Includes posts and pagination
            });
        } catch (error) {
            console.error('[PostController.getPostsByAuthor] Error:', error);
            return responseUtils.serverError(res, 'Failed to get author posts');
        }
    }

    // [GET] /posts/slug/:slug - Get a single post by its slug
    async getPostBySlug(req, res) {
        try {
            const { slug } = req.params;
            // Slug validation should happen in middleware
            const post = await postService.getPostBySlug(slug); // Increment views handled by service

            if (!post) {
                return responseUtils.notFound(res);
            }

            return responseUtils.success(res, { post }); // Return the full post object
        } catch (error) {
            console.error('[PostController.getPostBySlug] Error:', error);
            return responseUtils.serverError(res, 'Failed to retrieve post');
        }
    }

    // [GET] /posts/:id - Get a single post by its ID
    async getPostById(req, res) {
        try {
            const { id } = req.params;
            const parsedId = parsePositiveInt (id);

            if (parsedId === null) {
                 return responseUtils.badRequest(res, 'Invalid Post ID');
            }

            const post = await postService.getPostById(parsedId); // Increment views handled by service

            if (!post) {
                return responseUtils.notFound(res);
            }

            return responseUtils.success(res, { post }); // Return the full post object
        } catch (error) {
            console.error('[PostController.getPostById] Error:', error);
            return responseUtils.serverError(res, 'Failed to retrieve post');
        }
    }


    // [POST] /posts - Create a new post
    async createPost(req, res) {
        try {
            const userId = req.user?.id; // Get userId from authenticated user
            if (!userId) {
                return responseUtils.unauthorized(res, 'Authentication required');
            }
            const postData = req.body; // Assumes validation middleware has run

            const post = await postService.createPost(userId, postData);

            // Return 201 Created status with essential info
            return responseUtils.created(res, {
                message: 'Post created successfully',
                post: { // Return minimal info, client can fetch full post if needed
                    id: post.id,
                    title: post.title,
                    slug: post.slug,
                    status: post.status,
                    content : post.content, // Include content if needed
                    description: post.description, // Include description if needed
                    id_post_original: post.id_post_original // Include original post ID if applicable
                }
            });
        } catch (error) {
            // Handle potential specific errors like slug conflicts if service throws them
            console.error('[PostController.createPost] Error:', error);
             // Check for validation errors passed via request object if not using dedicated middleware error handler
            if (error.name === 'SequelizeValidationError') {
                 return responseUtils.badRequest(res, error.errors.map(e => e.message).join(', '));
            }
            return responseUtils.serverError(res, 'Failed to create post');
        }
    }

    // [PUT] /posts/:id - Update an existing post
    async updatePost(req, res) {
        try {
            const { id } = req.params;
            const parsedId = parsePositiveInt(id);
    
            if (parsedId === null || parsedId <= 0) {
                return responseUtils.badRequest(res, 'Invalid Post ID');
            }
    
            const userId = req.user?.id;
            const isAdmin = req.user?.role === 'Admin';
    
            if (!userId) {
                return responseUtils.unauthorized(res, 'Authentication required');
            }
    
            if (!req.body || Object.keys(req.body).length === 0) {
                return responseUtils.badRequest(res, 'No update data provided');
            }
    
            const updatedPost = await postService.updatePost(
                parsedId,
                userId,
                isAdmin,
                req.body
            );
    
            if (!updatedPost) {
                return responseUtils.notFound(res, 'Post not found or not authorized');
            }
    
            return responseUtils.success(res, {
                message: 'Post updated successfully',
                data: {
                    id: updatedPost.id,
                    title: updatedPost.title,
                    slug: updatedPost.slug,
                    status: updatedPost.status,
                    description: updatedPost.description,
                    preview: updatedPost.content?.substring(0, 200) || '',
                    metadata: {
                        originalPostId: updatedPost.id_post_original,
                        createdAt: updatedPost.created_at,
                        updatedAt: updatedPost.updated_at
                    }
                }
            });
    
        } catch (error) {
            console.error('[PostController] Update error:', error);
    
            switch (true) {
                case error.message.includes('Unauthorized'):
                    return responseUtils.forbidden(res, error.message);
    
                case error.name === 'SequelizeValidationError':
                    const firstError = error.errors?.[0]?.message || 'Validation error';
                    return responseUtils.badRequest(res, firstError);
    
                case error.name === 'SequelizeDatabaseError':
                    return responseUtils.badRequest(res, 'Invalid data format');
    
                default:
                    return responseUtils.serverError(res, 'Failed to update post');
            }
        }
    }
      
    // [DELETE] /posts/:id - Delete a post
    async deletePost(req, res) {
        try {
            const { id } = req.params;
             const parsedId = parsePositiveInt(id);

             if (parsedId === null) {
                 return responseUtils.badRequest(res, 'Invalid Post ID');
            }

            const userId = req.user?.id;
            const isAdmin = req.user?.role === 'Admin';

             if (!userId) {
                return responseUtils.unauthorized(res, 'Authentication required');
            }

            // Service method handles authorization check internally
            const success = await postService.deletePost(parsedId, userId, isAdmin);

            if (!success) {
                // This means the post wasn't found to begin with
                return responseUtils.notFound(res);
            }

            // Return 200 OK with a success message (or 204 No Content)
            return responseUtils.success(res, { message: 'Post deleted successfully' });
            // OR: return responseUtils.noContent(res);

        } catch (error) {
            console.error('[PostController.deletePost] Error:', error);
             // Handle specific errors thrown by the service
            if (error.message === 'Unauthorized to delete this post') {
                return responseUtils.unauthorized(res, error.message);
            }
            return responseUtils.serverError(res, 'Failed to delete post');
        }
    }
}

module.exports = new PostController();