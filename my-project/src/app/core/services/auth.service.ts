import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, throwError, BehaviorSubject, of } from 'rxjs';
import { catchError, delay } from 'rxjs/operators';
import { AUTH_API, USER_API, AuthLoginDto, AuthRegisterDto } from '../constants/api-endpoints';
import { AUTH_TOKEN_KEY, USER_INFO_KEY, REFRESH_TOKEN_KEY } from '../constants/storage-key';
import { User } from '../../shared/model/user.model';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { StorageService } from '../services/storage.service';
import { map } from 'rxjs/operators';
import { UsersService } from '../services/users.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private storageService: StorageService,
    private usersService: UsersService
  ) {
    this.loadUserFromToken();
  }

  getToken(): string | null {
    // Ưu tiên lấy từ localStorage, nếu không có thì lấy từ sessionStorage
    let token = this.storageService.getLocalItem<string>(AUTH_TOKEN_KEY);
    if (!token) {
      token = this.storageService.getSessionItem<string>(AUTH_TOKEN_KEY);
    }
    return token || null;
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
    console.log('AuthService: hasRole called with role', role);
    const user = this.currentUserSubject.value; // Use the BehaviorSubject value
    if (!user || !user.role || typeof user.role !== 'object') return false;
    return user.role.name.toLowerCase() === role.toLowerCase();
  }

  login(data: AuthLoginDto & { rememberMe?: boolean }): Observable<{ success: boolean, message: string, data: { user: User, tokens: { access_token: string; refresh_token: string } } }> {
    console.log('AuthService: login called');
    return this.http.post<{ success: boolean, message: string, data: { user: User, tokens: { access_token: string; refresh_token: string } } }>(AUTH_API.LOGIN, {
      usernameOrEmail: data.usernameOrEmail,
      password: data.password
    }).pipe(
      tap((res) => {
        console.log('AuthService: Login response received:', res);
        const accessToken = res.data.tokens.access_token;
        const refreshToken = res.data.tokens.refresh_token;
        const user = res.data.user;
        const rememberMe = data.rememberMe;

        if (accessToken && refreshToken && user) {
          console.log('AuthService: Saving tokens and user data');
          if (rememberMe) {
            // Lưu vào localStorage
            this.storageService.setLocalItem(AUTH_TOKEN_KEY, accessToken);
            this.storageService.setLocalItem(REFRESH_TOKEN_KEY, refreshToken);
            this.storageService.setLocalItem(USER_INFO_KEY, user);
          } else {
            // Lưu vào sessionStorage
            this.storageService.setSessionItem(AUTH_TOKEN_KEY, accessToken);
            this.storageService.setSessionItem(REFRESH_TOKEN_KEY, refreshToken);
            this.storageService.setSessionItem(USER_INFO_KEY, user);
          }
          // Update login state
          this.isLoggedInSubject.next(true);
          this.currentUserSubject.next(user);
          if (this.isTokenExpired(accessToken)) {
            console.error('AuthService: Access token is expired immediately after login');
            this.logout();
            throw new Error('Access token is expired');
          }
        } else {
          console.error('AuthService: Invalid response from server - missing required fields');
          throwError(() => new Error('Invalid response from server'));
        }
      }),
      catchError(error => {
        console.error('AuthService: Login error:', error);
        this.storageService.removeLocalItem(AUTH_TOKEN_KEY);
        this.storageService.removeLocalItem(REFRESH_TOKEN_KEY);
        this.storageService.removeLocalItem(USER_INFO_KEY);
        this.storageService.removeSessionItem(AUTH_TOKEN_KEY);
        this.storageService.removeSessionItem(REFRESH_TOKEN_KEY);
        this.storageService.removeSessionItem(USER_INFO_KEY);
        return throwError(() => error);
      })
    );
  }

  register(data: AuthRegisterDto): Observable<any> {
    return this.http.post(AUTH_API.REGISTER, {
      username: data.username,
      email: data.email,
      password: data.password,
      avatar: data.avatar
    }).pipe(
      tap((response: any) => {
        if (response.success && response.data) {
          const { user, tokens } = response.data;
          if (tokens?.access_token) {
            this.storageService.setLocalItem(AUTH_TOKEN_KEY, tokens.access_token);
          }
          if (tokens?.refresh_token) {
            this.storageService.setLocalItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
          }
          if (user) {
            this.currentUserSubject.next(user);
            this.storageService.setLocalItem(USER_INFO_KEY, user);
            this.isLoggedInSubject.next(true);
          }
        }
      }),
      map(response => response),
      catchError(error => {
        console.error('Registration error:', error);
        return throwError(() => error);
      })
    );
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(AUTH_API.FORGOT_PASSWORD, { email });
  }

  resetPassword(data: { token: string; newPassword: string }): Observable<any> {
    return this.http.post(AUTH_API.RESET_PASSWORD, data);
  }

  refreshToken(): Observable<string> {
    console.log('AuthService: refreshToken called');
    const refreshToken = this.storageService.getLocalItem<string>(REFRESH_TOKEN_KEY);

    if (!refreshToken) {
      console.error('AuthService: No refresh token found');
      this.logout();
      return throwError(() => new Error('Không có refresh token'));
    }

    return this.http.post<any>(`${AUTH_API.REFRESH_TOKEN}`, { refresh_token: refreshToken }).pipe(
      map(response => {
        console.log('AuthService: Refresh token response:', response);
        
        // Handle different response formats
        const accessToken = response.data?.tokens?.access_token || response.access_token;
        const newRefreshToken = response.data?.tokens?.refresh_token || response.refresh_token;
        const user = response.data?.user || response.user;

        if (!accessToken) {
          console.error('AuthService: No access token in refresh response');
          this.logout();
          throw new Error('Không nhận được access token mới');
        }

        // Save new tokens
        this.storageService.setLocalItem(AUTH_TOKEN_KEY, accessToken);
        if (newRefreshToken) {
          this.storageService.setLocalItem(REFRESH_TOKEN_KEY, newRefreshToken);
        }

        // Update user info if available
        if (user) {
          this.currentUserSubject.next(user);
          this.storageService.setLocalItem(USER_INFO_KEY, user);
        }

        this.isLoggedInSubject.next(true);
        console.log('AuthService: Token refresh successful');
        return accessToken;
      }),
      catchError(error => {
        console.error('AuthService: Token refresh failed:', error);
        this.logout();
        return throwError(() => new Error('Không thể làm mới token'));
      })
    );
  }

  /**
   * Lưu token xác thực
   */
  private saveToken(token: string): void {
    this.storageService.setLocalItem(AUTH_TOKEN_KEY, token);
  }

  /**
   * Xóa token xác thực
   */
  private removeToken(): void {
    this.storageService.removeLocalItem(AUTH_TOKEN_KEY);
  }

  logout(): void {
    console.log('AuthService: logout called');
    const refreshToken = this.storageService.getLocalItem<string>(REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      console.error('AuthService: No refresh token found');
      this.storageService.removeLocalItem(AUTH_TOKEN_KEY);
      this.currentUserSubject.next(null);
      this.isLoggedInSubject.next(false);
      this.router.navigate(['/home/introduce-page']);
      return;
    }

    this.http.post(`${AUTH_API.LOGOUT}`, { refresh_token: refreshToken }).pipe(
      catchError(() => of(null))
    ).subscribe(() => {
      // Sau khi gọi API logout xong, mới xóa token local
      this.storageService.removeLocalItem(AUTH_TOKEN_KEY);
      this.storageService.removeLocalItem(REFRESH_TOKEN_KEY);
      this.storageService.removeLocalItem(USER_INFO_KEY);
      this.currentUserSubject.next(null);
      this.isLoggedInSubject.next(false);
      this.router.navigate(['/home/introduce-page']);
    });
  }

  ngOnDestroy(): void {
    this.isLoggedInSubject.complete();
    this.currentUserSubject.complete(); // Complete the new BehaviorSubject
  }

  loadUserFromToken(): void {
    console.log('AuthService: loadUserFromToken called');
    const token = this.getToken();

    if (!token) {
      console.log('AuthService: loadUserFromToken - No token found or token expired.');
      // Không có token hoặc token đã hết hạn, đảm bảo trạng thái là chưa đăng nhập
      this.isLoggedInSubject.next(false);
      this.currentUserSubject.next(null);
      return; // Just return, don't logout here directly.
    }

    // Có token, gọi API để lấy thông tin người dùng và xác thực token
    console.log('AuthService: loadUserFromToken - Token found, attempting to fetch user.');
    this.http.get<{ success: boolean, message: string, data: { user: User } }>(USER_API.ME).pipe(
      tap(response => {
        console.log('AuthService: loadUserFromToken - Successfully fetched user:', response.data.user);
        // API thành công, token hợp lệ
        this.currentUserSubject.next(response.data.user);
        this.storageService.setLocalItem(USER_INFO_KEY, response.data.user); // Cập nhật cache
        this.isLoggedInSubject.next(true);
      }),
      catchError(error => {
        console.error('AuthService: loadUserFromToken - Error fetching user with token:', error);
        // API thất bại (token hết hạn, lỗi server, ...), cần đăng xuất để xóa token không hợp lệ
        console.error('Lỗi khi lấy thông tin người dùng bằng token:', error);
        this.logout(); // ONLY logout here if fetching user with current token fails
        return of(null); // Return observable empty to prevent issues
      })
    ).subscribe();
  }

  // ============================================
  // XỬ lý Lỗi HTTP - handleError
  // ============================================ Tạm thời để đây để không bị lỗi
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side errors
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side errors
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  // ============================================
  // CẬP NHẬT THÔNG TIN NGƯỜI DÙNG HIỆN TẠI - updateCurrentUser
  // ============================================
  /**
   * Cập nhật thông tin người dùng hiện tại trong AuthService
   * @param user - Thông tin người dùng đã cập nhật
   */
  updateCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
    this.storageService.setLocalItem(USER_INFO_KEY, user);
  }

  isLoggedIn(): boolean {
    return this.isLoggedInSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUserId(): number | null {
    const user = this.currentUserSubject.value;
    return user ? user.id : null;
  }

  updateAvatar(avatarUrl: string) {
    const user = this.currentUserSubject.value;
    if (user) {
      user.avatar = avatarUrl;
      this.currentUserSubject.next({ ...user });
      // Nếu bạn lưu user vào localStorage, cập nhật luôn:
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
  }

  // Check if username exists
  checkUsernameExists(username: string): Observable<boolean> {
    return this.http.get<{ success: boolean, data: { exists: boolean } }>(`${AUTH_API.CHECK_USERNAME}?username=${username}`).pipe(
      delay(500),
      map(res => res.data.exists),
      catchError(() => of(false))
    );
  }

  // Check if email exists
  checkEmailExists(email: string): Observable<boolean> {
    return this.http.get<{success: boolean, data: { exists: boolean } }>(`${AUTH_API.CHECK_EMAIL}?email=${email}`).pipe(
      delay(500),
      map(res => res.data.exists),
      catchError(() => of(false))
    );
  }
}
