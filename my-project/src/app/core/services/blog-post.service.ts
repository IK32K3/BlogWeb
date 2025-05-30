import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { POST_API } from '../constants/api-endpoints';
import { PostDto } from '../../shared/model/post.model';

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
    return this.http.post(POST_API.BASE, data);
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
}