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
}
