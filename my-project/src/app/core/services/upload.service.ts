import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { UPLOAD_API } from '../constants/api-endpoints';

export interface MediaResponse {
  id: number;
  url: string;
  name?: string;
  type?: string;
  metadata?: Record<string, any>;
}

export interface CloudinaryMediaItem {
  id: string;
  name: string;
  type: 'Image' | 'Video' | 'Document' | 'Audio';
  size: string;
  dimensionsOrDuration?: string;
  url: string;
  thumbnailUrl: string;
  publicId: string;
  format: string;
  width?: number;
  height?: number;
  createdAt: Date;
  tagText: string;
  tagBgColor: string;
  tagTextColor: string;
  isChecked: boolean;
  permission?: 'admin' | 'public';
}

export interface MediaListResponse {
  mediaItems: CloudinaryMediaItem[];
  pagination: {
    nextCursor?: string;
    hasMore: boolean;
    totalCount: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  constructor(private http: HttpClient) {}

  /**
   * Upload một file
   */
  uploadFile(file: File, options?: {
    name?: string;
    type?: 'image' | 'video' | 'document' | 'gallery';
    metadata?: Record<string, any>;
  }): Observable<MediaResponse> {
    const formData = new FormData();
    formData.append('image', file);
    
    if (options?.name) {
      formData.append('name', options.name);
    }
    if (options?.type) {
      formData.append('type', options.type);
    }
    if (options?.metadata) {
      formData.append('metadata', JSON.stringify(options.metadata));
    }

    return this.http.post<{success: boolean; data: MediaResponse}>(UPLOAD_API.UPLOAD_SINGLE, formData).pipe(
      map(response => response.data)
    );
  }

  /**
   * Upload nhiều file
   */
  uploadFiles(files: File[], options?: {
    name?: string;
    type?: 'image' | 'video' | 'document' | 'gallery';
    metadata?: Record<string, any>;
    folder?: string; // Thêm dòng này
  }): Observable<MediaResponse[]> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });
    
    if (options?.name) {
      formData.append('name', options.name);
    }
    if (options?.type) {
      formData.append('type', options.type);
    }
    if (options?.metadata) {
      formData.append('metadata', JSON.stringify(options.metadata));
    }
    if (options?.folder) {
      formData.append('folder', options.folder);
    }

    return this.http.post<{success: boolean; data: MediaResponse[]}>(UPLOAD_API.UPLOAD_MULTIPLE, formData).pipe(
      map(response => response.data)
    );
  }

  /**
   * Upload ảnh cho editor
   */
  uploadEditorImage(file: File): Observable<{ success: number; file: { url: string } }> {
    const formData = new FormData();
    formData.append('upload', file);

    return this.http.post<{success: boolean; data: {url: string}}>(UPLOAD_API.UPLOAD_EDITOR, formData).pipe(
      map(response => ({
        success: 1,
        file: {
          url: response.data.url
        }
      }))
    );
  }

  /**
   * Kiểm tra kích thước file
   */
  validateFileSize(file: File, maxSizeMB: number = 5): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  }

  /**
   * Kiểm tra loại file
   */
  validateFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.type);
  }

  /**
   * Tạo URL preview cho file
   */
  createPreviewUrl(file: File): string {
    return URL.createObjectURL(file);
  }

  /**
   * Hủy URL preview
   */
  revokePreviewUrl(url: string): void {
    URL.revokeObjectURL(url);
  }

  /**
   * Lấy tất cả media từ Cloudinary
   */
  getAllMedia(params?: {
    folder?: string;
    maxResults?: number;
    nextCursor?: string;
    type?: string;
    prefix?: string;
    tags?: string;
  }): Observable<MediaListResponse> {
    let url = UPLOAD_API.GET_ALL_MEDIA;
    
    if (params) {
      const queryParams = new URLSearchParams();
      if (params.folder) queryParams.append('folder', params.folder);
      if (params.maxResults) queryParams.append('maxResults', params.maxResults.toString());
      if (params.nextCursor) queryParams.append('nextCursor', params.nextCursor);
      if (params.type) queryParams.append('type', params.type);
      if (params.prefix) queryParams.append('prefix', params.prefix);
      if (params.tags) queryParams.append('tags', params.tags);
      
      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
      }
    }

    return this.http.get<{success: boolean; data: MediaListResponse}>(url).pipe(
      map(response => response.data)
    );
  }

  /**
   * Xóa file từ Cloudinary
   */
  deleteFile(publicId: string): Observable<any> {
    return this.http.delete<{success: boolean; data: any}>(UPLOAD_API.DELETE(publicId)).pipe(
      map(response => response.data)
    );
  }
}
