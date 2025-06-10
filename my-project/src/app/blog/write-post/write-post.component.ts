import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet, Router, ActivatedRoute } from '@angular/router';
import { NavBarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { QuillEditorComponent } from '../../shared/components/quill-editor/quill-editor.component';
import { BlogPostService } from '../../core/services/blog-post.service';
import { CategoryService } from '../../core/services/category.service';
import { PostDto, Post } from '../../shared/model/post.model';
import { Category } from '../../shared/model/category.model';
import { ToastrService } from 'ngx-toastr';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { UploadService, MediaResponse } from '../../core/services/upload.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-write-post',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterOutlet, 
    NavBarComponent, 
    FooterComponent, 
    QuillEditorComponent
  ],
  templateUrl: './write-post.component.html',
  styleUrl: './write-post.component.css'
})
export class WritePostComponent implements OnInit {
  postId: number | null = null;
  postContent = '';
  post: PostDto = {
    title: '',
    content: '',
    description: '',
    category_id: 0,
    status: 'draft',
    translations: []
  };
  categories: Category[] = [];
  filteredCategories: Category[] = [];
  categoryOptionsVisible = false;
  isSubmitting = false;
  selectedCategoryName = '';

  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;
  imageSelected: boolean = false;
  imagePreview: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;

  constructor(
    private blogPostService: BlogPostService,
    private categoryService: CategoryService,
    private router: Router,
    private toastr: ToastrService,
    private authService: AuthService,
    private uploadService: UploadService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.loadCategories();
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.postId = +id;
        this.loadPost(this.postId);
      }
    });
  }

  loadPost(id: number) {
    this.blogPostService.getById(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const post: Post = response.data;
          this.post = {
            title: post.title,
            content: post.content,
            description: post.description,
            category_id: post.category_id,
            status: post.status,
            thumbnail: post.thumbnail,
            translations: post.postTranslateLanguage?.map(t => ({
              language_id: t.language_id,
              title: t.title,
              content: t.content,
              description: t.description
            })) || []
          };
          this.postContent = post.content;
          this.selectedCategoryName = post.category?.name || '';
          if (post.thumbnail) {
            this.imagePreview = post.thumbnail;
            this.imageSelected = true;
          }
        }
      },
      error: (err) => {
        console.error('Error loading post:', err);
        this.toastr.error('Failed to load post');
        this.router.navigate(['/write-post']);
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

  showCategoryOptions() {
    this.categoryOptionsVisible = true;
  }

  filterCategoryOptions(event: any) {
    const query = event.target.value.toLowerCase();
    this.filteredCategories = this.categories.filter(category => 
      category.name.toLowerCase().includes(query)
    );
  }

  selectCategory(category: Category) {
    this.post.category_id = category.id;
    this.selectedCategoryName = category.name;
    this.categoryOptionsVisible = false;
  }

  triggerFileInput(): void {
    this.fileInputRef.nativeElement.click();
  }

  handleFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
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
        this.imageSelected = true;
        this.toastr.success('Image uploaded successfully!');
      };
      reader.readAsDataURL(file);
    }
  }

  resetImage(event: MouseEvent): void {
    event.stopPropagation();
    this.imageSelected = false;
    this.imagePreview = null;
    this.selectedFile = null;
    this.fileInputRef.nativeElement.value = '';
  }

  async publishPost() {
    if (this.isSubmitting) return;

    // Validate form
    if (!this.post.title.trim()) {
      this.toastr.error('Please add a title before publishing');
      return;
    }

    if (!this.post.category_id) {
      this.toastr.error('Please select a category');
      return;
    }

    if (!this.postContent.trim()) {
      this.toastr.error('Please add some content to your post');
      return;
    }

    try {
      this.isSubmitting = true;
      this.post.content = this.postContent;
      this.post.status = 'published';

      // Format translations to match backend structure
      if (this.post.translations && this.post.translations.length > 0) {
        this.post.translations = this.post.translations.map(translation => ({
          language_id: translation.language_id,
          title: String(translation.title || ''),
          content: String(translation.content || ''),
          description: String(translation.description || ''),
          locale: translation.locale || 'en' // Add locale instead of code
        }));
      } else {
        this.post.translations = [];
      }

      // Handle image upload if exists
      if (this.selectedFile) {
        try {
          const uploadResponse: MediaResponse = await firstValueFrom(this.uploadService.uploadFile(this.selectedFile));
          if (uploadResponse && uploadResponse.url) {
            this.post.thumbnail = uploadResponse.url;
          } else {
            throw new Error('Failed to upload image: No URL returned');
          }
        } catch (uploadError: any) {
          console.error('Error uploading image:', uploadError);
          this.toastr.error(uploadError.message || 'Failed to upload image. Please try again.');
          this.isSubmitting = false;
          return;
        }
      } else {
        this.post.thumbnail = undefined;
      }

      // Create or update post
      let response;
      if (this.postId) {
        response = await firstValueFrom(this.blogPostService.update(this.postId, this.post));
      } else {
        response = await firstValueFrom(this.blogPostService.create(this.post));
      }

      if (response.success) {
        this.toastr.success('Post published successfully!');
        this.router.navigate(['/home/home-page']);
      } else {
        this.toastr.error(response.message || 'Failed to publish post');
      }
    } catch (error: any) {
      console.error('Error publishing post:', error);
      const errorMessage = error instanceof HttpErrorResponse ? error.error.message : error.message;
      this.toastr.error(errorMessage || 'An unexpected error occurred');
    } finally {
      this.isSubmitting = false;
    }
  }

  async saveDraft() {
    if (this.isSubmitting) return;

    // Validate form (title and content are minimal for draft)
    if (!this.post.title.trim()) {
      this.toastr.error('A title is required to save a draft');
      return;
    }

    if (!this.postContent.trim()) {
      this.toastr.error('Content is required to save a draft');
      return;
    }

    try {
      this.isSubmitting = true;
      this.post.content = this.postContent;
      this.post.status = 'draft';

      // Format translations to match backend structure
      if (this.post.translations && this.post.translations.length > 0) {
        this.post.translations = this.post.translations.map(translation => ({
          language_id: translation.language_id,
          title: String(translation.title || ''),
          content: String(translation.content || ''),
          description: String(translation.description || ''),
          locale: translation.locale || 'en' // Add locale instead of code
        }));
      } else {
        this.post.translations = [];
      }

      // Handle image upload if exists for draft
      if (this.selectedFile) {
        try {
          const uploadResponse: MediaResponse = await firstValueFrom(this.uploadService.uploadFile(this.selectedFile));
          if (uploadResponse && uploadResponse.url) {
            this.post.thumbnail = uploadResponse.url;
          } else {
            throw new Error('Failed to upload image: No URL returned');
          }
        } catch (uploadError: any) {
          console.error('Error uploading image for draft:', uploadError);
          this.toastr.error(uploadError.message || 'Failed to upload image for draft. Please try again.');
          this.isSubmitting = false;
          return;
        }
      } else {
        this.post.thumbnail = undefined;
      }

      // Create or update post
      let response;
      if (this.postId) {
        response = await firstValueFrom(this.blogPostService.update(this.postId, this.post));
      } else {
        response = await firstValueFrom(this.blogPostService.create(this.post));
      }

      if (response.success) {
        this.toastr.success('Post draft saved successfully!');
        // Optionally, navigate or update postId if it's a new draft
        if (response.data && response.data.id && !this.postId) {
          this.router.navigate(['/write-post', response.data.id]); // Navigate to edit mode for the new draft
        } else {
          this.router.navigate(['/']); // Navigate to home if it's an existing draft or no new ID
        }
      } else {
        this.toastr.error(response.message || 'Failed to save draft');
      }
    } catch (error: any) {
      console.error('Error saving draft:', error);
      const errorMessage = error instanceof HttpErrorResponse ? error.error.message : error.message;
      this.toastr.error(errorMessage || 'An unexpected error occurred');
    } finally {
      this.isSubmitting = false;
    }
  }

  discardPost() {
    if (confirm('Are you sure you want to discard this post? All changes will be lost.')) {
      this.post = {
        title: '',
        content: '',
        description: '',
        category_id: 0,
        status: 'draft',
        translations: []
      };
      this.postContent = '';
      this.selectedCategoryName = '';
      this.resetImage(new MouseEvent('click'));
    }
  }

  hideCategoryOptionsWithDelay() {
    setTimeout(() => {
      this.categoryOptionsVisible = false;
    }, 200);
  }
}
