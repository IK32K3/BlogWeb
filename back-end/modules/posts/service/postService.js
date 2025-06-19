const slugify = require('slugify');
const { Op } = require('sequelize');
// Ensure you are importing the SINGULAR model names correctly defined in your models/index.js or definitions
const db = require('models'); // Import your models
const { Post, Categories, User, PostTranslateLanguage, Language } = db; // Removed Media and PostMedia
const { uploadToCloudinary } = require('../../../configs/cloudinary');


class postService {
  // Get all posts with pagination and filters
  /**
   * [HỢP NHẤT & TỐI ƯU] Lấy danh sách bài viết với bộ lọc linh hoạt.
   * Thay thế cho cả getAllPosts và searchPosts.
   */
  async getPosts({
    page = 1,
    limit = 10,
    search,
    categoryId,
    userId,
    status,
    sort,
    dateFrom,
    dateTo,
    search_priority,
    relevance_sort
  }) {
    const offset = (page - 1) * limit;

    // Xây dựng điều kiện WHERE một cách linh hoạt
    const whereClause = {};
    if (status && status !== 'all') {
      whereClause.status = status;
    }
    if (categoryId) {
      whereClause.category_id = categoryId;
    }
    if (userId) {
      whereClause.user_id = userId;
    }
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { content: { [Op.like]: `%${search}%` } }
      ];
    }
    if (dateFrom || dateTo) {
      whereClause.created_at = {};
      if (dateFrom) whereClause.created_at[Op.gte] = dateFrom;
      if (dateTo) whereClause.created_at[Op.lte] = dateTo;
    }

    // Build sort order with relevance priority
    let orderClause = [];
    
    // Nếu có yêu cầu sắp xếp theo độ liên quan và có search
    if (relevance_sort && search && search.trim().length > 0) {
      // Ưu tiên sắp xếp theo độ liên quan của search
      orderClause.push([
        Post.sequelize.literal(`
          CASE 
            WHEN title LIKE '%${search}%' THEN 1
            WHEN content LIKE '%${search}%' THEN 2
            ELSE 3
          END
        `),
        'ASC'
      ]);
    }
    
    // Thêm sắp xếp theo sort nếu có
    if (sort) {
      const sortOrder = this._getSortOrder(sort);
      orderClause = orderClause.concat(sortOrder);
    }
    
    // Nếu không có sort nào, sắp xếp theo thời gian tạo
    if (orderClause.length === 0) {
      orderClause = [['created_at', 'DESC']];
    }

    const { count, rows: posts } = await Post.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: orderClause,
      include: this._getDefaultIncludes(),
      distinct: true // Important for correct count with includes
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

  // ... (Các hàm getPostById, getPostBySlug, getPostsByCategory, getUserPosts không thay đổi nhiều)


  // Get post by ID
  async getPostById(id, incrementViews = true) {
    const post = await Post.findByPk(id, {
      include: this._getDetailedIncludes()
    });

    if (!post) return null;

    if (incrementViews && post.status === 'published') {
      await post.increment('views');
    }

    return post;
  }

  // search posts
  async searchPosts({
    query,
    page = 1,
    limit = 10,
    categories,
    user_id,
    status,
    sort_by,
    sort_order,
    date_from,
    date_to,
    search_priority,
    relevance_sort
  }) {
    const offset = (page - 1) * limit;

    // Build search conditions
    const where = {
      [Op.or]: [
        { title: { [Op.like]: `%${query}%` } },
        { content: { [Op.like]: `%${query}%` } }
      ]
    };

    // Apply filters
    if (categories && categories.length > 0) {
        where.category_id = { [Op.in]: categories };
    }
    if (user_id) where.user_id = user_id;
    if (status) where.status = status;

    // Date range filter
    const createdAtColumn = Post.rawAttributes.createdAt ? 'createdAt' : 'created_at';
    if (date_from || date_to) {
        where[createdAtColumn] = {};
        if (date_from) where[createdAtColumn][Op.gte] = new Date(date_from);
        if (date_to) where[createdAtColumn][Op.lte] = new Date(date_to);
    }

    // Build sort order with relevance priority
    let order = [];
    
    // Nếu có yêu cầu sắp xếp theo độ liên quan và có query search
    if (relevance_sort && query && query.trim().length > 0) {
      // Ưu tiên sắp xếp theo độ liên quan của search
      order.push([
        Post.sequelize.literal(`
          CASE 
            WHEN title LIKE '%${query}%' THEN 1
            WHEN content LIKE '%${query}%' THEN 2
            ELSE 3
          END
        `),
        'ASC'
      ]);
    }
    
    // Thêm sắp xếp theo sort_by nếu có
    if (sort_by) {
        const columnMap = {
            views: 'views',
            comments: 'comments'
        };
        const columnName = columnMap[sort_by] || sort_by;
        const orderDirection = sort_order && sort_order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
        order.push([columnName, orderDirection]);
    }

    // Nếu không có sort nào, sắp xếp theo thời gian tạo
    if (order.length === 0) {
         order.push([createdAtColumn, 'DESC']);
    }

    const { count, rows } = await Post.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order,
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username']
        },
        {
          model: Categories,
          as: 'category',
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

    if (incrementViews && post.status === 'published') {
      await post.increment('views');
    }

    return post;
  }

  /**
   * [CẬP NHẬT] Tạo bài viết mới, tích hợp upload thumbnail và bản dịch.
   * @param {object} postData - Dữ liệu chính của bài viết (title, content, etc.)
   * @param {Array} translations - Mảng các bản dịch.
   * @param {object} thumbnailFile - File thumbnail từ multer.
   */
  async createPost(postData, translations = [], thumbnailFile) {
    const transaction = await Post.sequelize.transaction();
    try {
      const { title, content, description, category_id, status = 'draft', user_id } = postData;

      // Kiểm tra thumbnail file
      if (!thumbnailFile || !thumbnailFile.path) {
        throw new Error('Thumbnail image file is required');
      }
      
      // Thumbnail đã được multer-storage-cloudinary upload lên Cloudinary rồi
      // Nên chúng ta chỉ cần lấy URL và public_id từ đối tượng thumbnailFile
      const thumbnailUrl = thumbnailFile.path; // Đây chính là secure_url từ Cloudinary
      // const publicId = thumbnailFile.filename; // Nếu cần lưu public_id

      if (!thumbnailUrl) {
        throw new Error('Failed to get uploaded image URL from thumbnail file.');
      }
      
      // Tạo slug
      const slug = await this._generateUniqueSlug(title);
      
      // Tạo bài viết trong transaction
      const post = await Post.create({
        title,
        content,
        description,
        category_id,
        status,
        slug,
        user_id,
        thumbnail: thumbnailUrl // Lưu URL của ảnh
      }, { transaction });

      // Thêm các bản dịch nếu có
      if (translations.length > 0) {
        await this._addPostTranslations(post.id, translations, transaction);
      }

      await transaction.commit();
      // Lấy lại post với đầy đủ thông tin để trả về
      return this.getPostById(post.id, false);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * [CẬP NHẬT] Cập nhật bài viết, tích hợp upload thumbnail và bản dịch.
   */
  async updatePost(postId, userId, isAdmin, updateData, translations = [], thumbnailFile = null) {
    const transaction = await Post.sequelize.transaction();
    try {
        const post = await Post.findByPk(postId);
        if (!post) throw new Error('Post not found');

        if (!isAdmin && post.user_id !== userId) {
            throw new Error('Unauthorized to update this post');
        }

        let thumbnailUrl = post.thumbnail; // Mặc định là ảnh thumbnail hiện tại của bài viết

        // Trường hợp 1: Có file thumbnail mới được upload (thông qua multer-storage-cloudinary)
        if (thumbnailFile) {
            // Lấy URL trực tiếp từ đối tượng thumbnailFile đã được multer xử lý
            thumbnailUrl = thumbnailFile.path; // Đây là secure_url từ Cloudinary
            // Nếu cần xóa ảnh cũ trên Cloudinary, bạn có thể thêm logic ở đây bằng public_id của ảnh cũ
        } else if ('thumbnail' in updateData) {
            // Trường hợp 2: Frontend có gửi trường 'thumbnail' trong updateData
            // Điều này có thể là null (nếu người dùng xóa ảnh) hoặc là URL ảnh cũ
            thumbnailUrl = updateData.thumbnail; // Sử dụng giá trị từ updateData
        }
        // Xóa thuộc tính thumbnail khỏi updateData để nó không ghi đè lẫn lộn với thumbnailUrl
        delete updateData.thumbnail;

        // 2. Cập nhật slug nếu tiêu đề thay đổi
        if (updateData.title && updateData.title !== post.title) {
            updateData.slug = await this._generateUniqueSlug(updateData.title, postId);
        }

        // 3. Cập nhật dữ liệu chính của bài viết
        await post.update({
            ...updateData,
            thumbnail: thumbnailUrl // Lưu URL của ảnh (mới, cũ, hoặc null)
        }, { transaction });

        // 4. Cập nhật bản dịch (xóa cũ, thêm mới hoặc update)
        if (translations.length > 0) {
            await this._updatePostTranslations(postId, translations, transaction);
        }
        
        await transaction.commit();
        return this.getPostById(postId, false);
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
  }

  // --- Helper Methods ---

  async _generateUniqueSlug(title, excludePostId = null) {
    let baseSlug = slugify(title, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g });
    let slug = baseSlug;
    let counter = 1;

    const where = { slug };
    if (excludePostId) {
        where.id = { [Op.ne]: excludePostId };
    }

    while (await Post.findOne({ where })) {
        slug = `${baseSlug}-${counter}`;
        where.slug = slug;
        counter++;
    }
    return slug;
  }
  
  // Sửa lại helper để nhận transaction
  async _addPostTranslations(postId, translations, transaction) {
    if (!Array.isArray(translations) || translations.length === 0) {
      return;
    }

    try {
      const languageLocales = translations.map(t => t.locale);
      const languages = await Language.findAll({ 
        where: { 
          locale: { [Op.in]: languageLocales },
          is_active: true 
        } 
      });

      if (languages.length === 0) {
        throw new Error('No valid languages found for the provided locales');
      }

      const languageMap = new Map(languages.map(lang => [lang.locale, lang.id]));

      const translationEntries = translations
        .map(t => ({
          post_id: postId,
          language_id: languageMap.get(t.locale),
          title: t.title,
          content: t.content,
          description: t.description || '',
          is_original: t.is_original || false,
        }))
        .filter(t => t.language_id); // Filter out invalid locales

      if (translationEntries.length === 0) {
        throw new Error('No valid translations could be created');
      }

      await PostTranslateLanguage.bulkCreate(translationEntries, { transaction });
    } catch (error) {
      console.error('[PostService._addPostTranslations] Error:', error);
      throw new Error(`Failed to add translations: ${error.message}`);
    }
  }

  // Delete post
    // Delete post
    async deletePost(postId, userId, isAdmin) {
      const transaction = await Post.sequelize.transaction();
      try {
        const post = await Post.findByPk(postId, { transaction });
        if (!post) return false;
  
        if (!isAdmin && post.user_id !== userId) {
          throw new Error('Unauthorized to delete this post');
        }
  
        // Xoá bản dịch liên quan (nếu có)
        await PostTranslateLanguage.destroy({
          where: { post_id: postId },
          transaction
        });
  
        // TODO: Nếu có PostMedia, bạn nên xoá ở đây nữa
  
        // Xoá bài viết
        await post.destroy({ transaction });
  
        await transaction.commit();
        return true;
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    }
  

  // Get posts by category
  async getPostsByCategory(categoryId, { page = 1, limit = 10 }) {
    const offset = (page - 1) * limit;
    const createdAtColumn = Post.rawAttributes.createdAt ? 'createdAt' : 'created_at';

    const category = await Categories.findByPk(categoryId, { attributes: ['id', 'name', 'slug'] });
    if (!category) return null;

    const { count, rows: posts } = await Post.findAndCountAll({
      where: {
        category_id: categoryId,
        status: 'published'
      },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[createdAtColumn, 'DESC']],
      include: this._getDefaultIncludes(),
      distinct: true
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

  // Get user's own posts
  async getUserPosts(userId, { page = 1, limit = 10, includeDrafts = false }) {
    const offset = (page - 1) * limit;
    const createdAtColumn = Post.rawAttributes.createdAt ? 'createdAt' : 'created_at';

    const whereClause = { user_id: userId };
    if (!includeDrafts) {
        whereClause.status = { [Op.in]: ['published', 'scheduled'] };
    }

    const { count, rows: posts } = await Post.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[createdAtColumn, 'DESC']],
      include: this._getDefaultIncludes(),
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
  async getPostsByAuthor({
    userId,
    page = 1,
    limit = 10,
    status = 'published',
    sort = 'newest'
  }) {
    const offset = (page - 1) * limit;
    const createdAtColumn = Post.rawAttributes.createdAt ? 'createdAt' : 'created_at';

    const where = {
      user_id: userId
    };

    if (status) {
      where.status = status;
    }

    let order;
    switch (sort) {
      case 'oldest': order = [[createdAtColumn, 'ASC']]; break;
      case 'most_viewed': order = [['views', 'DESC']]; break;
      default: order = [[createdAtColumn, 'DESC']];
    }

    const { count, rows } = await Post.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order,
      include: [
        {
          model: Categories,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        },
        {
          model: PostTranslateLanguage,
          as: 'postTranslations',
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

  // --- Helper Methods ---

  _getSortOrder(sort) {
    const createdAtColumn = Post.rawAttributes.createdAt ? 'createdAt' : 'created_at';
    switch (sort) {
      case 'oldest': return [[createdAtColumn, 'ASC']];
      case 'most_viewed': return [['views', 'DESC']];
      case 'title_asc': return [['title', 'ASC']];
      case 'title_desc': return [['title', 'DESC']];
      case 'latest':
      default: return [[createdAtColumn, 'DESC']];
    }
  }

  _getDefaultIncludes() {
    return [
      {
        model: User,
        as: 'author',
        attributes: ['id', 'username', 'avatar']
      },
      {
        model: Categories,
        as: 'category',
        attributes: ['id', 'name', 'slug']
      }
    ];
  }

  _getDetailedIncludes() {
    return [
      {
        model: User,
        as: 'author',
        attributes: ['id', 'username','avatar']
      },
      {
        model: Categories,
        as: 'category',
        attributes: ['id', 'name', 'slug']
      },
      {
        model: PostTranslateLanguage,
        as: 'postTranslations',
        include: [{
          model: Language,
          as: 'language',
          attributes: ['id', 'name', 'locale']
        }]
      }
    ];
  }

  async _updatePostTranslations(postId, translations, transaction) {
    try {
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
                await transRecord.update({
                    title,
                    content,
                    description,
                    is_original: is_original !== undefined ? is_original : transRecord.is_original
                }, { transaction });
            }
        }

        const currentLanguageIds = translations.map(t => t.language_id);
        await PostTranslateLanguage.destroy({
            where: {
                post_id: postId,
                language_id: { [Op.notIn]: currentLanguageIds }
            },
            transaction
        });
    } catch (error) {
        console.error("Error updating post translations:", error);
        throw error;
    }
  }

  async updateStatus(postId, userId, isAdmin, status) {
    const post = await Post.findByPk(postId);
    if (!post) return false;
    if (!isAdmin && post.user_id !== userId) return false;
    post.status = status.toLowerCase();
    await post.save();
    return true;
  }
}

module.exports = new postService();