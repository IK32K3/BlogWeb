const slugify = require('slugify');
const { Op } = require('sequelize');
const { Post, Category, Media, User, PostMedia, PostTranslateLanguage, Language } = require('models');

class PostService {
  // Get all posts with pagination and filters
  async getAllPosts({ page = 1, limit = 10, categoryId, search, userId, sort = 'latest' }) {
    const offset = (page - 1) * limit;
    
    // Build where clause
    const whereClause = {};
    
    if (categoryId) whereClause.category_id = categoryId;
    if (userId) whereClause.user_id = userId;
    
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { content: { [Op.like]: `%${search}%` } }
      ];
    }
    
    // Build order clause
    const orderClause = this._getSortOrder(sort);
    
    // Fetch posts
    const { count, rows: posts } = await Post.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: orderClause,
      include: this._getDefaultIncludes()
    });
    
    return {
      posts,
      pagination: {
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    };
  }

  // Get post by ID
  async getPostById(id, incrementViews = true) {
    const post = await Post.findByPk(id, {
      include: this._getDetailedIncludes()
    });

    if (!post) return null;

    if (incrementViews) {
      await post.increment('views');
    }

    return post;
  }
  // search posts
  async searchPosts({
    query,
    page = 1,
    limit = 10,
    category_id,
    user_id,
    status,
    sort = 'newest',
    date_from,
    date_to
  }) {
    const offset = (page - 1) * limit;
    
    // Build search conditions
    const where = {
      [Op.or]: [
        { title: { [Op.like]: `%${query}%` } },
        { content: { [Op.like]: `%${query}%` } },
        { description: { [Op.like]: `%${query}%` } }
      ]
    };

    // Apply filters
    if (category_id) where.category_id = category_id;
    if (user_id) where.user_id = user_id;
    if (status) where.status = status;
    else where.status = 'published'; // Default to published only

    // Date range filter
    if (date_from || date_to) {
      where.created_at = {};
      if (date_from) where.created_at[Op.gte] = new Date(date_from);
      if (date_to) where.created_at[Op.lte] = new Date(date_to);
    }

    // Build sort order
    let order;
    switch (sort) {
      case 'oldest': order = [['created_at', 'ASC']]; break;
      case 'most_viewed': order = [['views', 'DESC']]; break;
      default: order = [['created_at', 'DESC']]; // newest
    }

    const { count, rows } = await Post.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order,
      include: [
        { 
          model: User, 
          as: 'user',
          attributes: ['id', 'username']
        },
        {
          model: Categories,
          as: 'categories',
          attributes: ['id', 'name']
        }
      ],
      distinct: true
    });

    return {
      posts: rows,
      pagination: {
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    };
  }
  // Get post by slug
  async getPostBySlug(slug, incrementViews = true) {
    const post = await Post.findOne({
      where: { slug },
      include: this._getDetailedIncludes()
    });

    if (!post) return null;

    if (incrementViews) {
      await post.increment('views');
    }

    return post;
  }

  // Create new post
  async createPost(userId, postData) {
    const { 
      title, 
      content, 
      description, 
      category_id, 
      media_ids = [],
      featured_media_id,
      translations = [],
      status = 'draft'
    } = postData;
    
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
      user_id: userId,
      category_id,
      slug,
      status,
      views: 0
    });
    
    // Attach media to post
    if (media_ids.length > 0) {
      await this._attachMediaToPost(post.id, media_ids, featured_media_id);
    }
    
    // Add translations if provided
    if (translations.length > 0) {
      await this._addPostTranslations(post.id, translations);
    }
    
    return post;
  }

  // Update post
  async updatePost(postId, userId, isAdmin, updateData) {
    const post = await Post.findByPk(postId);
    if (!post) return null;
    
    // Check authorization
    if (post.user_id !== userId && !isAdmin) {
      throw new Error('Unauthorized to update this post');
    }
    
    // Update slug if title changes
    if (updateData.title && updateData.title !== post.title) {
      updateData.slug = slugify(updateData.title, {
        lower: true,
        strict: true
      });
    }
    
    // Update post
    await post.update(updateData);
    
    // Update media if provided
    if (updateData.media_ids) {
      await this._updatePostMedia(post.id, updateData.media_ids, updateData.featured_media_id);
    }
    
    // Update translations if provided
    if (updateData.translations) {
      await this._updatePostTranslations(post.id, updateData.translations);
    }
    
    return post;
  }

  // Delete post
  async deletePost(postId, userId, isAdmin) {
    const post = await Post.findByPk(postId);
    if (!post) return false;
    
    // Check authorization
    if (post.user_id !== userId && !isAdmin) {
      throw new Error('Unauthorized to delete this post');
    }
    
    await post.destroy();
    return true;
  }

  // Get posts by category
  async getPostsByCategory(categoryId, { page = 1, limit = 10 }) {
    const offset = (page - 1) * limit;
    
    // Check if category exists
    const category = await Category.findByPk(categoryId);
    if (!category) return null;
    
    // Fetch posts
    const { count, rows: posts } = await Post.findAndCountAll({
      where: { category_id: categoryId },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
      include: this._getDefaultIncludes()
    });
    
    return {
      category,
      posts,
      pagination: {
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    };
  }

  // Get user's posts
  async getUserPosts(userId, { page = 1, limit = 10, includeDrafts = false }) {
    const offset = (page - 1) * limit;
    
    const whereClause = { user_id: userId };
    if (!includeDrafts) {
      whereClause.status = 'published';
    }
    
    const { count, rows: posts } = await Post.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
      include: this._getDefaultIncludes()
    });
    
    return {
      posts,
      pagination: {
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    };
  }

  // Helper methods
  _getSortOrder(sort) {
    switch (sort) {
      case 'oldest': return [['created_at', 'ASC']];
      case 'most_viewed': return [['views', 'DESC']];
      case 'title_asc': return [['title', 'ASC']];
      case 'title_desc': return [['title', 'DESC']];
      default: return [['created_at', 'DESC']]; // latest
    }
  }

  _getDefaultIncludes() {
    return [
      { model: User, attributes: ['id', 'username'] },
      { model: Category, attributes: ['id', 'name'] },
      { 
        model: PostMedia,
        include: [{ model: Media }],
        where: { is_featured: true },
        required: false
      }
    ];
  }

  _getDetailedIncludes() {
    return [
      { model: User, attributes: ['id', 'username'] },
      { model: Category, attributes: ['id', 'name'] },
      { 
        model: PostMedia,
        include: [{ model: Media }]
      },
      {
        model: PostTranslateLanguage,
        include: [{ model: Language }]
      }
    ];
  }

  async _attachMediaToPost(postId, mediaIds, featuredMediaId) {
    const mediaEntries = mediaIds.map(media_id => ({
      post_id: postId,
      media_id,
      is_featured: media_id === featuredMediaId
    }));
    
    await PostMedia.bulkCreate(mediaEntries);
  }

  async _addPostTranslations(postId, translations) {
    const translationEntries = translations.map(translation => ({
      post_id: postId,
      language_id: translation.language_id,
      title: translation.title,
      content: translation.content,
      description: translation.description,
      is_original: translation.is_original || false
    }));
    
    await PostTranslateLanguage.bulkCreate(translationEntries);
  }

  async _updatePostMedia(postId, mediaIds, featuredMediaId) {
    // Delete existing media associations
    await PostMedia.destroy({ where: { post_id: postId } });
    
    // Create new media associations
    if (mediaIds.length > 0) {
      await this._attachMediaToPost(postId, mediaIds, featuredMediaId);
    }
  }
  // Get posts by author
  async getPostsByAuthor({
    userId,
    page = 1,
    limit = 10,
    status,
    sort = 'newest'
  }) {
    const offset = (page - 1) * limit;
    
    // Build where conditions
    const where = {
      user_id: userId
    };

    // Apply status filter if provided
    if (status) {
      where.status = status;
    }

    // Build sort order
    let order;
    switch (sort) {
      case 'oldest': order = [['created_at', 'ASC']]; break;
      case 'most_viewed': order = [['views', 'DESC']]; break;
      default: order = [['created_at', 'DESC']]; // newest
    }

    const { count, rows } = await Post.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order,
      include: [
        { 
          model: Categories,
          as: 'categories',
          attributes: ['id', 'name']
        },
        {
          model: PostTranslateLanguage,
          as: 'post_translate_language',
          attributes: ['language_id']
        }
      ],
      distinct: true
    });

    return {
      posts: rows,
      pagination: {
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    };
  }
  // Get posts by author with translations
  async _updatePostTranslations(postId, translations) {
    for (const translation of translations) {
      const [transRecord, created] = await PostTranslateLanguage.findOrCreate({
        where: {
          post_id: postId,
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
}

module.exports = new PostService();