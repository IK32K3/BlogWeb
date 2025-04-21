const slugify = require('slugify');
const { Op } = require('sequelize');
// Ensure you are importing the SINGULAR model names correctly defined in your models/index.js or definitions
const { Post, Categories, Media, User, PostMedia, PostTranslateLanguage, Language } = require('models'); // Assuming models are named singularly

class PostService {
  // Get all posts with pagination and filters
  async getAllPosts({ page = 1, limit = 10, categoryId, search, userId, sort, status }) { // Added status filter possibility based on validation
    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause = {};

    if (categoryId) whereClause.category_id = categoryId;
    if (userId) whereClause.user_id = userId;

    // Handle status filtering ('all' should not add a status clause)
    if (status && status !== 'all') {
        whereClause.status = status;
    }

    if (search) {
      // Ensure search works across potential translations too if needed,
      // otherwise this only searches the main Post table columns
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { content: { [Op.like]: `%${search}%` } },
        // Add description if it's a main column and should be searchable
        // { description: { [Op.like]: `%${search}%` } }
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
      include: this._getDefaultIncludes(),
      distinct: true // Recommended when using includes with limits/offsets
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

    if (incrementViews && post.status === 'published') { // Only increment views for published posts viewed by ID/Slug
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
      // Consider searching in translations if applicable
      [Op.or]: [
        { title: { [Op.like]: `%${query}%` } },
        { content: { [Op.like]: `%${query}%` } },
        // Only include description if it's a main post column
        // { description: { [Op.like]: `%${query}%` } }
      ]
    };

    // Apply filters
    if (category_id) where.category_id = category_id;
    if (user_id) where.user_id = user_id;
    if (status) where.status = status;
    // Removed default status setting here - let getAllPosts handle defaults if needed,
    // or let the route decide if 'published' is the default when no status is passed.

    // Date range filter (check column name, usually 'createdAt' or 'created_at')
    const createdAtColumn = Post.rawAttributes.createdAt ? 'createdAt' : 'created_at'; // Adjust if your column is named differently
    if (date_from || date_to) {
        where[createdAtColumn] = {};
        if (date_from) where[createdAtColumn][Op.gte] = new Date(date_from);
        if (date_to) where[createdAtColumn][Op.lte] = new Date(date_to);
    }


    // Build sort order
    let order;
    switch (sort) {
      case 'oldest': order = [[createdAtColumn, 'ASC']]; break;
      case 'most_viewed': order = [['views', 'DESC']]; break;
      default: order = [[createdAtColumn, 'DESC']]; // newest
    }

    const { count, rows } = await Post.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order,
      include: [ // Use minimal includes needed for search results list
        {
          model: User,
          as: 'user', // Ensure 'user' alias is defined in Post model associations
          attributes: ['id', 'username']
        },
        {
          model: Categories, // Corrected: Singular model name
          as: 'categories', // Corrected: Likely singular alias matching association
          attributes: ['id', 'name']
        }
        // Add other includes only if necessary for the search result display
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

    if (incrementViews && post.status === 'published') { // Only increment views for published posts
      await post.increment('views');
    }

    return post;
  }

  // Create new post
  async createPost(userId, postData) {
    const {
      title,
      content,
      description, // Assuming description is a main column
      category_id,
      media_ids = [],
      translations = [],
      status = 'draft',
      scheduled_at // Added from validation
    } = postData;

    // Validate slug uniqueness before creating
    let baseSlug = slugify(title, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g });
    let slug = baseSlug;
    let slugExists = true;
    let counter = 1;
    while(slugExists) {
        const existingPost = await Post.findOne({ where: { slug: slug }, attributes: ['id'] });
        if (!existingPost) {
            slugExists = false;
        } else {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }
    }


    // Create post
    const post = await Post.create({
      title,
      content,
      description,
      user_id: userId,
      category_id,
      slug, // Use the generated unique slug
      status,
      scheduled_at: status === 'scheduled' ? scheduled_at : null, // Set scheduled_at only if status is scheduled    }, {
      fields: ['title', 'content', 'description', 'user_id', 'category_id', 'slug', 'status', 'scheduled_at',]

    });

    // Attach media to post
    if (media_ids.length > 0) {
      // Ensure featured_media_id is part of media_ids if provided
      await this._attachMediaToPost(post.id, media_ids);
    }

    // Add translations if provided
    if (translations.length > 0) {
      await this._addPostTranslations(post.id, translations);
    }

    // Return the post with details if needed immediately
    return this.getPostById(post.id, false); // Fetch with includes, don't increment views
  }


  // Update post
  async updatePost(postId, userId, isAdmin, updateData) {
    const post = await Post.findByPk(postId);
    if (!post) return null; // Or throw specific NotFoundError

    // Check authorization
    if (post.user_id !== userId && !isAdmin) {
        // Consider throwing a specific AuthorizationError
        throw new Error('Unauthorized to update this post');
    }

    const { title, media_ids, translations, status, scheduled_at, ...otherUpdateData } = updateData;

    // Prepare data for update
    const dataToUpdate = { ...otherUpdateData };

    if (title !== undefined && title !== post.title) {
        dataToUpdate.title = title;
        // Generate and check unique slug if title changes
        let baseSlug = slugify(title, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g });
        let newSlug = baseSlug;
        let slugExists = true;
        let counter = 1;
        while(slugExists) {
            const existingPost = await Post.findOne({ where: { slug: newSlug, id: { [Op.ne]: postId } }, attributes: ['id'] }); // Check slug excluding current post
            if (!existingPost) {
                slugExists = false;
            } else {
                newSlug = `${baseSlug}-${counter}`;
                counter++;
            }
        }
        dataToUpdate.slug = newSlug;
    }

    if (status !== undefined) {
        dataToUpdate.status = status;
        // Handle scheduled_at based on status
        if (status === 'scheduled' && scheduled_at) {
            dataToUpdate.scheduled_at = scheduled_at;
        } else if (status !== 'scheduled') {
             // Set scheduled_at to null if status is no longer scheduled
            dataToUpdate.scheduled_at = null;
        }
    } else if (scheduled_at !== undefined && post.status === 'scheduled') {
         // Allow updating scheduled_at if status is already scheduled
        dataToUpdate.scheduled_at = scheduled_at;
    }

    // Update post main fields
    await post.update(dataToUpdate);

    // Update media (replace all if provided)
    if (media_ids !== undefined) {
      await this._updatePostMedia(post.id, media_ids);
    }
  
    // Update translations if provided
    if (translations !== undefined) {
      await this._updatePostTranslations(post.id, translations);
    }
  
    return this.getPostById(postId, false);
  }

