import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BlogPostService } from '../../../core/services/blog-post.service';
import { Post } from '../../model/post.model';
import { DEFAULT_AUTHOR_IMAGE } from '../../../core/constants/app-constants';

@Component({
  selector: 'app-post-card',
  imports: [CommonModule, RouterLink],
  standalone: true,
  templateUrl: './post-card.component.html',
  styleUrl: './post-card.component.css'
})
export class PostCardComponent implements OnInit {
  @Input() posts: Post[] = [];
  @Input() showViewAllButton: boolean = true;
  @Input() title: string = 'Featured Articles';
  @Input() description: string = 'Check out our most popular and recent articles on various topics';

  // Ảnh mặc định nếu không có ảnh bài viết
  readonly DEFAULT_IMAGE = 'https://placehold.co/400x200';
  readonly DEFAULT_AUTHOR_IMAGE = DEFAULT_AUTHOR_IMAGE;

  constructor(private blogPostService: BlogPostService) { }

  ngOnInit(): void {
    console.log('PostCardComponent posts:', this.posts);
    if (this.posts.length === 0) {
      this.loadPosts();
    }
  }

  loadPosts() {
    this.blogPostService.getAll({ status: 'published', limit: 12 }).subscribe({
      next: (res) => {
        if (res.success && res.data && res.data.posts) {
          this.posts = res.data.posts;
        } else {
          this.posts = [];
        }
      },
      error: (err) => {
        console.error('Lỗi khi lấy danh sách bài viết:', err);
        this.posts = [];
      }
    });
  }

  getPostImage(post: Post): string {
    // Ưu tiên lấy ảnh thumbnail từ trường 'thumbnail' của post
    if (post.thumbnail) {
      return post.thumbnail;
    }
    return this.DEFAULT_IMAGE;
  }
}
