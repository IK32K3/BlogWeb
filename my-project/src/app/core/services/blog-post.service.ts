import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { POST_API, UPLOAD_API } from '../constants/api-endpoints';
import { PostDto, Post, Comment } from '../../shared/model/post.model';
import { catchError } from 'rxjs/operators';

interface UploadResponse {
  success: boolean;
  data: {
    id: number;
    url: string;
  };
  message?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
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
  getAll(params?: any): Observable<{ success: boolean, message: string, data: { posts: Post[], pagination: any } }> {
    const queryParams = {
      ...params,
      include: ['category', 'author']
    };
    return this.http.get<{ success: boolean, message: string, data: { posts: Post[], pagination: any } }>(POST_API.BASE, { params: queryParams });
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
  getById(id: number | string): Observable<ApiResponse<Post>> {
    return this.http.get<ApiResponse<Post>>(POST_API.GET_BY_ID(id));
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
  search(params?: any): Observable<{ success: boolean, message: string, data: { posts: Post[], pagination: any } }> {
    const queryParams = {
      ...params,
      include: ['category', 'author']
    };
    return this.http.get<{ success: boolean, message: string, data: { posts: Post[], pagination: any } }>(POST_API.GET_ALL, { params: queryParams });
  } 

  // ============================================
  /**
   * Lấy danh sách bài viết theo danh mục với các tùy chọn phân trang và lọc
   * @param categoryId - ID của danh mục
   * @param params - Các tùy chọn để lọc và phân trang
   * @returns Observable - Dữ liệu bài viết và thông tin phân trang
   */
  getByCategory(categoryId: number | string, params?: any): Observable<any> {
    const queryParams = {
      ...params,
      include: ['category', 'author']
    };
    return this.http.get(POST_API.GET_BY_CATEGORY(categoryId), { params: queryParams });
  }

  // ============================================
  /**
   * Lấy bài viết theo slug
   * @param slug - Slug của bài viết
   * @returns Observable - Dữ liệu bài viết
   */
  getPostBySlug(slug: string): Observable<ApiResponse<Post>> {
    return this.http.get<ApiResponse<Post>>(POST_API.GET_BY_SLUG(slug));
  }

  // ============================================
  /**
   * Lấy danh sách bài viết liên quan
   * @param categoryId - ID của danh mục
   * @returns Observable - Dữ liệu bài viết liên quan
   */
  getRelatedPosts(categoryId: number): Observable<ApiResponse<Post[]>> {
    return this.http.get<ApiResponse<Post[]>>(POST_API.GET_BY_CATEGORY(categoryId));
  }

  // ============================================
  /**
   * Lấy danh sách bình luận của bài viết
   * @param postId - ID của bài viết
   * @returns Observable - Dữ liệu bình luận
   */
  getComments(postId: number): Observable<ApiResponse<Comment[]>> {
    return this.http.get<ApiResponse<Comment[]>>(`/comments/post/${postId}`);
  }

  // ============================================
  /**
   * Lấy danh sách bài viết của người dùng hiện tại
   * @returns Observable - Dữ liệu bài viết
   */
  getMyPosts(): Observable<ApiResponse<{ posts: Post[] }>> {
    return this.http.get<ApiResponse<{ posts: Post[] }>>(POST_API.GET_MY).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Get my posts error:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to get my posts'));
      })
    );
  }

  // ============================================
  /**
   * Thêm bình luận cho bài viết
   * @param postId - ID của bài viết
   * @param text - Nội dung bình luận
   * @returns Observable - Dữ liệu bình luận đã thêm
   */
  postComment(postId: number, text: string): Observable<ApiResponse<Comment>> {
    return this.http.post<ApiResponse<Comment>>(`/comments/post/${postId}`, { text });
  }

  // ============================================
  /**
   * Xóa bài viết
   * @param postId - ID của bài viết
   * @returns Observable - Kết quả xóa
   */
  deletePost(postId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(POST_API.GET_BY_ID(postId)).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Delete post error:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to delete post'));
      })
    );
  }

  // ============================================
  /**
   * Upload hình ảnh
   * @param formData - Dữ liệu form chứa file
   * @returns Observable - Dữ liệu upload
   */
  uploadImage(formData: FormData): Observable<UploadResponse> {
    console.log('Uploading image with FormData:', formData);
    return this.http.post<UploadResponse>(UPLOAD_API.UPLOAD_SINGLE, formData).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Upload error details:', {
          status: error.status,
          statusText: error.statusText,
          error: error.error,
          headers: error.headers,
          url: error.url
        });
        
        if (error.status === 404) {
          return throwError(() => new Error('Upload endpoint not found. Please check server configuration.'));
        }
        if (error.status === 413) {
          return throwError(() => new Error('File size too large. Maximum size is 5MB.'));
        }
        if (error.status === 415) {
          return throwError(() => new Error('Invalid file type. Please upload JPG or PNG only.'));
        }
        if (error.status === 500) {
          return throwError(() => new Error(`Server error: ${error.error?.message || 'Unknown server error'}`));
        }
        return throwError(() => new Error(error.error?.message || 'Failed to upload image'));
      })
    );
  }
}