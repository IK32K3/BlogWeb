import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Media } from '../../shared/model/media.model';

@Injectable({
  providedIn: 'root'
})
export class MediaService {
  private API_URL = '/api/media';

  constructor(private http: HttpClient) {}

  // Lấy tất cả media (có thể truyền params: page, limit, search, type, user_id)
  getAll(params?: any): Observable<{ media: Media[], pagination: any }> {
    return this.http.get<{ media: Media[], pagination: any }>(this.API_URL, { params });
  }

  // Lấy media theo id
  getById(id: number | string): Observable<{ media: Media }> {
    return this.http.get<{ media: Media }>(`${this.API_URL}/${id}`);
  }

  // Thêm media mới
  create(data: Partial<Media>): Observable<{ message: string, media: Media }> {
    return this.http.post<{ message: string, media: Media }>(this.API_URL, data);
  }

  // Sửa media
  update(id: number | string, data: Partial<Media>): Observable<{ message: string, media: Media }> {
    return this.http.put<{ message: string, media: Media }>(`${this.API_URL}/${id}`, data);
  }

  // Xóa media
  delete(id: number | string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.API_URL}/${id}`);
  }
}
