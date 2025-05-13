import { CommonModule } from '@angular/common';
import { Component ,ViewChild, ElementRef  } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { NavBarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { QuillEditorComponent } from '../../shared/components/quill-editor/quill-editor.component';

@Component({
  selector: 'app-update-post',
  imports: [CommonModule,FormsModule,RouterOutlet,NavBarComponent,FooterComponent,QuillEditorComponent],
  templateUrl: './update-post.component.html',
  styleUrl: './update-post.component.css'
})
export class UpdatePostComponent {

  title: string = 'The Complete Guide to Becoming a Professional Blogger in 2025';
  
  // Category and tags
  categorySearch: string = 'Technology';
  categories: string[] = ['Technology', 'Business', 'Design', 'Health & Wellness', 'Lifestyle'];
  filteredCategories: string[] = [...this.categories];
  tags: string[] = ['writing', 'blogging', 'content'];
  newTag: string = '';

  // Update post status
  postStatus: string = 'Draft';  // Example post status
  lastUpdated: string = '2025-05-10';  // Example last updated date
  showCategoryOptions: boolean = false;

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

  // Method to add a new tag when Enter key is pressed
  addTag(event: KeyboardEvent): void {
    event.preventDefault();  // Prevent default action (form submission, etc.)
    const trimmed = this.newTag.trim();
    if (trimmed && !this.tags.includes(trimmed)) {
      this.tags.push(trimmed);  // Add new tag to the list
    }
    this.newTag = '';  // Clear the input field after adding the tag
  }

  // Method to remove a tag
  removeTag(index: number) {
    this.tags.splice(index, 1);  // Remove the tag at the specified index
  }
 defaultImage: string = 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80';
  featuredImage: string | ArrayBuffer | null = null;

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.featuredImage = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }
  removeImage(): void {
    this.featuredImage = null;
    this.fileInput.nativeElement.value = ''; // reset file input
  }

  existingPostContent = `
    <h2>1. Finding Your Niche and Audience</h2>
    <p>Effective blogging starts with clearly identifying who you're writing for and what your purpose is. A successful blog always has a specific audience and content focused on solving their problems or meeting their needs.</p>

    <div class="bg-gray-100 p-4 rounded-lg my-4">
      <h3 class="font-bold text-gray-800 mb-2">Quick Tip:</h3>
      <p>Create reader personas - visualize clearly who you want to reach with characteristics like age, occupation, interests, and challenges they face.</p>
    </div>

    <h2>2. Using Understandable, Approachable Language</h2>
    <p>Even when writing about professional topics, try to express yourself in everyday language that readers can easily absorb.</p>
  `; // hoặc từ server
    updatedContent = '';
    
  lastSavedTime = '2 minutes ago'; // Hoặc tính toán từ Date

  moveToTrash() {
    // TODO: xử lý xóa bài viết
    console.log('Moved to trash');
  }

  saveAsDraft() {
    // TODO: xử lý lưu nháp
    console.log('Saved as draft');
  }

  updatePost() {
    // TODO: xử lý cập nhật bài viết
    console.log('Post updated');
  }
}
//lay tu API
  //lastUpdated: string;

  // ngOnInit() {
  //   const updatedDate = new Date(); // ví dụ: lấy từ API
  //   this.lastUpdated = this.getTimeAgo(updatedDate);
  // }

  // getTimeAgo(date: Date): string {
  //   const diffMs = Date.now() - date.getTime();
  //   const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  //   return `${diffHrs} hour${diffHrs > 1 ? 's' : ''} ago`;
  // }

