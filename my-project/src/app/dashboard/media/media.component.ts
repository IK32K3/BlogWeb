import { CommonModule } from '@angular/common';
import { Component ,OnInit  } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { HeaderDashboardComponent } from '../../shared/components/header-dashboard/header-dashboard.component';
import { SidebarDashboardComponent } from '../../shared/components/sidebar-dashboard/sidebar-dashboard.component';
import { UploadModalComponent } from '../../shared/components/upload-modal/upload-modal.component';


export interface MediaItem {
  id: string | number;
  name: string;
  type: 'Image' | 'Video' | 'Document' | 'Audio';
  size: string;
  dimensionsOrDuration?: string; // e.g., "1920x1080" or "02:34"
  url?: string; // For images/videos actual src
  downloadUrl?: string;
  thumbnailUrl?: string; // Could be different for videos or large images
  pages?: number; // For documents
  isChecked?: boolean; // For the checkbox

  // For styling convenience
  tagText: string;
  tagBgColor: string;
  tagTextColor: string;
  iconClass?: string; // e.g., 'fas fa-file-pdf'
  iconContainerBg?: string; // e.g., 'bg-blue-100'
  iconColor?: string; // e.g., 'text-blue-600'
}

@Component({
  selector: 'app-media',
  imports: [CommonModule,FormsModule,RouterOutlet,HeaderDashboardComponent,
    SidebarDashboardComponent,UploadModalComponent
  ],
  templateUrl: './media.component.html',
  styleUrl: './media.component.css'
})
export class MediaComponent implements OnInit {

  showModal = false;
  selectedMedia = '';
  selectedType: 'image' | 'video' | 'document' = 'image';

  openModal() {
    this.selectedMedia = 'https://example.com/image.jpg';
    this.selectedType = 'image';
    this.showModal = true;
  }

