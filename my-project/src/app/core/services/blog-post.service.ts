import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { POST_API, UPLOAD_API } from '../constants/api-endpoints';
import { PostDto } from '../../shared/model/post.model';
import { catchError } from 'rxjs/operators';

interface UploadResponse {
  success: boolean;
  data: {
    id: number;
    url: string;
  };
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BlogPostService {
  constructor(private http: HttpClient) { }

  // ============================================
  /**
   * Lấy danh sách bài viết với các tùy chọn phân trang và lọc
   * @param params - Các tùy chọn để lọc và phân trang
   * @returns Observable - Dữ liệu bài viết và thông tin phân trang
   */
  getAll(params?: any): Observable<any> {
    return this.http.get(POST_API.BASE, { params });
  }

  // ============================================
  /**
   * Tạo bài viết mới
   * @param data - Dữ liệu bài viết
   * @returns Observable - Dữ liệu bài viết đã tạo
   */
  create(data: PostDto): Observable<any> {
    return this.http.post(POST_API.BASE, data).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Create post error:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to create post'));
      })
    );
  }

  // ============================================
  /**
   * Lấy thông tin bài viết theo ID
   * @param id - ID của bài viết
   * @returns Observable - Dữ liệu bài viết
   */
  getById(id: number | string): Observable<any> {
    return this.http.get(POST_API.GET_BY_ID(id));
  }

  // ============================================
  /**
   * Cập nhật thông tin bài viết
   * @param id - ID của bài viết
   * @param data - Dữ liệu bài viết
   * @returns Observable - Dữ liệu bài viết đã cập nhật
   */
  update(id: number | string, data: PostDto): Observable<any> {
    return this.http.put(POST_API.GET_BY_ID(id), data);
  }

  // ============================================
  /**
   * Xóa bài viết
   * @param id - ID của bài viết
   * @returns Observable - Dữ liệu bài viết đã xóa
   */
  delete(id: number | string): Observable<any> {
    return this.http.delete(POST_API.GET_BY_ID(id));
  }

  // ============================================
  /**
   * Tìm kiếm bài viết với các tùy chọn phân trang và lọc
   * @param params - Các tùy chọn để lọc và phân trang
   * @returns Observable - Dữ liệu bài viết và thông tin phân trang
   */
  search(params?: any): Observable<any> {
    return this.http.get(POST_API.SEARCH, { params });
  } 

  // ============================================
  /**
   * Lấy danh sách bài viết theo danh mục với các tùy chọn phân trang và lọc
   * @param categoryId - ID của danh mục
   * @param params - Các tùy chọn để lọc và phân trang
   * @returns Observable - Dữ liệu bài viết và thông tin phân trang
   */
  getByCategory(categoryId: number | string, params?: any): Observable<any> {
    return this.http.get(POST_API.GET_BY_CATEGORY(categoryId), { params });
  }

  // ============================================
  // Các hàm khác giữ nguyên nếu cần (ví dụ: getPostBySlug, getRelatedPosts, getComments, postComment)
  getPostBySlug(slug: string): Observable<any> {
    return this.http.get(POST_API.GET_BY_SLUG(slug));
  }

  getRelatedPosts(categoryId: number): Observable<any> {
    return this.http.get(POST_API.GET_BY_CATEGORY(categoryId));
  }

  getComments(postId: number): Observable<any> {
    return this.http.get(`/comments/post/${postId}`);
  }

  postComment(postId: number, comment: any): Observable<any> {
    return this.http.post(`/comments/post/${postId}`, comment);
  }

  uploadImage(formData: FormData): Observable<UploadResponse> {
    return this.http.post<UploadResponse>(UPLOAD_API.UPLOAD_IMAGE, formData).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Upload error:', error);
        if (error.status === 404) {
          return throwError(() => new Error('Upload endpoint not found. Please check server configuration.'));
        }
        if (error.status === 413) {
          return throwError(() => new Error('File size too large. Maximum size is 5MB.'));
        }
        if (error.status === 415) {
          return throwError(() => new Error('Invalid file type. Please upload JPG or PNG only.'));
        }
        return throwError(() => new Error(error.error?.message || 'Failed to upload image'));
      })
    );
  }
}