import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, throwError, BehaviorSubject, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AUTH_API, AuthLoginDto, AuthRegisterDto } from '../constants/api-endpoints';
import { StorageUtil, AUTH_TOKEN_KEY, USER_INFO_KEY, REFRESH_TOKEN_KEY } from '../constants/storage-key';
import { User } from '../../shared/model/user.model'; //  interface
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _isLoggedIn$ = new BehaviorSubject<boolean>(this.checkInitialLoginStatus());
  isLoggedIn$ = this._isLoggedIn$.asObservable(); // Public observable

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Listen for storage changes and update the BehaviorSubject
    window.addEventListener('storage', this.storageEventHandler);
  }

  private checkInitialLoginStatus(): boolean {
    // Check storage on service initialization
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  private storageEventHandler = () => {
    // Update the BehaviorSubject when storage changes
    this._isLoggedIn$.next(this.checkInitialLoginStatus());
  };

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
          this._isLoggedIn$.next(true); // Emit true after successful login
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
          this._isLoggedIn$.next(true); // Ensure state is true after refresh
        } else {
          throwError(() => new Error('Invalid refresh token response'));
        }
      }),
      catchError((err: HttpErrorResponse) => {
        this._isLoggedIn$.next(false); // Emit false if refresh fails
        // ... handle error ...
        return throwError(() => err);
      })
    );
  }

  logout(): void {
    StorageUtil.remove(AUTH_TOKEN_KEY);
    StorageUtil.remove(REFRESH_TOKEN_KEY);
    StorageUtil.remove(USER_INFO_KEY);
    this._isLoggedIn$.next(false); // Emit false after logout
    this.router.navigate(['/auth/login']);
  }

  ngOnDestroy(): void {
    window.removeEventListener('storage', this.storageEventHandler);
    this._isLoggedIn$.complete(); // Complete the BehaviorSubject on destroy
  }
}
