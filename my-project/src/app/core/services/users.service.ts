import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../../shared/model/user.model';
import { USER_API } from '../constants/api-endpoints';

// Response interfaces for better type safety
export interface UserResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
  };
}

export interface UsersListResponse {
  success: boolean;
  message: string;
  data: {
    users: User[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface UserCreateResponse {
  message: string;
  user: User;
}

export interface UserUpdateResponse {
  message: string;
  user: User;
}

export interface UserDeleteResponse {
  message: string;
}

export interface SettingsResponse {
  success: boolean;
  message: string;
  data: {
    message: string;
    settings: any;
  };
}

export interface PasswordChangeResponse {
  success: boolean;
  message: string;
}

export interface AccountDeleteResponse {
  success: boolean;
  message: string;
}

// Query parameters interface
export interface UserQueryParams extends Record<string, any> {
  page?: number;
  limit?: number;
  search?: string;
  role_id?: number;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor(private http: HttpClient) {}

  // ===== ADMIN OPERATIONS =====
  
  /**
   * Lấy tất cả user (Admin only)
   * @param params Query parameters: page, limit, search, role_id, status, sortBy, sortOrder
   */
  getAll(params?: UserQueryParams): Observable<UsersListResponse> {
    return this.http.get<UsersListResponse>(USER_API.BASE, { params });
  }

  /**
   * Lấy user theo id (Admin only)
   * @param id User ID
   */
  getById(id: number | string): Observable<UserResponse> {
    return this.http.get<UserResponse>(USER_API.GET_BY_ID(id));
  }

  /**
   * Thêm user mới (Admin only)
   * @param data User data
   */
  create(data: Partial<User>): Observable<UserCreateResponse> {
    return this.http.post<UserCreateResponse>(USER_API.ADMIN.CREATE, data);
  }

  /**
   * Sửa user (Admin only)
   * @param id User ID
   * @param data Updated user data
   */
  update(id: number | string, data: Partial<User>): Observable<UserUpdateResponse> {
    return this.http.put<UserUpdateResponse>(USER_API.UPDATE(id), data);
  }

  /**
   * Xóa user (Admin only)
   * @param id User ID
   */
  delete(id: number | string): Observable<UserDeleteResponse> {
    return this.http.delete<UserDeleteResponse>(USER_API.DELETE(id));
  }

  // ===== USER PROFILE OPERATIONS =====

  /**
   * Lấy profile của user hiện tại
   */
  getProfile(): Observable<UserResponse> {
    return this.http.get<UserResponse>(USER_API.GET_PROFILE);
  }

  /**
   * Sửa profile của user hiện tại
   * @param data Updated profile data (can be FormData for avatar upload)
   */
  updateProfile(data: Partial<User> | FormData): Observable<UserResponse> {
    return this.http.put<UserResponse>(USER_API.UPDATE_PROFILE, data);
  }

  /**
   * Đổi mật khẩu của user hiện tại
   * @param currentPassword Current password
   * @param newPassword New password
   */
  changePassword(currentPassword: string, newPassword: string): Observable<PasswordChangeResponse> {
    return this.http.put<PasswordChangeResponse>(USER_API.CHANGE_PASSWORD, { 
      current_password: currentPassword, 
      new_password: newPassword 
    });
  }

  /**
   * Lưu settings của user hiện tại
   * @param settings Settings data
   */
  saveSettings(settings: any): Observable<SettingsResponse> {
    return this.http.post<SettingsResponse>(USER_API.SAVE_SETTINGS, { settings });
  }

  /**
   * Xóa tài khoản của user hiện tại
   * @param currentPassword Current password for verification
   */
  deleteAccount(currentPassword: string): Observable<AccountDeleteResponse> {
    return this.http.delete<AccountDeleteResponse>(USER_API.DELETE_ACCOUNT, {
      body: { currentPassword }
    });
  }

  // ===== UTILITY METHODS =====

  /**
   * Kiểm tra xem user có quyền admin không
   * @param user User object
   */
  isAdmin(user: User): boolean {
    return user.role?.name === 'admin' || user.role_id === 1;
  }

  /**
   * Kiểm tra xem user có quyền moderator không
   * @param user User object
   */
  isModerator(user: User): boolean {
    return user.role?.name === 'moderator' || user.role_id === 2;
  }

  /**
   * Kiểm tra xem user có quyền author không
   * @param user User object
   */
  isAuthor(user: User): boolean {
    return user.role?.name === 'author' || user.role_id === 3;
  }

  /**
   * Kiểm tra xem user có quyền user thường không
   * @param user User object
   */
  isRegularUser(user: User): boolean {
    return user.role?.name === 'user' || user.role_id === 4;
  }

  uploadAvatar(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('avatar', file);
    return this.http.post(USER_API.UPLOAD_AVATAR, formData);
  }
}
