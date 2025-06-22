import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';
import { API_ENDPOINTS } from 'app/core/constants/api-endpoints';
import { Post } from 'app/shared/model/post.model';
import { UsersService } from './users.service';
import { BlogPostService } from './blog-post.service';

export interface DashboardStats {
  totalPosts: number;
  totalUsers: number;
  totalComments: number;
  totalViews: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(
    private http: HttpClient,
    private usersService: UsersService,
    private blogPostService: BlogPostService,
    ) { }

  getDashboardStats(): Observable<DashboardStats> {
    const posts$ = this.blogPostService.getAll();
    const users$ = this.usersService.getAll();
    const comments$ = this.http.get<any>(API_ENDPOINTS.COMMENT.BASE); // Assuming a general comment endpoint exists

    return forkJoin([posts$, users$, comments$]).pipe(
      map(([postsRes, usersRes, commentsRes]) => {
        const totalViews = postsRes.data.posts.reduce((sum: number, post: Post) => sum + (post.views || 0), 0);
        
        return {
          totalPosts: postsRes.data.pagination.total,
          totalUsers: usersRes.data.pagination.total,
          totalComments: commentsRes.data.total, // Adjust if comment response is different
          totalViews: totalViews
        };
      })
    );
  }

  getRecentPosts(): Observable<Post[]> {
    return this.blogPostService.getAll({ sortBy: 'createdAt', sortOrder: 'desc', limit: 5 }).pipe(
      map(res => res.data.posts)
    );
  }
} 