import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { BlogPostService } from '../../core/services/blog-post.service';
import { Post } from '../../shared/model/post.model';

@Component({
  selector: 'app-introduce-page',
  imports: [CommonModule,RouterOutlet,FormsModule,SharedModule],
  templateUrl: './introduce-page.component.html',
  styleUrl: './introduce-page.component.css'
})
export class IntroducePageComponent implements OnInit {
  posts: Post[] = [];

  constructor(private blogPostService: BlogPostService) {}

  ngOnInit() {
    this.blogPostService.getAll({ status: 'published', limit: 9 }).subscribe({
      next: (res) => {
        // Lấy đúng mảng posts
        const posts = res?.data?.posts || res?.data || res?.posts || [];
        // Chuyển đổi key cho từng post
        this.posts = posts.map((post: any) => ({
          ...post,
          created_at: post.createdAt,
          updated_at: post.updatedAt,
          // Nếu cần, chuyển đổi các trường khác tương tự
        }));
        console.log('Posts loaded:', this.posts); // kiểm tra dữ liệu
      },
      error: (err) => {
        this.posts = [];
        console.error('Error loading posts:', err);
      }
    });
  }
}
