import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BlogPostService {
  private apiUrl = 'http://localhost:3000/posts';

  constructor(private http: HttpClient) {}

  // Lấy bài viết theo slug
  getPostBySlug(slug: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/slug/${slug}`);
  }
  getPostById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/posts/${id}`);
  }
  // Lấy bài viết theo category
  getRelatedPosts(categoryId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/categories/${categoryId}`);
  }

  // Lấy bình luận theo postId
  getComments(postId: number): Observable<any> {
    return this.http.get<any>(`http://localhost:3000/comments/post/${postId}`);
  }

  // Thêm bình luận mới
  postComment(postId: number, comment: any): Observable<any> {
    return this.http.post<any>(`http://localhost:3000/comments/post/${postId}`, comment);
  }
}