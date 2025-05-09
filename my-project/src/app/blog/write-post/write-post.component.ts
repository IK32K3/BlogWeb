import { CommonModule } from '@angular/common';
import { Component,ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { NavBarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { QuillEditorComponent } from '../../shared/components/quill-editor/quill-editor.component';


@Component({
  selector: 'app-write-post',
  imports: [CommonModule,FormsModule,RouterOutlet,NavBarComponent,FooterComponent,QuillEditorComponent],
  templateUrl: './write-post.component.html',
  styleUrl: './write-post.component.css'
})
export class WritePostComponent {
  post = {
    title: '',
    category: '',
    tags: [] as string[],
    content: '',
    featuredImage: null,
  };
  newTag = '';
  categories = [
    'Technology', 'Business', 'Design', 'Health & Wellness', 'Lifestyle', 
    'Study', 'Romantic', 'School', 'Amazing', 'Running'
  ];
  filteredCategories = [...this.categories];
  categoryOptionsVisible = false;

  showCategoryOptions() {
    this.categoryOptionsVisible = true;
  }

  filterCategoryOptions(event: any) {
    const query = event.target.value.toLowerCase();
    this.filteredCategories = this.categories.filter(category => category.toLowerCase().includes(query));
  }

  selectCategory(category: string) {
    this.post.category = category;
    this.categoryOptionsVisible = false;
  }

  addTag() {
    const tag = this.newTag.trim();
    if (tag && this.post.tags.length < 5 && !this.post.tags.includes(tag)) {
      this.post.tags.push(tag);
    }
    this.newTag = '';
  }

  removeTag(tag: string) {
    const index = this.post.tags.indexOf(tag);
    if (index !== -1) {
      this.post.tags.splice(index, 1);
    }
  }

  publishPost() {
    if (!this.post.title.trim()) {
      alert('Please add a title before publishing');
      return;
    }

    if (!this.post.category) {
      alert('Please select a category');
      return;
    }

    if (!this.post.content.trim()) {
      alert('Please add some content to your post');
      return;
    }

    console.log('Publishing post:', this.post);
    alert('Post published successfully!');
  }
@ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  imageSelected: boolean = false;
  imagePreview: string | ArrayBuffer | null = null;

  triggerFileInput(): void {
    this.fileInputRef.nativeElement.click();
  }

  handleFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
        this.imageSelected = true;
      };
      reader.readAsDataURL(file);
    }
  }

  resetImage(event: MouseEvent): void {
    event.stopPropagation(); // prevent re-triggering file input
    this.imageSelected = false;
    this.imagePreview = null;
    this.fileInputRef.nativeElement.value = '';
  }
}
