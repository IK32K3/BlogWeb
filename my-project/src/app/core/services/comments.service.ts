import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comment, CreateCommentDto ,UpdateCommentDto } from '../../shared/model/comment.model';
import { API_BASE, POST_API } from '../constants/api-endpoints';
import { User } from '../../shared/model/user.model';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface CommentsListResponse {
  success: boolean;
  message: string;
  data: {
    comments: Comment[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class CommentsService {
  private API_URL = `${API_BASE}/comments`;

  constructor(private http: HttpClient) {}

  getAllComments(params?: any): Observable<CommentsListResponse> {
    return this.http.get<CommentsListResponse>(this.API_URL, { params });
  }

  // Lấy comment của 1 post
  getCommentsByPost(postId: number, page: number = 1, limit: number = 20): Observable<{ comments: Comment[], pagination: any }> {
    return this.http.get<{ comments: Comment[], pagination: any }>(
      `${POST_API.GET_COMMENTS(postId)}?page=${page}&limit=${limit}`
    );
  }

  // Thêm comment vào 1 post
  addComment(postId: number, dto: CreateCommentDto): Observable<{ message: string, comment: Comment, user: User }> {
    return this.http.post<{ message: string, comment: Comment, user: User }>(
      POST_API.ADD_COMMENT(postId), dto
    );
  }

  // Sửa comment
  updateComment(commentId: number, dto: UpdateCommentDto): Observable<{ message: string, comment: Comment }> {
    return this.http.put<{ message: string, comment: Comment }>(
      `${this.API_URL}/${commentId}`,  dto 
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
