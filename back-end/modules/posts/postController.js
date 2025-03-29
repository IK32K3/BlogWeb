const slugify = require('slugify');
const { Op } = require('sequelize');
const { Post, categories, media, User, post_media, post_translate_language, language } = require('models');
const responseUtils = require('utils/responseUtils');

const postController = {
  // Get all posts (with pagination and filters)
  getAllPosts: async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        category_id, 
        search, 
        user_id,
        sort = 'latest' 
      } = req.query;
      
      const offset = (page - 1) * limit;
      
      // Build where clause
      const whereClause = {};
      
      if (category_id) {
        whereClause.category_id = category_id;
      }
      
      if (user_id) {
        whereClause.user_id = user_id;
      }
      
      if (search) {
        whereClause[Op.or] = [
          { title: { [Op.like]: `%${search}%` } },
          { content: { [Op.like]: `%${search}%` } }
        ];
      }
      
      // Build order clause
      let orderClause;
      switch (sort) {
        case 'oldest':
          orderClause = [['created_at', 'ASC']];
          break;
        case 'most_viewed':
          orderClause = [['views', 'DESC']];
          break;
        case 'title_asc':
          orderClause = [['title', 'ASC']];
          break;
        case 'title_desc':
          orderClause = [['title', 'DESC']];
          break;
        default: // latest
          orderClause = [['created_at', 'DESC']];
      }
      
      // Fetch posts
      const { count, rows: posts } = await Post.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: orderClause,
        include: [
          { model: User, attributes: ['id', 'username'] },
          { model: categories, attributes: ['id', 'name'] },
          { 
            model: post_media,
            include: [{ model: media }],
            where: { is_featured: true },
            required: false
          }
        ]
      });
      
      const totalPages = Math.ceil(count / limit);
      
      return responseUtils.ok(res, {
        posts,
        pagination: {
          total: count,
          totalPages,
          currentPage: parseInt(page),
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Get all posts error:', error);
      return responseUtils.error(res, error.message);
    }
  },
  
  // Get post by ID
  getPostById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const post = await Post.findByPk(id, {
        include: [
          { model: User, attributes: ['id', 'username'] },
          { model: categories, attributes: ['id', 'name'] },
          { 
            model: post_media,
            include: [{ model: media }]
          },
          {
            model: post_translate_language,
            include: [{ model: language }]
          }
        ]
      });
      
      if (!post) {
        return responseUtils.notFound(res);
      }
      
      // Increment view count
      await post.increment('views');
      
      return responseUtils.ok(res, { post });
    } catch (error) {
      console.error('Get post by ID error:', error);
      return responseUtils.error(res, error.message);
    }
  },
  
  // Create new post
  createPost: async (req, res) => {
    try {
      const { 
        title, 
        content, 
        description, 
        category_id, 
        media_ids = [],
        featured_media_id,
        translations = []
      } = req.body;
      
      const user_id = req.user.id;
      
      // Create slug from title
      const slug = slugify(title, {
        lower: true,
        strict: true
      });
      
      // Create post
      const post = await Post.create({
        title,
        content,
        description,
        user_id,
        category_id,
        slug,
        views: 0
      });
      
      // Attach media to post
      if (media_ids.length > 0) {
        const mediaEntries = media_ids.map(media_id => ({
          post_id: post.id,
          media_id,
          is_featured: media_id === featured_media_id
        }));
        
        await post_media.bulkCreate(mediaEntries);
      }
      
      // Add translations if provided
      if (translations.length > 0) {
        const translationEntries = translations.map(translation => ({
          post_id: post.id,
          language_id: translation.language_id,
          title: translation.title,
          content: translation.content,
          description: translation.description,
          is_original: translation.is_original || false
        }));
        
        await post_translate_language.bulkCreate(translationEntries);
      }
      
      return responseUtils.ok(res, { 
        message: 'Post created successfully',
        post: {
          id: post.id,
          title: post.title,
          slug: post.slug
        }
      });
    } catch (error) {
      console.error('Create post error:', error);
      return responseUtils.error(res, error.message);
    }
  },
  
  // Update post
  updatePost: async (req, res) => {
    try {
      const { id } = req.params;
      const { 
        title, 
        content, 
        description, 
        category_id, 
        media_ids,
        featured_media_id,
        translations
      } = req.body;
      
      // Find post
      const post = await Post.findByPk(id);
      
      if (!post) {
        return responseUtils.notFound(res);
      }
      
      // Check if user is the owner or admin
      if (post.user_id !== req.user.id && req.user.role !== 'Admin') {
        return responseUtils.unauthorized(res, 'You are not authorized to update this post');
      }
      
      // Update slug if title changes
      let slug = post.slug;
      if (title && title !== post.title) {
        slug = slugify(title, {
          lower: true,
          strict: true
        });
      }
      
      // Update post
      await post.update({
        title: title || post.title,
        content: content || post.content,
        description: description || post.description,
        category_id: category_id || post.category_id,
        slug
      });
      
      // Update media if provided
      if (media_ids && media_ids.length > 0) {
        // Delete existing media associations
        await post_media.destroy({ where: { post_id: post.id } });
        
        // Create new media associations
        const mediaEntries = media_ids.map(media_id => ({
          post_id: post.id,
          media_id,
          is_featured: media_id === featured_media_id
        }));
        
        await post_media.bulkCreate(mediaEntries);
      }
      
      // Update translations if provided
      if (translations && translations.length > 0) {
        for (const translation of translations) {
          const [transRecord, created] = await post_translate_language.findOrCreate({
            where: {
              post_id: post.id,
              language_id: translation.language_id
            },
            defaults: {
              title: translation.title,
              content: translation.content,
              description: translation.description,
              is_original: translation.is_original || false
            }
          });
          
          if (!created) {
            await transRecord.update({
              title: translation.title,
              content: translation.content,
              description: translation.description,
              is_original: translation.is_original || transRecord.is_original
            });
          }
        }
      }
      
      return responseUtils.ok(res, { 
        message: 'Post updated successfully',
        post: {
          id: post.id,
          title: post.title,
          slug: post.slug
        }
      });
    } catch (error) {
      console.error('Update post error:', error);
      return responseUtils.error(res, error.message);
    }
  },
  
  // Delete post
  deletePost: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Find post
      const post = await Post.findByPk(id);
      
      if (!post) {
        return responseUtils.notFound(res);
      }
      
      // Check if user is the owner or admin
      if (post.user_id !== req.user.id && req.user.role !== 'Admin') {
        return responseUtils.unauthorized(res, 'You are not authorized to delete this post');
      }
      
      // Delete post (cascade will handle related records)
      await post.destroy();
      
      return responseUtils.ok(res, { message: 'Post deleted successfully' });
    } catch (error) {
      console.error('Delete post error:', error);
      return responseUtils.error(res, error.message);
    }
  },
  
  // Get posts by category
  getPostsByCategory: async (req, res) => {
    try {
      const { categoryId } = req.params;
      const { page = 1, limit = 10 } = req.query;
      
      const offset = (page - 1) * limit;
      
      // Check if category exists
      const category = await categories.findByPk(categoryId);
      
      if (!category) {
        return responseUtils.notFound(res);
      }
      
      // Fetch posts
      const { count, rows: posts } = await Post.findAndCountAll({
        where: { category_id: categoryId },
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']],
        include: [
          { model: User, attributes: ['id', 'username'] },
          { 
            model: post_media,
            include: [{ model: media }],
            where: { is_featured: true },
            required: false
          }
        ]
      });
      
      const totalPages = Math.ceil(count / limit);
      
      return responseUtils.ok(res, {
        category: {
          id: category.id,
          name: category.name
        },
        posts,
        pagination: {
          total: count,
          totalPages,
          currentPage: parseInt(page),
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Get posts by category error:', error);
      return responseUtils.error(res, error.message);
    }
  },
  
  // Get user's own posts
  getMyPosts: async (req, res) => {
    try {
      const user_id = req.user.id;
      const { page = 1, limit = 10 } = req.query;
      
      const offset = (page - 1) * limit;
      
      // Fetch posts
      const { count, rows: posts } = await Post.findAndCountAll({
        where: { user_id },
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']],
        include: [
          { model: categories, attributes: ['id', 'name'] },
          { 
            model: post_media,
            include: [{ model: media }],
            where: { is_featured: true },
            required: false
          }
        ]
      });
      
      const totalPages = Math.ceil(count / limit);
      
      return responseUtils.ok(res, {
        posts,
        pagination: {
          total: count,
          totalPages,
          currentPage: parseInt(page),
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Get my posts error:', error);
      return responseUtils.error(res, error.message);
    }
  }
};

module.exports = postController;