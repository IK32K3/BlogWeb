import { CommonModule } from '@angular/common';
import { Component , EventEmitter, Input, Output, HostListener, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface FilePreview {
  file: File;
  name: string;
  size: string; // Formatted size
  typeIcon: string; // Font Awesome class for icon
  progress?: number; // 0-100
  status?: 'pending' | 'uploading' | 'success' | 'error' | 'cancelled';
  errorMessage?: string;
}

@Component({
  selector: 'app-upload-modal',
  imports: [CommonModule,FormsModule],
  standalone:true,
  templateUrl: './upload-modal.component.html',
  styleUrl: './upload-modal.component.css'
})
export class UploadModalComponent {
  @Input() isVisible: boolean = false;
  @Output() closeModalEvent = new EventEmitter<void>();
  @Output() filesUploadedEvent = new EventEmitter<File[]>();

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  selectedFilePreviews: FilePreview[] = [];
  isDragging: boolean = false;
  isUploading: boolean = false;
  overallProgress: number = 0;
  totalFilesToUpload: number = 0;
  filesCurrentlyUploaded: number = 0;

  constructor() { }

  // Getter for the "Start Upload" button's disabled state
  get isStartUploadDisabled(): boolean {
    const pendingFilesCount = this.selectedFilePreviews.filter(f => f.status === 'pending').length;
    return pendingFilesCount === 0 || this.isUploading;
  }

  // Getter for the "Cancel" button's disabled state (already simple, but for consistency if preferred)
  get isCancelDisabledDuringUpload(): boolean {
    return this.isUploading && this.totalFilesToUpload > 0;
  }

  // Getter for the "Cancel" button's text
  get cancelOrUploadingText(): string {
    return this.isUploading && this.totalFilesToUpload > 0 ? 'Uploading...' : 'Cancel';
  }

  // --- Drag and Drop ---
  @HostListener('dragover', ['$event']) onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (this.isVisible && !this.isUploading) {
        this.isDragging = true;
    }
  }

  @HostListener('dragleave', ['$event']) onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const dropzoneElement = (event.currentTarget as HTMLElement).querySelector('#uploadDropzone');
    if (dropzoneElement && !dropzoneElement.contains(event.relatedTarget as Node)) {
        this.isDragging = false;
    } else if (!dropzoneElement) {
        this.isDragging = false;
    }
  }

  @HostListener('drop', ['$event']) onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (this.isVisible && !this.isUploading) {
        this.isDragging = false;
        const files = event.dataTransfer?.files;
        if (files) {
          this.handleFiles(files);
        }
    }
  }

  onFileDropzoneClick(): void {
    if (!this.isUploading) {
        this.fileInput.nativeElement.click();
    }
  }

  onFileSelected(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files) {
      this.handleFiles(inputElement.files);
      inputElement.value = '';
    }
  }

  handleFiles(files: FileList): void {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} exceeds the 10MB limit.`);
        continue;
      }
      this.selectedFilePreviews.push({
        file: file,
        name: file.name,
        size: this.formatFileSize(file.size),
        typeIcon: this.getFileTypeIcon(file.type),
        status: 'pending'
      });
    }
  }

  removeFile(index: number): void {
    if (!this.isUploading) {
        this.selectedFilePreviews.splice(index, 1);
    }
  }

  formatFileSize(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  getFileTypeIcon(fileType: string): string {
    if (fileType.startsWith('image/')) return 'fas fa-image';
    if (fileType === 'application/pdf') return 'fas fa-file-pdf';
    if (fileType.startsWith('video/')) return 'fas fa-video';
    if (fileType.startsWith('audio/')) return 'fas fa-music';
    if (fileType === 'application/msword' || fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'fas fa-file-word';
    if (fileType === 'application/vnd.ms-excel' || fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') return 'fas fa-file-excel';
    return 'fas fa-file-alt';
  }

  close(): void {
    if (!this.isUploading) {
      this.resetModalState();
      this.closeModalEvent.emit();
    } else {
      if (confirm('Uploads are in progress. Are you sure you want to cancel?')) {
        this.resetModalState();
        this.closeModalEvent.emit();
      }
    }
  }

  resetModalState(): void {
    this.selectedFilePreviews = [];
    this.isDragging = false;
    this.isUploading = false;
    this.overallProgress = 0;
    this.totalFilesToUpload = 0;
    this.filesCurrentlyUploaded = 0;
    if (this.fileInput) {
        this.fileInput.nativeElement.value = '';
    }
  }

  async startUpload(): Promise<void> {
    if (this.isStartUploadDisabled) { // Use the getter here as well for consistency
      return;
    }

    this.isUploading = true;
    this.totalFilesToUpload = this.selectedFilePreviews.filter(f => f.status === 'pending').length;
    this.filesCurrentlyUploaded = 0;
    this.overallProgress = 0;

    const filesToUploadActually: File[] = [];

    for (const preview of this.selectedFilePreviews) {
      if (preview.status === 'pending') {
        preview.status = 'uploading';
        preview.progress = 0;
        try {
          await this.simulateFileUpload(preview);
          preview.status = 'success';
          filesToUploadActually.push(preview.file);
        } catch (error) {
          preview.status = 'error';
          preview.errorMessage = (error as Error).message || 'Upload failed';
          console.error(`Error uploading ${preview.name}:`, error);
        } finally {
          this.filesCurrentlyUploaded++;
          // Ensure totalFilesToUpload is not zero to avoid division by zero
          if (this.totalFilesToUpload > 0) {
            this.overallProgress = Math.round((this.filesCurrentlyUploaded / this.totalFilesToUpload) * 100);
          } else {
            this.overallProgress = 0; // Or 100 if it implies completion of zero files
          }
        }
      }
    }

    const allDone = this.selectedFilePreviews.every(p => p.status === 'success' || p.status === 'error');
    if (allDone) {
        this.isUploading = false;
        if (filesToUploadActually.length > 0) {
            this.filesUploadedEvent.emit(filesToUploadActually);
        }
    }
  }

  private simulateFileUpload(preview: FilePreview): Promise<void> {
    return new Promise((resolve, reject) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        preview.progress = progress;
        if (progress >= 100) {
          clearInterval(interval);
            resolve();
        }
      }, 200);
    });
  }
}
