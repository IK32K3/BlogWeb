import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet, Router } from '@angular/router';
import { NavBarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { QuillEditorComponent } from '../../shared/components/quill-editor/quill-editor.component';
import { BlogPostService } from '../../core/services/blog-post.service';
import { CategoryService } from '../../core/services/category.service';
import { PostDto } from '../../shared/model/post.model';
import { Category } from '../../shared/model/category.model';
import { ToastrService } from 'ngx-toastr';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
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
  postContent = '';
  post: PostDto = {
    title: '',
    content: '',
    description: '',
    category_id: 0,
    tags: [],
    status: 'draft',
    postMedia: [],
    translations: []
  };
  newTag = '';
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
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadCategories();
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

  addTag() {
    const tag = this.newTag.trim();
    if (tag && this.post.tags!.length < 5 && !this.post.tags!.includes(tag)) {
      this.post.tags!.push(tag);
    }
    this.newTag = '';
  }

  removeTag(tag: string) {
    const index = this.post.tags!.indexOf(tag);
    if (index !== -1) {
      this.post.tags!.splice(index, 1);
    }
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

      // Handle image upload if exists
      if (this.selectedFile) {
        const formData = new FormData();
        formData.append('file', this.selectedFile);
        
        try {
          const uploadResponse = await firstValueFrom(this.blogPostService.uploadImage(formData));
          if (uploadResponse.success && uploadResponse.data) {
            this.post.postMedia = [{
              media_id: uploadResponse.data.id,
              is_featured: true
            }];
          } else {
            throw new Error(uploadResponse.message || 'Failed to upload image');
          }
        } catch (uploadError: any) {
          console.error('Error uploading image:', uploadError);
          this.toastr.error(uploadError.message || 'Failed to upload image. Please try again.');
          this.isSubmitting = false;
          return;
        }
      } else {
        this.post.postMedia = [];
      }

      // Add default translation
      this.post.translations = [{
        language_id: 1, // Assuming 1 is the default language ID
        title: this.post.title,
        content: this.post.content,
        description: this.post.description || ''
      }];

      // Create post
      const response = await firstValueFrom(this.blogPostService.create(this.post));

      if (response.success) {
        this.toastr.success('Post published successfully!');
        this.router.navigate(['/blog/post', response.data.post.id]);
      } else {
        throw new Error(response.message || 'Failed to publish post');
      }
    } catch (error: any) {
      console.error('Error publishing post:', error);

      if (error instanceof HttpErrorResponse) {
        if (error.status === 401) {
          this.toastr.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
          this.authService.logout();
          this.router.navigate(['/auth/login']);
        } else if (error.status === 403) {
          this.toastr.error('Bạn không có quyền thực hiện thao tác này.');
        } else if (error.status === 404) {
          this.toastr.error('Không tìm thấy endpoint upload. Vui lòng kiểm tra cấu hình server.');
        } else if (error.status === 413) {
          this.toastr.error('Kích thước file quá lớn. Tối đa 5MB.');
        } else if (error.status === 415) {
          this.toastr.error('Định dạng file không hợp lệ. Chỉ chấp nhận JPG hoặc PNG.');
        } else {
          this.toastr.error(error.error?.message || 'Failed to publish post');
        }
      } else {
        this.toastr.error(error.message || 'Failed to publish post');
      }
    } finally {
      this.isSubmitting = false;
    }
  }

  async saveDraft() {
    if (this.isSubmitting) return;

    try {
      this.isSubmitting = true;
      this.post.content = this.postContent;
      this.post.status = 'draft';

      // Add default translation
      this.post.translations = [{
        language_id: 1, // Assuming 1 is the default language ID
        title: this.post.title,
        content: this.post.content,
        description: this.post.description
      }];

      const response = await firstValueFrom(this.blogPostService.create(this.post));
      
      if (response.success) {
        this.toastr.success('Draft saved successfully!');
      } else {
        throw new Error(response.message || 'Failed to save draft');
      }
    } catch (error: any) {
      console.error('Error saving draft:', error);
      this.toastr.error(error.message || 'Failed to save draft');
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
        tags: [],
        status: 'draft',
        postMedia: [],
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
