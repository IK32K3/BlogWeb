import { Component, OnInit } from '@angular/core';
import { UploadService, CloudinaryMediaItem, MediaListResponse } from '../../core/services/upload.service';
import { SlidebarAdminComponent } from '../../shared/components/slidebar-admin/slidebar-admin.component';
import { HeaderAdminComponent } from 'app/shared/components/header-admin/header-admin.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-media',
  imports: [CommonModule, FormsModule, SlidebarAdminComponent, HeaderAdminComponent],
  templateUrl: './admin-media.component.html',
  styleUrl: './admin-media.component.css'
})
export class AdminMediaComponent implements OnInit {
  mediaItems: CloudinaryMediaItem[] = [];
  paginatedMediaItems: CloudinaryMediaItem[] = [];
  isLoading = false;
  currentPage: number = 1;
  itemsPerPage: number = 12;
  totalItems: number = 0;
  searchTerm: string = '';
  selectedType: string = '';
  selectedPermission: string = '';
  folders = [
    { name: 'Tất cả media', icon: 'fas fa-folder', key: 'all' },
    { name: 'Ảnh sản phẩm', icon: 'fas fa-folder', key: 'product' },
    { name: 'Ảnh bài viết', icon: 'fas fa-folder', key: 'post' },
    { name: 'Video', icon: 'fas fa-folder', key: 'video' }
  ];
  selectedFolder = 'all';

  constructor(private uploadService: UploadService) {}

  ngOnInit(): void {
    this.loadMediaItems();
  }

  loadMediaItems(): void {
    this.isLoading = true;
    this.uploadService.getAllMedia({
      maxResults: 100,
      type: 'upload'
    }).subscribe({
      next: (response: MediaListResponse) => {
        // Chuyển đổi type về đúng format nếu cần
        this.mediaItems = response.mediaItems.map(item => ({
          ...item,
          type: String(item.type).toLowerCase() === 'image' ? 'Image'
               : String(item.type).toLowerCase() === 'video' ? 'Video'
               : item.type
        }));
        this.totalItems = this.mediaItems.length;
        this.applyFiltersAndPagination();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading media items:', error);
        this.isLoading = false;
      }
    });
  }

  applyFiltersAndPagination(): void {
    let filtered = [...this.mediaItems];

    // Lọc theo từ khóa tìm kiếm
    if (this.searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Lọc theo loại (type)
    if (this.selectedType) {
      filtered = filtered.filter(item => item.type === this.selectedType);
    }

    // Lọc theo phân quyền (permission)
    if (this.selectedPermission) {
      filtered = filtered.filter(item => item.permission === this.selectedPermission);
    }

    this.totalItems = filtered.length;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedMediaItems = filtered.slice(startIndex, startIndex + this.itemsPerPage);
  }

  onSearchTermChange(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.currentPage = 1;
    this.applyFiltersAndPagination();
  }
  onFileSelected(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    if (files && files.length) {
      this.uploadService.uploadFiles(Array.from(files), {
        folder: this.selectedFolder !== 'all' ? this.selectedFolder : undefined
      }).subscribe(() => {
        this.loadMediaItems();
      });
    }
  }
  onDrop(event: DragEvent) {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files && files.length) {
      this.uploadService.uploadFiles(Array.from(files), {
        folder: this.selectedFolder !== 'all' ? this.selectedFolder : undefined
      }).subscribe(() => {
        this.loadMediaItems();
      });
    }
  }
  onDragOver(event: DragEvent) {
    event.preventDefault();
  }
  onSelectFolder(key: string) {
    this.selectedFolder = key;
    // TODO: filter media by folder if needed
  }

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
  
  deleteMedia(item: CloudinaryMediaItem) {
    Swal.fire({
      title: 'Bạn có chắc muốn xóa ảnh này?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    }).then((result) => {
      if (result.isConfirmed) {
        this.uploadService.deleteFile(item.publicId).subscribe(() => {
          this.loadMediaItems();
          Swal.fire('Đã xóa!', 'Ảnh đã được xóa.', 'success');
        });
      }
    });
  }
}
