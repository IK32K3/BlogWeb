import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comment, CreateCommentDto ,UpdateCommentDto } from '../../shared/model/comment.model';
import { COMMENT_API } from '../constants/api-endpoints';
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
  constructor(private http: HttpClient) {}

  // Lấy tất cả comment (admin)
  getAllComments(params?: any): Observable<CommentsListResponse> {
    return this.http.get<CommentsListResponse>(COMMENT_API.GET_ALL, { params });
  }

  // Lấy comment của 1 post
  getCommentsByPost(postId: number, page: number = 1, limit: number = 20): Observable<{ comments: Comment[], pagination: any }> {
    return this.http.get<{ comments: Comment[], pagination: any }>(
      `${COMMENT_API.GET_BY_POST(postId)}?page=${page}&limit=${limit}`
    );
  }

  // Thêm comment vào 1 post
  addComment(postId: number, dto: CreateCommentDto): Observable<{ message: string, comment: Comment, user: User }> {
    return this.http.post<{ message: string, comment: Comment, user: User }>(
      COMMENT_API.GET_BY_POST(postId), dto
    );
  }

  // Sửa comment
  updateComment(commentId: number, dto: UpdateCommentDto): Observable<{ message: string, comment: Comment }> {
    return this.http.put<{ message: string, comment: Comment }>(
      COMMENT_API.UPDATE(commentId),  dto 
    );
  }

  // Xóa comment
  deleteComment(commentId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      COMMENT_API.DELETE(commentId)
    );
  }

  // Lấy comment của chính mình
  getMyComments(page: number = 1, limit: number = 20): Observable<{ comments: Comment[], pagination: any }> {
    return this.http.get<{ comments: Comment[], pagination: any }>(
      `${COMMENT_API.GET_MY}?page=${page}&limit=${limit}`
    );
  }

  // Lấy comment theo id
  getCommentById(commentId: number): Observable<{ comment: Comment }> {
    return this.http.get<{ comment: Comment }>(
      COMMENT_API.GET_BY_ID(commentId)
    );
  }
}
