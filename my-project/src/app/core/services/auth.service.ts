import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, throwError } from 'rxjs';
import { AUTH_API, AuthLoginDto, AuthRegisterDto } from '../constants/api-endpoints';
import { StorageUtil, AUTH_TOKEN_KEY, USER_INFO_KEY, REFRESH_TOKEN_KEY } from '../constants/storage-key';
import { User } from '../../shared/model/user.model'; //  interface
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  hasRole(role: string): boolean {
    const user = StorageUtil.get<User>(USER_INFO_KEY);
    if (!user || !user.role || typeof user.role !== 'object') return false;
    return user.role.name.toLowerCase() === role.toLowerCase(); // Nếu `role` là object
  }

  getToken(): string | null {
    return StorageUtil.get<string>(AUTH_TOKEN_KEY);
  }

  login(data: AuthLoginDto): Observable<any> {
    return this.http.post<{ access_token: string; refresh_token: string; user: User }>(AUTH_API.LOGIN, {
      usernameOrEmail: data.email,
      password: data.password
    }).pipe(
      tap((res) => {
        if (res.access_token && res.refresh_token) {
          StorageUtil.set(AUTH_TOKEN_KEY, res.access_token);
          StorageUtil.set(REFRESH_TOKEN_KEY, res.refresh_token);
          StorageUtil.set(USER_INFO_KEY, res.user);
        } else {
          throwError(() => new Error('Invalid response from server'));
        }
      })
    );
  }

  register(data: AuthRegisterDto): Observable<any> {
    return this.http.post(AUTH_API.REGISTER, data);
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(AUTH_API.FORGOT_PASSWORD, { email });
  }

  resetPassword(data: { token: string; newPassword: string }): Observable<any> {
    return this.http.post(AUTH_API.RESET_PASSWORD, data);
  }

  refreshToken(refresh_token: string): Observable<any> {
    return this.http.post(AUTH_API.REFRESH_TOKEN, { refresh_token }).pipe(
      tap((res: any) => {
        if (res.access_token) {
          StorageUtil.set(AUTH_TOKEN_KEY, res.access_token);
        } else {
          throwError(() => new Error('Invalid refresh token response'));
        }
      })
    );
  }

  logout(): void {
    StorageUtil.remove(AUTH_TOKEN_KEY);
    StorageUtil.remove(REFRESH_TOKEN_KEY);
    StorageUtil.remove(USER_INFO_KEY);
    this.router.navigate(['/auth/login']);
  }
}
