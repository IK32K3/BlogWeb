import { CommonModule } from '@angular/common';
import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet, ActivatedRoute, Router } from '@angular/router';
import { NavBarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { QuillEditorComponent } from '../../shared/components/quill-editor/quill-editor.component';
import { BlogPostService } from '../../core/services/blog-post.service';
import { AuthService } from '../../core/services/auth.service';
import { Post, PostDto } from '../../shared/model/post.model';
import { ToastrService } from 'ngx-toastr';
import { HeaderComponent } from '../../shared/components/header/header.component';
import Swal from 'sweetalert2';
import { CategoryService } from '../../core/services/category.service';
import { Category } from '../../shared/model/category.model';

@Component({
  selector: 'app-update-post',
  imports: [CommonModule,FormsModule,RouterOutlet,FooterComponent,QuillEditorComponent,HeaderComponent],
  templateUrl: './update-post.component.html',
  styleUrl: './update-post.component.css'
})
export class UpdatePostComponent implements OnInit {
  postId: number | null = null;
  isLoading: boolean = false;
  error: string | null = null;
  success: string | null = null;
  lastSavedTime: string = '';
  existingPostContent: string = '';
  updatedContent: string = '';

  title: string = '';
  content: string = '';
  description: string = '';
  
  // Category and tags
  categorySearch: string = '';
  categories: Category[] = [];
  filteredCategories: Category[] = [];
  selectedCategoryName: string = '';
  categoryOptionsVisible = false;

  // Update post status
  postStatus: string = 'Draft';
  lastUpdated: string = '';

  // Translations
  translations: any[] = [];

  //defaultImage: string = 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80';
  featuredImage: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  selectedCategoryId: number | null = null;

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private blogPostService: BlogPostService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private categoryService: CategoryService
  ) {}

  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.loadCategories();
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.postId = +params['id'];
        this.loadPost();
      }
    });
  }

  loadCategories() {
    this.categoryService.getAll().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.categories = response.data.categories || [];
          this.filteredCategories = [...this.categories];
        }
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        this.toastr.error('Failed to load categories');
      }
    });
  }

  filterCategories() {
    const search = this.categorySearch.toLowerCase();
    this.filteredCategories = this.categories.filter(cat =>
      cat.name.toLowerCase().includes(search)
    );
  }

  showCategoryOptions() {
    this.categoryOptionsVisible = true;
  }

  hideCategoryOptionsWithDelay() {
    setTimeout(() => {
      this.categoryOptionsVisible = false;
    }, 200);
  }

  selectCategory(category: Category) {
    this.selectedCategoryName = category.name;
    this.categorySearch = category.name;
    this.categoryOptionsVisible = false;
    this.selectedCategoryId = category.id;
  }

  loadPost() {
    if (!this.postId) return;
    this.isLoading = true;
    this.error = null;
    this.blogPostService.getById(this.postId).subscribe({
      next: (response) => {
        if (response.success && response.data?.post) {
          const post = response.data.post;
          const currentUser = this.authService.getCurrentUserId();
          const isAdmin = this.authService.hasRole('Admin');
          if (post.user_id !== currentUser && !isAdmin) {
            this.toastr.error('You are not authorized to edit this post', 'Unauthorized');
            this.router.navigate(['/blog']);
            return;
          }
          this.title = post.title;
          this.content = post.content;
          this.description = post.description;
          this.existingPostContent = post.content;
          this.selectedCategoryId = post.category_id;
          this.selectedCategoryName = post.category?.name || '';
          this.categorySearch = post.category?.name || '';
          this.postStatus = post.status;
          this.lastUpdated = post.updatedAt || new Date().toISOString();
          this.featuredImage = post.thumbnail || null;
          this.imagePreview = post.thumbnail || null;
        }
        this.isLoading = false;
      },
      error: (err) => {
        if (err.status === 401) {
          this.authService.logout();
          this.router.navigate(['/auth/login']);
        } else {
          this.error = 'Failed to load post. Please try again.';
        }
        this.isLoading = false;
        console.error('Error loading post:', err);
      }
    });
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        this.toastr.error('File size should not exceed 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.toastr.error('Please upload an image file');
        return;
      }

      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
        this.featuredImage = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  // Getter để xác định đã chọn ảnh hay chưa
  get imageSelected(): boolean {
    return !!(this.selectedFile || this.featuredImage);
  }

  // Getter cho trạng thái submit/loading
  get isSubmitting(): boolean {
    return this.isLoading;
  }

  // Sửa removeImage nhận event tùy chọn (để không lỗi khi truyền $event)
  removeImage(event?: Event): void {
    if (event) { event.stopPropagation(); }
    this.featuredImage = null;
    this.imagePreview = null;
    this.selectedFile = null;
    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  updatePost() {
    if (!this.postId || !this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.isLoading = true;
    this.error = null;
    this.success = null;
    const formData = new FormData();
    formData.append('title', this.title);
    const contentToSend = this.updatedContent && this.updatedContent.trim() !== '' ? this.updatedContent : (this.content || this.existingPostContent || '');
    formData.append('content', contentToSend);
    formData.append('description', this.description);
    // Kiểm tra category hợp lệ
    if (!this.selectedCategoryId) {
      this.toastr.error('Please select a valid category');
      this.isLoading = false;
      return;
    }
    formData.append('category_id', String(this.selectedCategoryId));
    formData.append('status', this.postStatus);
    if (this.selectedFile) {
      formData.append('thumbnail', this.selectedFile, this.selectedFile.name);
    }
    if (this.translations && this.translations.length > 0) {
      formData.append('translations', JSON.stringify(this.translations));
    }
    this.blogPostService.update(this.postId!, formData).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastr.success('Post updated successfully!', 'Success');
          this.isLoading = false;
          this.lastSavedTime = new Date().toLocaleTimeString();
          if (response.data?.post?.updatedAt) {
            this.lastUpdated = response.data.post.updatedAt;
          }
          this.selectedFile = null;
          this.fileInput.nativeElement.value = '';
          const postId = response.data?.post?.id || this.postId;
          if (postId) {
            this.router.navigate(['/post-detail', postId]);
          } else {
            this.router.navigate(['/blog']);
          }
        } else {
          this.toastr.error(response.message || 'Failed to update post', 'Error');
          this.isLoading = false;
        }
      },
      error: (err) => {
        if (err.status === 401) {
          this.authService.logout();
          this.router.navigate(['/auth/login']);
        } else {
          this.toastr.error(err.error?.message || 'Failed to update post. Please try again.', 'Error');
        }
        this.isLoading = false;
        console.error('Error updating post:', err.error || err);
      }
    });
  }

  private continueUpdatePost(postData: PostDto) {
    // This function is no longer needed as we are sending FormData directly to update
    // and the old uploadImage logic is removed.
  }

  saveAsDraft() {
    this.postStatus = 'draft';
    this.updatePost();
  }

  moveToTrash() {
    if (!this.postId) return;

    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to move this post to trash?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, move to trash!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed && this.postId !== null) {
        this.blogPostService.deletePost(this.postId).subscribe({
          next: () => {
            Swal.fire('Deleted!', 'Your post has been moved to trash.', 'success');
            this.router.navigate(['/blog/my-posts']);
          },
          error: (err) => {
            this.error = 'Failed to move post to trash. Please try again.';
            Swal.fire('Error', this.error, 'error');
            console.error('Error moving post to trash:', err);
          }
        });
      }
    });
  }
}