  // Delete post
  async deletePost(postId, userId, isAdmin) {
    const post = await Post.findByPk(postId);
    if (!post) return false; // Indicate not found

    // Check authorization
    if (post.user_id !== userId && !isAdmin) {
      // Consider throwing a specific AuthorizationError
      throw new Error('Unauthorized to delete this post');
    }

    // Sequelize transactions might be good here if deleting related data
    // e.g., delete related PostMedia, PostTranslateLanguage first if using CASCADE isn't set/desired

    await post.destroy();
    return true; // Indicate success
  }

  // Get posts by category
  async getPostsByCategory(categoryId, { page = 1, limit = 10 }) {
    const offset = (page - 1) * limit;
    const createdAtColumn = Post.rawAttributes.createdAt ? 'createdAt' : 'created_at';

    // Check if category exists first is good practice
    const category = await Categories.findByPk(categoryId, { attributes: ['id', 'name', 'slug'] }); // Fetch needed category details
    if (!category) return null; // Or throw NotFoundError

    // Fetch posts
    const { count, rows: posts } = await Post.findAndCountAll({
      where: {
        category_id: categoryId,
        status: 'published' // Typically only show published posts in category listings
      },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[createdAtColumn, 'DESC']],
      include: this._getDefaultIncludes(), // Use default includes for lists
      distinct: true
    });

    return {
      category, // Return category details along with posts
      posts,
      pagination: {
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    };
  }

  // Get user's own posts (e.g., for a dashboard)
  async getUserPosts(userId, { page = 1, limit = 10, includeDrafts = false }) {
    const offset = (page - 1) * limit;
    const createdAtColumn = Post.rawAttributes.createdAt ? 'createdAt' : 'created_at';

    const whereClause = { user_id: userId };
    // Adjust status filtering based on includeDrafts or other potential statuses
    if (!includeDrafts) {
        // Maybe fetch 'published' and 'scheduled' by default, or allow specifying statuses
        whereClause.status = { [Op.in]: ['published', 'scheduled'] };
    } // If includeDrafts is true, no status clause needed, fetches all

    const { count, rows: posts } = await Post.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[createdAtColumn, 'DESC']],
      include: this._getDefaultIncludes(), // Default includes are usually sufficient here
      distinct: true
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

