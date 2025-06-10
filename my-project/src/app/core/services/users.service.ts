import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../../shared/model/user.model';
import { API_BASE } from '../constants/api-endpoints';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private API_URL = `${API_BASE}/users`;

  constructor(private http: HttpClient) {}

  // Lấy tất cả user (có thể truyền params: page, limit, search, role_id)
  getAll(params?: any): Observable<{ success: boolean, message: string, data: { users: User[], pagination: any } }> {
    return this.http.get<{ success: boolean, message: string, data: { users: User[], pagination: any } }>(this.API_URL, { params });
  }

  // Lấy user theo id
  getById(id: number | string): Observable<{ user: User }> {
    return this.http.get<{ user: User }>(`${this.API_URL}/${id}`);
  }

  // Thêm user mới
  create(data: Partial<User>): Observable<{ message: string, user: User }> {
    return this.http.post<{ message: string, user: User }>(this.API_URL, data);
  }

  // Sửa user
  update(id: number | string, data: Partial<User>): Observable<{ message: string, user: User }> {
    return this.http.put<{ message: string, user: User }>(`${this.API_URL}/${id}`, data);
  }

  // Xóa user
  delete(id: number | string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.API_URL}/${id}`);
  }

  // Lấy profile của user hiện tại
  getProfile(): Observable<{ success: boolean, message: string, data: { user: User } }> {
    return this.http.get<{ success: boolean, message: string, data: { user: User } }>(`${this.API_URL}/me`);
  }

  // Sửa profile của user hiện tại
  updateProfile(data: Partial<User>): Observable<{ success: boolean, message: string, data: { message: string, user: User } }> {
    return this.http.put<{ success: boolean, message: string, data: { message: string, user: User } }>(`${this.API_URL}/me`, data);
  }

  // Đổi mật khẩu
  changePassword(currentPassword: string, newPassword: string): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.API_URL}/me/change-password`, { currentPassword, newPassword });
  }

  // Lưu settings
  saveSettings(settings: any): Observable<{ message: string, settings: any }> {
    return this.http.post<{ message: string, settings: any }>(`${this.API_URL}/me/settings`, { settings });
  }
}
