import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comment, CommentDto } from '../../shared/model/comment.model';

@Injectable({
  providedIn: 'root'
})
export class CommentsService {
  private API_URL = '/api/comments';

  constructor(private http: HttpClient) {}

  // Lấy comment của 1 post
  getCommentsByPost(postId: number, page: number = 1, limit: number = 20): Observable<{ comments: Comment[], pagination: any }> {
    return this.http.get<{ comments: Comment[], pagination: any }>(
      `${this.API_URL}/post/${postId}?page=${page}&limit=${limit}`
    );
  }

  // Thêm comment vào 1 post
  addComment(postId: number, dto: CommentDto): Observable<{ message: string, comment: Comment }> {
    return this.http.post<{ message: string, comment: Comment }>(
      `${this.API_URL}/post/${postId}`, dto
    );
  }

  // Sửa comment
  updateComment(commentId: number, content: string): Observable<{ message: string, comment: Comment }> {
    return this.http.put<{ message: string, comment: Comment }>(
      `${this.API_URL}/${commentId}`, { content }
    );
  }

  // Xóa comment
  deleteComment(commentId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.API_URL}/${commentId}`
    );
  }

  // Lấy comment của chính mình
  getMyComments(page: number = 1, limit: number = 20): Observable<{ comments: Comment[], pagination: any }> {
    return this.http.get<{ comments: Comment[], pagination: any }>(
      `${this.API_URL}/my?page=${page}&limit=${limit}`
    );
  }
}