  // Get public posts by a specific author/user
  async getPostsByAuthor({ // Renamed from internal _getPostsByAuthor
    userId,
    page = 1,
    limit = 10,
    status = 'published', // Default to published for public view
    sort = 'newest'
  }) {
    const offset = (page - 1) * limit;
    const createdAtColumn = Post.rawAttributes.createdAt ? 'createdAt' : 'created_at';

    // Build where conditions
    const where = {
      user_id: userId
    };

    // Apply status filter if provided (allow overriding the default)
    if (status) {
      where.status = status;
    }

    // Build sort order
    let order;
    switch (sort) {
      case 'oldest': order = [[createdAtColumn, 'ASC']]; break;
      case 'most_viewed': order = [['views', 'DESC']]; break;
      default: order = [[createdAtColumn, 'DESC']]; // newest
    }

    const { count, rows } = await Post.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order,
      include: [ // Include necessary details for public author page
        {
          model: Categories,      // Corrected: Singular
          as: 'categories',     // Corrected: Singular alias (verify in model)
          attributes: ['id', 'name', 'slug'] // Include slug for linking
        },
        // Include featured media if desired for list display
        {
            model: PostMedia,
            as: 'postMedia', // Ensure alias matches model definition
            required: false,
            where: { is_featured: true },
            include: [{ model: Media, as: 'media' }] // Ensure alias matches model definition
        },
        // Don't include translations unless you specifically need language info in the list
         {
           model: PostTranslateLanguage,
           as: 'postTranslateLanguage', // VERIFY THIS ALIAS in Post model associations
           attributes: ['language_id'] // Only fetch language ID if needed
         }
      ],
      distinct: true
    });


    return {
      // author, // Optionally return author details
      posts: rows,
      pagination: {
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    };
  }


  // --- Helper Methods ---

  _getSortOrder(sort) {
    const createdAtColumn = Post.rawAttributes.createdAt ? 'createdAt' : 'created_at';
    switch (sort) {
      case 'oldest': return [[createdAtColumn, 'ASC']];
      case 'most_viewed': return [['views', 'DESC']];
      case 'title_asc': return [['title', 'ASC']];
      case 'title_desc': return [['title', 'DESC']];
      case 'latest': // Fallthrough intentional
      default: return [[createdAtColumn, 'DESC']];
    }
  }

  _getDefaultIncludes() {
    // Includes suitable for list views (index pages, category pages, user dashboards)
    return [
      {
        model: User,
        as: 'user', // Ensure 'user' alias is defined in Post model
        attributes: ['id', 'username'] // Add other needed attributes like avatar
      },
      {
        model: Categories,
        as: 'categories', // Ensure 'category' alias is defined in Post model
        attributes: ['id', 'name', 'slug'] // Include slug for links
      },
      {
        model: PostMedia,
        as: 'postMedia', // Use the correct alias defined in Post model associations
        required: false, // Left join: don't exclude posts without featured media
        where: { is_featured: true },
        include: [{
            model: Media,
            as: 'media', // Use the correct alias defined in PostMedia model associations
            attributes: ['id', 'url', 'type'] // Get necessary media attributes
        }]
      }
    ];
  }

  _getDetailedIncludes() {
    // Includes suitable for single post view (getById, getBySlug)
    return [
      {
        model: User,
        as: 'user', // Ensure 'user' alias is defined in Post model
        attributes: ['id', 'username'] // Add more user details if needed
      },
      {
        model: Categories,
        as: 'categories', // Ensure 'category' alias is defined in Post model
        attributes: ['id', 'name', 'slug']
      },
      {
        model: PostMedia,
        as: 'postMedia', // Use the correct alias defined in Post model associations
        attributes: ['is_featured', 'media_id'], // Include is_featured flag
        include: [{
            model: Media,
            as: 'media', // Use the correct alias defined in PostMedia model associations
            attributes: ['id', 'url', 'type'] // Get all necessary media attributes
        }]
      },
      {
        model: PostTranslateLanguage,
        as: 'postTranslateLanguage', // VERIFY THIS ALIAS in Post model associations
        include: [{
            model: Language,
            as: 'language', // Ensure 'language' alias is defined in PostTranslateLanguage model
            attributes: ['id', 'locale', 'name'] // Get language details
        }]
      }
      // Include Tags if you have a Tag model and PostTag join table
      // { model: Tag, as: 'tags', through: { attributes: [] } }
    ];
  }

  async _attachMediaToPost(postId, mediaIds) {
    // Ensure mediaIds are unique
    const uniqueMediaIds = [...new Set(mediaIds)];

    const mediaEntries = uniqueMediaIds.map(media_id => ({
      post_id: postId,
      media_id: parseInt(media_id, 10), // Ensure IDs are numbers
      // Set featured flag correctly, ensuring only one can be true
    }));

    if (mediaEntries.length > 0) {
        await PostMedia.bulkCreate(mediaEntries, { ignoreDuplicates: true }); // Ignore if somehow a duplicate PK is formed
    }
  }


  async _addPostTranslations(postId, translations) {
    const translationEntries = translations.map(translation => ({
      post_id: postId,
      language_id: translation.language_id,
      title: translation.title,
      content: translation.content,
      description: translation.description,
      // is_original flag might be managed differently, ensure logic is correct
      is_original: translation.is_original || false
    }));

    if (translationEntries.length > 0) {
        await PostTranslateLanguage.bulkCreate(translationEntries);
    }
  }

  async _updatePostMedia(postId, mediaIds, featuredMediaId) {
    // Ensure mediaIds contains numbers
    const numericMediaIds = mediaIds.map(id => parseInt(id, 10)).filter(id => !isNaN(id));
    const numericFeaturedMediaId = featuredMediaId ? parseInt(featuredMediaId, 10) : null;

    // 1. Find existing media associations for this post
    const existingMedia = await PostMedia.findAll({ where: { post_id: postId }, attributes: ['media_id'] });
    const existingMediaIds = existingMedia.map(pm => pm.media_id);

    // 2. Determine which media to add and which to remove
    const mediaToAdd = numericMediaIds.filter(id => !existingMediaIds.includes(id));
    const mediaToRemove = existingMediaIds.filter(id => !numericMediaIds.includes(id));

    // 3. Remove associations no longer needed
    if (mediaToRemove.length > 0) {
      await PostMedia.destroy({ where: { post_id: postId, media_id: { [Op.in]: mediaToRemove } } });
    }

    // 4. Add new associations
    if (mediaToAdd.length > 0) {
      const mediaEntries = mediaToAdd.map(media_id => ({
        post_id: postId,
        media_id,
      }));
      await PostMedia.bulkCreate(mediaEntries);
    }

  }

  async _updatePostTranslations(postId, translations) {
      // Use transaction for updating multiple translations
      const transaction = await Post.sequelize.transaction();
      try {
          // Option 1: Delete existing and bulk insert (simpler if full replacement is okay)
          // await PostTranslateLanguage.destroy({ where: { post_id: postId }, transaction });
          // await this._addPostTranslations(postId, translations); // Reuse add helper within transaction

          // Option 2: Upsert logic (findOrCreate/update) - handles partial updates better
          for (const translation of translations) {
              const { language_id, title, content, description, is_original } = translation;
              const [transRecord, created] = await PostTranslateLanguage.findOrCreate({
                  where: { post_id: postId, language_id: language_id },
                  defaults: {
                      title,
                      content,
                      description,
                      is_original: is_original || false
                  },
                  transaction
              });

              if (!created) {
                  // If record existed, update it
                  await transRecord.update({
                      title,
                      content,
                      description,
                      // Decide how to handle is_original on update - keep existing? overwrite?
                      is_original: is_original !== undefined ? is_original : transRecord.is_original
                  }, { transaction });
              }
          }
          // Optionally, delete translations that were present before but are not in the new `translations` array.
          const currentLanguageIds = translations.map(t => t.language_id);
          await PostTranslateLanguage.destroy({
              where: {
                  post_id: postId,
                  language_id: { [Op.notIn]: currentLanguageIds }
              },
              transaction
          });


          await transaction.commit();
      } catch (error) {
          await transaction.rollback();
          console.error("Error updating post translations:", error);
          throw error; // Re-throw the error to be handled upstream
      }
  }
}

// Export a single instance
module.exports = new PostService();