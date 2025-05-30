import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { BlogPostService } from '../../../core/services/blog-post.service';
import { Post } from '../../model/post.model';

@Component({
  selector: 'app-post-card',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './post-card.component.html',
  styleUrl: './post-card.component.css'
})
export class PostCardComponent implements OnInit {
  posts: Post[] = [];

  // Ảnh mặc định nếu không có ảnh bài viết
  readonly DEFAULT_IMAGE = 'https://placehold.co/400x200';

  constructor(private blogPostService: BlogPostService) { }

  ngOnInit(): void {
    this.blogPostService.getAll({ status: 'published', limit: 12 }).subscribe({
      next: (res) => {
        // Tùy vào API trả về, lấy đúng mảng post
        this.posts = res?.data?.posts || res?.data || res?.posts || [];
      },
      error: (err) => {
        console.error('Lỗi khi lấy danh sách bài viết:', err);
      }
    });
  }

  getPostImage(post: Post): string {
    // Ưu tiên lấy ảnh featured từ postMedia nếu có
    if (post.postMedia && post.postMedia.length > 0) {
      const featured = post.postMedia.find(pm => pm.is_featured && (pm as any).media?.type === 'image');
      if (featured && (featured as any).media?.url) {
        return (featured as any).media.url;
      }
      const firstImage = post.postMedia.find(pm => (pm as any).media?.type === 'image');
      if (firstImage && (firstImage as any).media?.url) {
        return (firstImage as any).media.url;
      }
    }
    return this.DEFAULT_IMAGE;
  }
}
