import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { HeaderDashboardComponent } from '../../shared/components/header-dashboard/header-dashboard.component';
import { SidebarDashboardComponent } from '../../shared/components/sidebar-dashboard/sidebar-dashboard.component';
import { UploadModalComponent } from '../../shared/components/upload-modal/upload-modal.component';
import { UploadService, CloudinaryMediaItem, MediaListResponse } from '../../core/services/upload.service';
import Swal from 'sweetalert2';

export interface MediaItem {
  id: string | number;
  publicId?: string;
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
  imports: [CommonModule, FormsModule, RouterOutlet, HeaderDashboardComponent,
    SidebarDashboardComponent, UploadModalComponent
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
  showMediaPreviewModal: boolean = false;
  selectedMediaForPreview: MediaItem | null = null;

  // Thêm biến để lưu trữ cursor cho pagination
  nextCursor: string | null = null;
  isLoading: boolean = false;

  constructor(private uploadService: UploadService) { }

  ngOnInit(): void {
    this.loadMediaItems();
  }

  loadMediaItems(): void {
    this.isLoading = true;
    
    this.uploadService.getAllMedia({
      maxResults: 100, // Lấy tối đa 100 items
      type: 'upload'
    }).subscribe({
      next: (response: MediaListResponse) => {
        // Chuyển đổi CloudinaryMediaItem thành MediaItem
        this.mediaItems = response.mediaItems.map(item => ({
          id: item.id,
          publicId: item.publicId,
          name: item.name,
          type: item.type,
          size: item.size,
          dimensionsOrDuration: item.dimensionsOrDuration,
          url: item.url,
          thumbnailUrl: item.thumbnailUrl,
          tagText: item.tagText,
          tagBgColor: item.tagBgColor,
          tagTextColor: item.tagTextColor,
          isChecked: false
        }));
        
        this.totalItems = this.mediaItems.length;
        this.nextCursor = response.pagination.nextCursor || null;
        this.applyFiltersAndPagination();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading media items:', error);
        // Fallback to mock data if API fails
        this.loadMockData();
        this.isLoading = false;
      }
    });
  }

  // Fallback method với mock data
  private loadMockData(): void {
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

  handleFilesUploaded(files: File[]): void {
    // Handle the uploaded files
    files.forEach(file => {
      // Create a new media item from the uploaded file
      const newItem: MediaItem = {
        id: Date.now(), // Temporary ID
        name: file.name,
        type: this.getMediaTypeFromFile(file),
        size: this.formatFileSize(file.size),
        url: URL.createObjectURL(file),
        tagText: this.getMediaTypeFromFile(file),
        tagBgColor: this.getTagBgColor(this.getMediaTypeFromFile(file)),
        tagTextColor: this.getTagTextColor(this.getMediaTypeFromFile(file)),
        isChecked: false
      };
      this.mediaItems.unshift(newItem);
    });
    this.applyFiltersAndPagination();
    
    // Reload media items from Cloudinary after upload
    setTimeout(() => {
      this.loadMediaItems();
    }, 1000); // Delay 1 second to ensure upload is complete
  }

  private getTagBgColor(type: 'Image' | 'Video' | 'Document' | 'Audio'): string {
    switch (type) {
      case 'Image': return 'bg-primary-100';
      case 'Video': return 'bg-purple-100';
      case 'Document': return 'bg-blue-100';
      case 'Audio': return 'bg-green-100';
      default: return 'bg-gray-100';
    }
  }

  private getTagTextColor(type: 'Image' | 'Video' | 'Document' | 'Audio'): string {
    switch (type) {
      case 'Image': return 'text-primary-800';
      case 'Video': return 'text-purple-800';
      case 'Document': return 'text-blue-800';
      case 'Audio': return 'text-green-800';
      default: return 'text-gray-800';
    }
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
    Swal.fire({
      title: 'Bạn có chắc muốn xóa file này?',
      text: item.name,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        // Thực hiện xóa như cũ
        this.uploadService.deleteFile(item.publicId as string).subscribe({
          next: () => {
            Swal.fire('Đã xóa!', 'File đã được xóa thành công.', 'success');
            this.mediaItems = this.mediaItems.filter(i => i.id !== item.id);
            this.applyFiltersAndPagination();
          },
          error: (error: any) => {
            Swal.fire('Lỗi!', 'Không thể xóa file.', 'error');
          }
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire('Đã hủy', 'File của bạn vẫn an toàn.', 'info');
      }
    });
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

  private getMediaTypeFromFile(file: File): 'Image' | 'Video' | 'Document' | 'Audio' {
    if (file.type.startsWith('image/')) return 'Image';
    if (file.type.startsWith('video/')) return 'Video';
    if (file.type.startsWith('audio/')) return 'Audio';
    return 'Document';
  }

  // Load thêm media từ Cloudinary
  loadMoreMedia(): void {
    if (this.nextCursor && !this.isLoading) {
      this.isLoading = true;
      
      this.uploadService.getAllMedia({
        maxResults: 50,
        nextCursor: this.nextCursor,
        type: 'upload'
      }).subscribe({
        next: (response: MediaListResponse) => {
          const newItems = response.mediaItems.map(item => ({
            id: item.id,
            publicId: item.publicId,
            name: item.name,
            type: item.type,
            size: item.size,
            dimensionsOrDuration: item.dimensionsOrDuration,
            url: item.url,
            thumbnailUrl: item.thumbnailUrl,
            tagText: item.tagText,
            tagBgColor: item.tagBgColor,
            tagTextColor: item.tagTextColor,
            isChecked: false
          }));
          
          this.mediaItems = [...this.mediaItems, ...newItems];
          this.totalItems = this.mediaItems.length;
          this.nextCursor = response.pagination.nextCursor || null;
          this.applyFiltersAndPagination();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading more media items:', error);
          this.isLoading = false;
        }
      });
    }
  }

  /**
   * Xóa nhiều file đã chọn
   */
  deleteSelectedItems(): void {
    const selectedItems = this.paginatedMediaItems.filter(item => item.isChecked);
    if (selectedItems.length === 0) return;
    Swal.fire({
      title: `Bạn có chắc muốn xóa ${selectedItems.length} file?`,
      text: selectedItems.map(i => i.name).join(', '),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete all!',
      cancelButtonText: 'No',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        Promise.all(selectedItems.map(item =>
          this.uploadService.deleteFile(item.publicId as string).toPromise()
        )).then(() => {
          Swal.fire('Đã xóa!', 'Các file đã được xóa thành công.', 'success');
          // Xóa khỏi danh sách hiển thị
          this.mediaItems = this.mediaItems.filter(i => !selectedItems.includes(i));
          this.applyFiltersAndPagination();
        }).catch(() => {
          Swal.fire('Lỗi!', 'Không thể xóa một số file.', 'error');
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire('Đã hủy', 'Các file của bạn vẫn an toàn.', 'info');
      }
    });
  }

  hasSelectedItems(): boolean {
    return this.paginatedMediaItems.some(item => item.isChecked);
  }
}
