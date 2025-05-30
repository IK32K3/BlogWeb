import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AUTH_API, AuthLoginDto, AuthRegisterDto } from '../constants/api-endpoints';
import { StorageUtil, AUTH_TOKEN_KEY, USER_INFO_KEY } from '../constants/storage-key';
import { User } from '../../shared/model/user.model'; //  interface

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http: HttpClient) {}

  isLoggedIn(): boolean {
    return !!StorageUtil.get<string>(AUTH_TOKEN_KEY);
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
    return this.http.post<{ accessToken: string; user: User }>(AUTH_API.LOGIN, {
      usernameOrEmail: data.email,
      password: data.password
    }).pipe(
      tap((res) => {
        StorageUtil.set(AUTH_TOKEN_KEY, res.accessToken);
        StorageUtil.set(USER_INFO_KEY, res.user);
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
    return this.http.post(AUTH_API.REFRESH_TOKEN, { refresh_token });
  }

  logout(): void {
    StorageUtil.remove(AUTH_TOKEN_KEY);
    StorageUtil.remove(USER_INFO_KEY);
  }
}
