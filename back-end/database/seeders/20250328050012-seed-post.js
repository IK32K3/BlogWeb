'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Posts', [
      {
        user_id: 1,
        category_id: 1,
        title: 'Giới thiệu về BlogWeb - Nền tảng chia sẻ kiến thức',
        content: `<h2>BlogWeb là gì?</h2>
        <p>BlogWeb là một nền tảng blog hiện đại, được xây dựng với mục đích chia sẻ kiến thức và kết nối cộng đồng. Với giao diện thân thiện và tính năng đa dạng, BlogWeb mang đến trải nghiệm viết blog tuyệt vời cho người dùng.</p>
        
        <h2>Tính năng nổi bật</h2>
        <ul>
          <li>Hỗ trợ đa ngôn ngữ</li>
          <li>Tích hợp Cloudinary cho quản lý hình ảnh</li>
          <li>Hệ thống phân quyền linh hoạt</li>
          <li>Giao diện responsive, thân thiện với người dùng</li>
        </ul>`,
        description: 'Giới thiệu tổng quan về BlogWeb - nền tảng blog hiện đại với nhiều tính năng hữu ích',
        thumbnail: 'https://res.cloudinary.com/your-cloud-name/image/upload/v1/blog_uploads/intro-blogweb.jpg',
        status: 'published',
        slug: 'gioi-thieu-blogweb',
        id_post_original: null,
        created_at: new Date('2024-03-01T08:00:00Z'),
        updated_at: new Date('2024-03-01T08:00:00Z')
      },
      {
        user_id: 2,
        category_id: 2,
        title: 'Hướng dẫn sử dụng Cloudinary trong BlogWeb',
        content: `<h2>Tại sao chọn Cloudinary?</h2>
        <p>Cloudinary cung cấp giải pháp lưu trữ và quản lý hình ảnh chuyên nghiệp, giúp tối ưu hiệu suất website của bạn.</p>
        
        <h2>Các bước tích hợp</h2>
        <ol>
          <li>Cài đặt package cần thiết</li>
          <li>Cấu hình Cloudinary</li>
          <li>Tích hợp vào hệ thống upload</li>
        </ol>`,
        description: 'Hướng dẫn chi tiết cách tích hợp và sử dụng Cloudinary trong BlogWeb',
        thumbnail: 'https://res.cloudinary.com/your-cloud-name/image/upload/v1/blog_uploads/cloudinary-guide.jpg',
        status: 'published',
        slug: 'huong-dan-su-dung-cloudinary',
        id_post_original: null,
        created_at: new Date('2024-03-15T10:30:00Z'),
        updated_at: new Date('2024-03-15T10:30:00Z')
      },
      {
        user_id: 1,
        category_id: 3,
        title: 'Cách tối ưu SEO cho bài viết blog',
        content: `<h2>SEO là gì?</h2>
        <p>SEO (Search Engine Optimization) là quá trình tối ưu hóa website để tăng thứ hạng trên các công cụ tìm kiếm.</p>
        
        <h2>Các yếu tố SEO quan trọng</h2>
        <ul>
          <li>Tiêu đề và meta description</li>
          <li>Nội dung chất lượng</li>
          <li>Tốc độ tải trang</li>
          <li>Mobile-friendly</li>
        </ul>`,
        description: 'Hướng dẫn chi tiết về cách tối ưu SEO cho bài viết blog',
        thumbnail: 'https://res.cloudinary.com/your-cloud-name/image/upload/v1/blog_uploads/seo-guide.jpg',
        status: 'draft',
        slug: 'toi-uu-seo-bai-viet-blog',
        id_post_original: null,
        created_at: new Date('2024-03-20T14:15:00Z'),
        updated_at: new Date('2024-03-20T14:15:00Z')
      },
      {
        user_id: 2,
        category_id: 1,
        title: 'Cập nhật mới: Tính năng đa ngôn ngữ',
        content: `<h2>Tính năng mới</h2>
        <p>BlogWeb vừa ra mắt tính năng đa ngôn ngữ, cho phép người dùng đọc và viết blog bằng nhiều ngôn ngữ khác nhau.</p>
        
        <h2>Hướng dẫn sử dụng</h2>
        <p>Để sử dụng tính năng này, bạn cần:</p>
        <ol>
          <li>Chọn ngôn ngữ mặc định</li>
          <li>Thêm bản dịch cho bài viết</li>
          <li>Quản lý các bản dịch</li>
        </ol>`,
        description: 'Thông báo về tính năng đa ngôn ngữ mới trong BlogWeb',
        thumbnail: 'https://res.cloudinary.com/your-cloud-name/image/upload/v1/blog_uploads/multilingual-feature.jpg',
        status: 'published',
        slug: 'tinh-nang-da-ngon-ngu',
        id_post_original: null,
        created_at: new Date('2024-03-25T09:45:00Z'),
        updated_at: new Date('2024-03-25T09:45:00Z')
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Posts', null, {});
  }
};