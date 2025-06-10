import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BlogPostService } from '../../core/services/blog-post.service';
import { Post, Comment } from '../../shared/model/post.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { API_BASE } from '../../core/constants/api-endpoints';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule,
    HeaderComponent,
    FooterComponent
  ],
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.css']
})
export class PostDetailComponent implements OnInit {
  post: Post | null = null;
  comments: Comment[] = [];
  loading = true;
  error: string | null = null;
  newComment = '';
  relateposts: Post[] = [];

  constructor(
    private route: ActivatedRoute,
    private blogPostService: BlogPostService
  ) {}

  private isNumeric(value: string): boolean {
    return /^\d+$/.test(value);
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const paramValue = params['id'];

      console.log('Route parameter received:', paramValue);

      this.loading = true;
      this.error = null;

      if (paramValue) {
        if (this.isNumeric(paramValue)) {
          this.blogPostService.getById(Number(paramValue)).subscribe({
            next: (response: ApiResponse<Post>) => {
              console.log('getById success:', response);
              this._processPostData(response.data);
            },
            error: (error: Error) => {
              console.error('getById error (for numeric ID):', error);
              this._handlePostError(error);
            }
          });
        } else {
          this.blogPostService.getPostBySlug(paramValue).subscribe({
            next: (response: ApiResponse<Post>) => {
              console.log('getPostBySlug success (for slug):', response);
              this._processPostData(response.data);
            },
            error: (error: Error) => {
              console.error('getPostBySlug error (for slug):', error);
              this._handlePostError(error);
            }
          });
        }
      } else {
        this.error = 'No post identifier provided.';
        this.loading = false;
        console.warn('No post identifier provided in route.');
      }
    });
  }

  private _processPostData(post: Post): void {
    console.log('_processPostData called with:', post);
    this.post = post;
    this.loading = false;
    if (this.post?.category_id) {
      this.loadRelatedPosts(this.post.category_id);
    }
    if (this.post?.id) {
      this.loadComments(this.post.id);
    }
  }

  private _handlePostError(error: Error): void {
    console.log('_handlePostError called with:', error);
    this.error = 'Failed to load post. Please try again later.';
    this.loading = false;
    console.error('Error loading post:', error);
  }

  loadRelatedPosts(categoryId: number): void {
    this.blogPostService.getRelatedPosts(categoryId).subscribe({
      next: (response: ApiResponse<Post[]>) => {
        this.relateposts = response.data;
      },
      error: (error: Error) => {
        console.error('Error loading related posts:', error);
      }
    });
  }

  loadComments(postId: number): void {
    this.blogPostService.getComments(postId).subscribe({
      next: (response: ApiResponse<Comment[]>) => {
        this.comments = response.data;
      },
      error: (error: Error) => {
        console.error('Error loading comments:', error);
      }
    });
  }

  postComment(): void {
    if (!this.post || !this.newComment.trim()) return;

    this.blogPostService.postComment(this.post.id, this.newComment).subscribe({
      next: (response: ApiResponse<Comment>) => {
        this.comments.unshift(response.data);
        this.newComment = '';
        if (this.post) {
          this.post.comments_count = (this.post.comments_count || 0) + 1;
        }
      },
      error: (error: Error) => {
        console.error('Error adding comment:', error);
      }
    });
  }

  getImageUrl(url: string | undefined): string {
    if (!url) return 'assets/images/default-avatar.jpg';
    if (url.startsWith('http')) return url;
    return `${API_BASE}${url}`;
  }

  getThumbnailUrl(post: Post): string {
    if (post.thumbnail) {
      return this.getImageUrl(post.thumbnail);
    }
    if (post.postUploads && post.postUploads.length > 0) {
      const featuredUpload = post.postUploads.find(upload => upload.is_featured);
      if (featuredUpload?.file?.url) {
        return this.getImageUrl(featuredUpload.file.url);
      }
    }
    return 'assets/images/default-avatar.jpg';
  }
}
