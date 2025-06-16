import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BlogPostService } from '../../core/services/blog-post.service';
import { Post } from '../../shared/model/post.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { API_BASE } from '../../core/constants/api-endpoints';
import { CommentsService } from '../../core/services/comments.service';
import { Comment, CommentDto } from '../../shared/model/comment.model';
import { AuthService } from '../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { take, switchMap, tap, catchError, map } from 'rxjs/operators';
import { throwError, of } from 'rxjs';
import { User } from '../../shared/model/user.model';
import { CloudinaryService } from '../../core/services/cloudinary.service';
import { Md5 } from 'ts-md5';

interface ApiResponse<T> {
  success: boolean;
  data: {
    post?: T;
    posts?: T;
  };
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
  isLoggedIn = false;
  defaultImage = 'assets/images/default-avatar.jpg';

  constructor(
    private route: ActivatedRoute,
    private blogPostService: BlogPostService,
    private commentsService: CommentsService,
    private authService: AuthService,
    private toastr: ToastrService,
    private cloudinaryService: CloudinaryService
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

      this.authService.isLoggedIn$.subscribe(loggedIn => {
        this.isLoggedIn = loggedIn;
      });
    });
  }

  private _processPostData(data: any): void {
    console.log('_processPostData called with:', data);
    this.post = data.post;
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
        this.relateposts = response.data.posts || [];
      },
      error: (error: Error) => {
        console.error('Error loading related posts:', error);
      }
    });
  }

  loadComments(postId: number): void {
    this.commentsService.getCommentsByPost(postId).subscribe({
      next: (response: { comments: any[], pagination: any }) => {
        this.comments = (response.comments || []).map(item => {
          const comment = item.comment || item;
          if (item.user && comment) {
            comment.user = item.user;
          }
          return comment;
        });
      },
      error: (error: Error) => {
        console.error('Error loading comments:', error);
        this.comments = [];
      }
    });
  }

  postComment(): void {
    if (!this.post) {
      this.toastr.error('Post data is not available.');
      return;
    }

    if (!this.newComment.trim()) {
      this.toastr.warning('Comment cannot be empty.');
      return;
    }

    if (!this.comments) {
      this.comments = [];
    }

    this.authService.currentUser$.pipe(
      take(1),
      switchMap(currentUser => {
        if (!currentUser || !currentUser.id) {
          this.toastr.error('Please log in to post a comment.');
          console.error('Attempted to post comment without a logged-in user or user ID.');
          return throwError(() => new Error('User not logged in'));
        }

        const commentDto: CommentDto = {
          content: this.newComment,
          post_id: this.post!.id,
          user_id: currentUser.id,
        };

        return this.commentsService.addComment(this.post!.id, commentDto).pipe(
          map((response: { message: string, comment: Comment, user: User }) => {
            const newCommentWithUser: Comment = {
                ...response.comment,
                user: response.user
            };
            return newCommentWithUser;
          }),
          catchError((error: any) => {
            console.error('Error from addComment service:', error);
            return throwError(() => error);
          })
        );
      }),
      catchError((error: any) => {
        if (error.message !== 'User not logged in') {
          this.toastr.error('Failed to post comment. Please try again.');
        }
        return of(null);
      })
    ).subscribe({
      next: (comment: Comment | null) => {
        if (comment) {
            this.comments.unshift(comment);
            this.newComment = '';
            if (this.post) {
              this.post.comments_count = (this.post.comments_count || 0) + 1;
            }
            this.toastr.success('Comment posted successfully!');
        }
      }
    });
  }

  getImageUrl(url: string | undefined): string {
    if (!url) return 'assets/images/default-avatar.jpg';
    
    // Handle Gravatar URLs for emails
    if (url.includes('@') && url.includes('.')) { // Simple check for email format
      const emailHash = Md5.hashStr(url.trim().toLowerCase());
      return `https://www.gravatar.com/avatar/${emailHash}?s=100&d=identicon`; // s=100 for size, d=identicon for default image
    }

    // Handle Cloudinary URLs: Always pass to cloudinaryService for consistent processing
    if (url.includes('cloudinary.com')) {
      return this.cloudinaryService.getImageUrl(url); // Ensure CloudinaryService handles it
    }
    
    // Handle Cloudinary public IDs (legacy or specific format)
    if (url.startsWith('cloudinary://')) {
      const publicId = url.split('/').pop();
      return this.cloudinaryService.getImageUrl(`blog_uploads/${publicId}`);
    }
    
    // Handle relative URLs
    if (url.startsWith('/')) {
      return `${API_BASE}${url}`;
    }
    
    // Handle full non-Cloudinary URLs
    if (url.startsWith('http')) {
      return url;
    }
    
    // Default fallback
    return 'assets/images/default-avatar.jpg';
  }

  getThumbnailUrl(post: Post): string {
    try {
      if (post.thumbnail) {
        // Handle Cloudinary URLs
        if (post.thumbnail.includes('cloudinary.com') || post.thumbnail.startsWith('blog_uploads/')) {
          return this.cloudinaryService.getThumbnailUrl(post.thumbnail);
        }
        // Handle other URLs
        return this.getImageUrl(post.thumbnail);
      }
      
      if (post.postUploads && post.postUploads.length > 0) {
        const featuredUpload = post.postUploads.find(upload => upload.is_featured);
        if (featuredUpload?.file?.url) {
          // Handle Cloudinary URLs
          if (featuredUpload.file.url.includes('cloudinary.com') || featuredUpload.file.url.startsWith('blog_uploads/')) {
            return this.cloudinaryService.getThumbnailUrl(featuredUpload.file.url);
          }
          // Handle other URLs
          return this.getImageUrl(featuredUpload.file.url);
        }
      }
    } catch (error) {
      console.error('Error getting thumbnail URL:', error);
    }
    
    return 'assets/images/default-avatar.jpg';
  }

  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = this.defaultImage;
  }
}