  mediaItems: MediaItem[] = [];
  paginatedMediaItems: MediaItem[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 12; // Adjust as needed
  totalItems: number = 0;

  selectedMediaType: string = 'All Media Types';
  sortBy: string = 'Sort by Newest';
  searchTerm: string = '';

  showUploadModal: boolean = false;

  constructor() { }

  ngOnInit(): void {
    this.loadMockMediaItems();
    this.applyFiltersAndPagination();
  }

  loadMockMediaItems(): void {
    // Replace with your actual data fetching logic
    this.mediaItems = [
      {
        id: 1, name: 'beach-sunset.jpg', type: 'Image', size: '1.2 MB', dimensionsOrDuration: '1920×1080',
        url: 'https://images.unsplash.com/photo-1682686580391-615b3f4f56bd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
        tagText: 'Image', tagBgColor: 'bg-primary-100', tagTextColor: 'text-primary-800', isChecked: false
      },
      {
        id: 2, name: 'mountain-view.png', type: 'Image', size: '2.4 MB', dimensionsOrDuration: '2560×1440',
        url: 'https://images.unsplash.com/photo-1695653422902-1bea566871c6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
        tagText: 'Image', tagBgColor: 'bg-primary-100', tagTextColor: 'text-primary-800', isChecked: false
      },
      {
        id: 3, name: 'product-demo.mp4', type: 'Video', size: '15.7 MB', dimensionsOrDuration: '02:34',
        thumbnailUrl: 'https://images.unsplash.com/photo-1682686580391-615b3f4f56bd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
        tagText: 'Video', tagBgColor: 'bg-purple-100', tagTextColor: 'text-purple-800', isChecked: false
      },
      // Add more mock items if needed for testing
    ];
    this.totalItems = this.mediaItems.length;
  }

  applyFiltersAndPagination(): void {
    let filtered = this.searchTerm
      ? this.mediaItems.filter(item => item.name.toLowerCase().includes(this.searchTerm.toLowerCase()))
      : [...this.mediaItems];

    if (this.selectedMediaType !== 'All Media Types') {
      filtered = filtered.filter(item => item.type === this.selectedMediaType);
    }

    if (this.sortBy === 'Sort by Name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (this.sortBy === 'Sort by Oldest') {
      filtered.sort((a,b) => (a.id as number) - (b.id as number));
    } else { // Newest (default)
       filtered.sort((a,b) => (b.id as number) - (a.id as number));
    }

    this.totalItems = filtered.length;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedMediaItems = filtered.slice(startIndex, startIndex + this.itemsPerPage);
  }

  // --- Filter and Sort Handlers ---
  onFilterClick(): void {
    console.log('Filter button clicked - implement filter UI logic');
    // This is where you would typically open a filter sidebar/modal
  }

  onMediaTypeChange(event: Event): void {
    this.selectedMediaType = (event.target as HTMLSelectElement).value;
    this.currentPage = 1;
    this.applyFiltersAndPagination();
  }

  onSortChange(event: Event): void {
    this.sortBy = (event.target as HTMLSelectElement).value;
    this.currentPage = 1;
    this.applyFiltersAndPagination();
  }

  onSearchTermChange(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.currentPage = 1;
    this.applyFiltersAndPagination();
  }

  // --- Upload Modal Methods ---
  openUploadDialog(): void {
    this.showUploadModal = true;
  }

  handleCloseUploadModal(): void {
    this.showUploadModal = false;
  }

  handleFilesActuallyUploaded(uploadedFiles: File[]): void {
    console.log('Files received in MediaComponent:', uploadedFiles);

    uploadedFiles.forEach(file => {
      const newId = this.mediaItems.length > 0 ? Math.max(...this.mediaItems.map(item => item.id as number)) + 1 : 1;
      const newMediaItem: MediaItem = {
        id: newId,
        name: file.name,
        type: this.getMediaTypeFromFile(file), // Corrected: Method is now part of the class
        size: this.formatFileSize(file.size),   // Corrected: Method is now part of the class
        url: URL.createObjectURL(file),
        tagText: this.getMediaTypeFromFile(file), // Corrected: Method is now part of the class
        tagBgColor: 'bg-gray-200',
        tagTextColor: 'text-gray-700',
        isChecked: false
        // Add other necessary properties for your MediaItem
      };
      this.mediaItems.unshift(newMediaItem);
    });

    this.applyFiltersAndPagination();
    this.showUploadModal = false;
  }

  // --- Helper Methods (now correctly part of the class) ---
  private getMediaTypeFromFile(file: File): 'Image' | 'Video' | 'Document' | 'Audio' {
    if (file.type.startsWith('image/')) return 'Image';
    if (file.type.startsWith('video/')) return 'Video';
    if (file.type.startsWith('audio/')) return 'Audio';
    return 'Document';
  }

  private formatFileSize(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  // --- Media Item Actions (Placeholder - implement as needed) ---
  editItem(item: MediaItem): void { console.log('Edit:', item.name); }
  deleteItem(item: MediaItem): void {
    console.log('Delete:', item.name);
    this.mediaItems = this.mediaItems.filter(i => i.id !== item.id);
    this.applyFiltersAndPagination();
  }
  onItemCheckboxChange(item: MediaItem, event: Event): void {
    item.isChecked = (event.target as HTMLInputElement).checked;
    console.log(`${item.name} isChecked: ${item.isChecked}`);
  }

  // --- Pagination (Placeholder - implement as needed or use a library) ---
  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }
  get pagesArray(): number[] {
    return Array(this.totalPages).fill(0).map((x, i) => i + 1);
  }
  goToPage(pageNumber: number): void {
    this.currentPage = pageNumber;
    this.applyFiltersAndPagination();
  }
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyFiltersAndPagination();
    }
  }
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.applyFiltersAndPagination();
    }
  }
  get showingFrom(): number {
    if (this.totalItems === 0) return 0;
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }
  get showingTo(): number {
    const to = this.currentPage * this.itemsPerPage;
    return to > this.totalItems ? this.totalItems : to;
  }
  
  showMediaPreviewModal: boolean = false;
  selectedMediaForPreview: MediaItem | null = null;

  // ... (constructor, ngOnInit, other methods) ...

  // Method to open the preview modal (called when a media item in the grid is clicked)
  openMediaPreview(item: MediaItem): void {
    this.selectedMediaForPreview = item;
    this.showMediaPreviewModal = true;
  }

  handleCloseMediaPreviewModal(): void {
    this.showMediaPreviewModal = false;
    this.selectedMediaForPreview = null; // Clear selected item
  }

  handleUseThisMedia(item: MediaItem): void {
    console.log('Use this media:', item);
    // Implement logic for using the media (e.g., inserting into an editor, selecting for a profile picture)
    // this.showMediaPreviewModal = false; // Modal might close itself
  }

  handleEditMediaDetails(item: MediaItem): void {
    console.log('Edit media details:', item);
    // Implement logic to navigate to an edit page or open another modal for editing details
    // this.showMediaPreviewModal = false; // Modal might close itself
  }

  // In your media item click handler within the grid (e.g., viewItem method)
  viewItem(item: MediaItem): void {
    console.log('View item clicked, opening preview for:', item.name);
    this.openMediaPreview(item);
  }
}
