import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import DOMPurify from 'dompurify';
import Swal from 'sweetalert2';
import { LanguagesService } from '../../core/services/languages.service';

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
  originalPost: Post | null = null; // Lưu post gốc
  comments: Comment[] = [];
  loading = true;
  error: string | null = null;
  newComment = '';
  relateposts: Post[] = [];
  isLoggedIn = false;
  defaultImage = 'assets/images/default-avatar.jpg';
  safeContent: SafeHtml | null = null;
  currentUserId: number | null = null;
  isPostOwner: boolean = false;
  editingComment: Comment | null = null;
  editingContent: string = '';

  availableLanguages = [
    { name: 'English', locale: 'en', flag: 'https://flagcdn.com/w20/us.png' },
    { name: 'Tiếng Việt', locale: 'vi', flag: 'https://flagcdn.com/w20/vn.png' },
    { name: 'Français', locale: 'fr', flag: 'https://flagcdn.com/w20/fr.png' },
    { name: 'Deutsch', locale: 'de', flag: 'https://flagcdn.com/w20/de.png' },
    { name: 'Español', locale: 'es', flag: 'https://flagcdn.com/w20/es.png' },
    { name: '中文', locale: 'zh', flag: 'https://flagcdn.com/w20/cn.png' },
    { name: '日本語', locale: 'ja', flag: 'https://flagcdn.com/w20/jp.png' },
    { name: '한국어', locale: 'ko', flag: 'https://flagcdn.com/w20/kr.png' }
  ].sort((a, b) => a.name.localeCompare(b.name));
  selectedLanguage: string = 'vi';
  showDropdown: boolean = false;

  onLanguageChange(event: any) {
    const lang = event?.target?.value || this.selectedLanguage;
    this.selectedLanguage = lang;
    if (!this.post?.id) return;
    // Xác định locale gốc từ post.postTranslateLanguage (is_original=true)
    let originalLocale = 'vi';
    if (this.originalPost && Array.isArray(this.originalPost.postTranslateLanguage)) {
      const originalTrans = this.originalPost.postTranslateLanguage.find(t => t.is_original && t.language && t.language.locale);
      if (originalTrans) {
        originalLocale = originalTrans.language.locale;
      }
    }
    // Nếu là ngôn ngữ gốc thì revert về post gốc
    if (lang === originalLocale) {
      if (this.originalPost) {
        this.post = { ...this.originalPost };
        if (this.post.content) {
          const clean = DOMPurify.sanitize(this.post.content, {ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li', 'br', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'code', 'img'], ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'target', 'rel']});
          this.safeContent = this.sanitizer.bypassSecurityTrustHtml(clean);
        }
      }
      return;
    }
    // Gọi API lấy bản dịch
    this.languagesService.getPostTranslation(this.post.id, lang).subscribe({
      next: (res: any) => {
        // Nếu có bản dịch thì cập nhật lại post
        if (res && res.title) {
          this.post = {
            ...this.post!,
            title: res.title,
            description: res.description,
            content: res.content
          };
          this.safeContent = this.sanitizer.bypassSecurityTrustHtml(DOMPurify.sanitize(res.content, {ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li', 'br', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'code', 'img'], ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'target', 'rel']}));
        }
      },
      error: () => {
        // Nếu lỗi thì giữ nguyên post hiện tại
      }
    });
  }

  get selectedLanguageObj() {
    return this.availableLanguages.find(l => l.locale === this.selectedLanguage);
  }
  get selectedLanguageFlag() {
    return this.selectedLanguageObj?.flag;
  }

  constructor(
    private route: ActivatedRoute,
    private blogPostService: BlogPostService,
    private commentsService: CommentsService,
    private authService: AuthService,
    private toastr: ToastrService,
    private cloudinaryService: CloudinaryService,
    private sanitizer: DomSanitizer,
    private router: Router,
    private languagesService: LanguagesService
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

      this.authService.currentUser$.subscribe(user => {
        this.currentUserId = user?.id || null;
        this.isPostOwner = this.currentUserId === this.post?.author?.id;
      });
    });
  }

  private _processPostData(data: any): void {
    console.log('_processPostData called with:', data);
    this.post = data.post;
    this.originalPost = data.post ? { ...data.post } : null; // Lưu lại post gốc
    if (this.post && this.post.content) {
      // Làm sạch nội dung bằng DOMPurify
      const clean = DOMPurify.sanitize(this.post.content, {ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li', 'br', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'code', 'img'], ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'target', 'rel']});
      this.safeContent = this.sanitizer.bypassSecurityTrustHtml(clean);
    }
    this.loading = false;
    if (this.post?.category_id) {
      this.loadRelatedPosts(this.post.category_id);
    }
    if (this.post?.id) {
      this.loadComments(this.post.id);
    }
  }
  getSanitizedContent(content: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(content);
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
      next: (response: any) => {
        this.comments = (response.data?.comments || []).map((item: any) => {
          const comment = item.comment || item;
          if (item.user && comment) {
            comment.user = item.user;
          }
          (comment as any).showMenu = false;
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

    if (this.editingComment) {
      // Đang sửa comment
      this.commentsService.updateComment(this.editingComment.id, { content: this.editingContent }).subscribe({
        next: () => {
          this.toastr.success('Cập nhật bình luận thành công!');
          this.editingComment = null;
          this.newComment = '';
          this.loadComments(this.post!.id);
        },
        error: () => {
          this.toastr.error('Cập nhật bình luận thất bại!');
        }
      });
      return;
    }

    this.authService.currentUser$.pipe(
      take(1),
      switchMap(currentUser => {
        if (!currentUser || !currentUser.id) {
          this.toastr.error('Please log in to post a comment.');
          return throwError(() => new Error('User not logged in'));
        }

        const commentDto: CommentDto = {
          content: this.newComment,
          post_id: this.post!.id,
          user_id: currentUser.id,
        };

        return this.commentsService.addComment(this.post!.id, commentDto);
      }),
      catchError((error: any) => {
        if (error.message !== 'User not logged in') {
          this.toastr.error('Failed to post comment. Please try again.');
        }
        return of(null);
      })
    ).subscribe({
      next: (response: any) => {
        if (response) {
          this.newComment = '';
          this.toastr.success('Comment posted successfully!');
          // Gọi lại loadComments để lấy danh sách comment mới nhất từ DB
          if (this.post) {
            this.loadComments(this.post.id);
          }
        }
      }
    });
  }

  getImageUrl(url: string | undefined): string {
    if (!url) return 'https://res.cloudinary.com/dejapatma/image/upload/v1751512040/uploads/g8gxuakcviyjxrwqsz52.jpg';
    
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
    return 'https://res.cloudinary.com/dejapatma/image/upload/v1751512040/uploads/g8gxuakcviyjxrwqsz52.jpg';
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
    
    return 'https://res.cloudinary.com/dejapatma/image/upload/v1751512040/uploads/g8gxuakcviyjxrwqsz52.jpg';
  }

  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = this.defaultImage;
  }

  goToProfile(authorId: number | string | undefined) {
    console.log('authorId:', authorId, 'currentUserId:', localStorage.getItem('userId'));
    if (!authorId) return;
    const currentUserId = localStorage.getItem('userId');
    if (String(authorId) === String(currentUserId)) {
      this.router.navigate(['/profile/profile-user']);
    } else {
      this.router.navigate(['/profile/profile-settings', String(authorId)]);
    }
  }

  isCommentOwner(comment: Comment): boolean {
    return this.currentUserId === comment.user_id;
  }

  deleteComment(comment: Comment) {
    // Kiểm tra id trước khi gọi API
    this.commentsService.deleteComment(comment.id).subscribe({
      next: () => {
        this.toastr.success('Đã xóa bình luận!');
        this.loadComments(this.post!.id);
      },
      error: () => {
        this.toastr.error('Xóa bình luận thất bại!');
      }
    });
  }

  editComment(comment: Comment) {
    this.editingComment = { ...comment };
    this.editingContent = comment.content;
  }

  saveEditComment() {
    if (!this.editingComment) return;
    this.commentsService.updateComment(this.editingComment.id, { content: this.editingContent }).subscribe({
      next: () => {
        this.toastr.success('Cập nhật bình luận thành công!');
        this.editingComment = null;
        this.editingContent = '';
        this.loadComments(this.post!.id);
      },
      error: () => {
        this.toastr.error('Cập nhật bình luận thất bại!');
      }
    });
  }

  cancelEdit() {
    this.editingComment = null;
    this.editingContent = '';
  }

  toggleMenu(comment: any, forceClose: boolean = false) {
    // Đóng tất cả menu khác
    this.comments.forEach(c => { if (c !== comment) c.showMenu = false; });
    if (forceClose) {
      comment.showMenu = false;
    } else {
      comment.showMenu = !comment.showMenu;
    }
  }

  async confirmDeleteComment(comment: Comment) {
    const result = await Swal.fire({
      title: 'Bạn có chắc muốn xóa bình luận này?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    });
    if (result.isConfirmed) {
      this.deleteComment(comment);
    }
    // Đóng menu
    this.toggleMenu(comment, true);
  }
}
