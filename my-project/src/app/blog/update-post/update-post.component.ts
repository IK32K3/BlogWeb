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

@Component({
  selector: 'app-update-post',
  imports: [CommonModule,FormsModule,RouterOutlet,NavBarComponent,FooterComponent,QuillEditorComponent],
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
  categories: string[] = ['Technology', 'Business', 'Design', 'Health & Wellness', 'Lifestyle'];
  filteredCategories: string[] = [...this.categories];

  // Update post status
  postStatus: string = 'Draft';
  lastUpdated: string = '';
  showCategoryOptions: boolean = false;

  // Translations
  translations: any[] = [];

  //defaultImage: string = 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80';
  featuredImage: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private blogPostService: BlogPostService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.postId = +params['id'];
        this.loadPost();
      }
    });
  }

  loadPost() {
    if (!this.postId) return;
    
    this.isLoading = true;
    this.error = null;
    
    this.blogPostService.getById(this.postId).subscribe({
      next: (response) => {
        if (response.success && response.data?.post) {
          const post = response.data.post;
          // Check if user is the author of the post
          if (post.user_id !== this.authService.getCurrentUserId()) {
            this.error = 'You are not authorized to edit this post';
            this.router.navigate(['/blog']);
            return;
          }
          this.title = post.title;
          this.content = post.content;
          this.description = post.description;
          this.existingPostContent = post.content;
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

  // Method to filter categories based on search input
  filterCategories() {
    const search = this.categorySearch.toLowerCase();
    this.filteredCategories = this.categories.filter(cat =>
      cat.toLowerCase().includes(search)
    );
  }

  // Method to select a category
  selectCategory(category: string) {
    this.categorySearch = category;
    this.showCategoryOptions = false;
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

  removeImage(): void {
    this.featuredImage = null;
    this.imagePreview = null;
    this.selectedFile = null;
    this.fileInput.nativeElement.value = '';
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
    formData.append('content', this.updatedContent);
    formData.append('description', this.description);
    formData.append('category_id', (this.categories.indexOf(this.categorySearch) + 1).toString()); // Ensure category_id is a string for FormData
    formData.append('status', this.postStatus);

    // Append thumbnail file if a new file is selected
    if (this.selectedFile) {
      formData.append('thumbnail', this.selectedFile, this.selectedFile.name);
    } else if (this.featuredImage && typeof this.featuredImage === 'string') {
      // If no new file, but there's an existing image URL, send it as a string
      // Backend should handle if this is a URL vs a file
      formData.append('thumbnail', this.featuredImage);
    }

    // Append translations if they exist and are not empty
    if (this.translations && this.translations.length > 0) {
      formData.append('translations', JSON.stringify(this.translations));
    }

    this.blogPostService.update(this.postId!, formData).subscribe({
      next: (response) => {
        if (response.success) {
          this.success = 'Post updated successfully!';
          this.isLoading = false;
          this.lastSavedTime = new Date().toLocaleTimeString();
          if (response.data?.post?.updatedAt) {
            this.lastUpdated = response.data.post.updatedAt;
          }
          // Clear selectedFile after successful upload/update to avoid re-uploading
          this.selectedFile = null;
          this.fileInput.nativeElement.value = '';
        } else {
          this.error = response.message || 'Failed to update post';
          this.isLoading = false;
        }
      },
      error: (err) => {
        if (err.status === 401) {
          this.authService.logout();
          this.router.navigate(['/auth/login']);
        } else {
          this.error = err.error?.message || 'Failed to update post. Please try again.';
        }
        this.isLoading = false;
        console.error('Error updating post:', err);
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
    
    if (confirm('Are you sure you want to move this post to trash?')) {
      this.blogPostService.deletePost(this.postId).subscribe({
        next: () => {
          this.router.navigate(['/blog/my-posts']);
        },
        error: (err) => {
          this.error = 'Failed to move post to trash. Please try again.';
          console.error('Error moving post to trash:', err);
        }
      });
    }
  }
}

