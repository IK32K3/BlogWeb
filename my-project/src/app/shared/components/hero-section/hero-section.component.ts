import { CommonModule } from '@angular/common';
import { Component, OnInit, HostListener, OnDestroy } from '@angular/core'; // Thêm OnDestroy
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface PostMediaItem {
  id: number;
  post_id: number;
  media_id: number;
  is_featured: boolean;
  createdAt: string;
  updatedAt: string;
  media: {
    id: number;
    url: string;
    type: 'image' | 'audio' | 'video' | string; // Mở rộng type nếu cần
  };
}

interface Post {
  id: number;
  user_id: number;
  category_id: number;
  title: string;
  content: string;
  description: string;
  status: 'published' | 'draft' | 'archived' | string;
  views: number;
  slug: string;
  id_post_original: number | null;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    username: string;
  };
  categories: {
    id: number;
    name: string;
    slug: string;
  };
  postMedia: PostMediaItem[];
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    posts: Post[];
    pagination: {
      total: number;
      totalPages: number;
      currentPage: number;
      limit: number;
    };
  };
}

interface Slide {
  image: string;
  title: string;
  author: string;
  date: string;
  authorImage: string;
  category: string;
  slug?: string; // Thêm slug nếu bạn muốn dùng để điều hướng
}

@Component({
  selector: 'app-hero-section',
  imports: [FormsModule, CommonModule],
  standalone: true,
  templateUrl: './hero-section.component.html',
  styleUrl: './hero-section.component.css'
})
export class HeroSectionComponent implements OnInit, OnDestroy { // Implement OnDestroy
  currentIndex = 0;
  intervalId: any;

  slides: Slide[] = [];

  // Ảnh fallback
  public DEFAULT_POST_IMAGE = 'https://pixahive.com/wp-content/uploads/2021/04/Doraemon-Cartoon-Illustration-410092-pixahive.jpg';
  private readonly DEFAULT_AUTHOR_IMAGE = 'https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg'; // Ảnh placeholder cho tác giả

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // Chỉ lấy các bài viết đã published và giới hạn 4 bài cho hero
    this.http.get<ApiResponse>('http://localhost:3000/posts?status=published&limit=4&sortBy=created_at&order=desc').subscribe({
      next: (res) => {
        if (res.success && res.data && res.data.posts) {
          this.slides = res.data.posts.map((post: Post): Slide => {
            let imageUrl = this.DEFAULT_POST_IMAGE;
            if (post.postMedia && post.postMedia.length > 0) {
              // Ưu tiên ảnh featured và là image
              const featuredImage = post.postMedia.find(pm => pm.is_featured && pm.media?.type === 'image');
              if (featuredImage && featuredImage.media?.url) {
                imageUrl = featuredImage.media.url;
              } else {
                // Nếu không có, lấy ảnh đầu tiên là image
                const firstImage = post.postMedia.find(pm => pm.media?.type === 'image');
                if (firstImage && firstImage.media?.url) {
                  imageUrl = firstImage.media.url;
                }
                // Nếu vẫn không có ảnh nào (ví dụ chỉ có audio/video), imageUrl sẽ giữ giá trị DEFAULT_POST_IMAGE
              }
            }

            return {
              image: imageUrl,
              title: post.title || 'No Title',
              author: post.user?.username || 'Unknown Author',
              date: new Date(post.created_at).toLocaleDateString('vi-VN', { // Định dạng ngày Việt Nam
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              }),
              authorImage: this.DEFAULT_AUTHOR_IMAGE, // Sử dụng ảnh placeholder cho tác giả
              category: post.categories?.name || 'Uncategorized', // Lấy tên category
              slug: post.slug
            };
          });

          if (this.slides.length > 0) {
            this.startAutoSlide();
          } else {
            console.warn("No published posts found to display in hero section.");
            // Có thể gán slides bằng một vài slide mặc định ở đây nếu muốn
          }

        } else {
          console.error('API response error or no posts data:', res.message);
          // Xử lý khi API trả về lỗi hoặc không có data.posts
        }
      },
      error: (err) => {
        console.error('Error fetching posts for hero section:', err);
        // Xử lý lỗi HTTP, ví dụ hiển thị slides mặc định hoặc thông báo lỗi
      }
    });
  }

  ngOnDestroy() { // Dọn dẹp interval khi component bị hủy
    this.stopAutoSlide();
  }

  getTransform(): string {
    return `translateX(-${this.currentIndex * 100}%)`;
  }

  nextSlide() {
    if (this.slides.length === 0) return;
    this.currentIndex = (this.currentIndex + 1) % this.slides.length;
  }

  prevSlide() {
    if (this.slides.length === 0) return;
    this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
  }

  setSlide(index: number) {
    if (this.slides.length === 0) return;
    this.currentIndex = index;
  }

  startAutoSlide() {
    if (this.slides.length > 1) { // Chỉ tự động trượt nếu có nhiều hơn 1 slide
        this.stopAutoSlide(); // Dừng interval cũ nếu có
        this.intervalId = setInterval(() => this.nextSlide(), 5000); // Tăng thời gian lên 5s
    }
  }

  stopAutoSlide() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null; // Đặt lại intervalId
    }
  }

  @HostListener('mouseenter')
  onMouseEnter() {
    this.stopAutoSlide();
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.startAutoSlide();
  }
}