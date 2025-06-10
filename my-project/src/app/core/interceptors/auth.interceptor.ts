import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError, BehaviorSubject, filter, take } from 'rxjs';
import { AUTH_API } from '../constants/api-endpoints';

// --- State Management cho quá trình Refresh Token ---
// Biến này phải được định nghĩa bên ngoài hàm interceptor để giữ trạng thái qua các lần gọi
let isRefreshing = false;
// Subject để chứa token mới, các request đang chờ sẽ lắng nghe subject này
const refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Move the inject() call inside the interceptor function to avoid circular dependency
  const authService = inject(AuthService);

  // Tránh thêm token vào các request không cần thiết
  if (
    req.url.includes(AUTH_API.LOGIN) ||
    req.url.includes(AUTH_API.REGISTER) ||
    req.url.includes(AUTH_API.REFRESH_TOKEN)
  ) {
    return next(req);
  }

  const token = authService.getToken();
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        // Pass the top-level injected authService instance to handle401Error
        return handle401Error(authReq, next, authService);
      }
      
      return throwError(() => error);
    })
  );
};


// Tách logic xử lý lỗi 401 ra một hàm riêng để dễ đọc
function handle401Error(req: HttpRequest<any>, next: HttpHandlerFn, authService: AuthService) {
  // Nếu request gây lỗi 401 chính là request refresh token -> logout
  if (req.url.includes(AUTH_API.REFRESH_TOKEN)) {
    isRefreshing = false;
    authService.logout();
    return throwError(() => new Error('Phiên làm việc hết hạn. Vui lòng đăng nhập lại.'));
  }

  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap((tokenResponse: any) => {
        isRefreshing = false;
        const newToken = tokenResponse.accessToken; // Giả sử API trả về { accessToken: '...' }
        refreshTokenSubject.next(newToken);
        
        // Retry lại request ban đầu với token mới
        return next(addTokenHeader(req, newToken));
      }),
      catchError((err) => {
        isRefreshing = false;
        authService.logout();
        return throwError(() => err);
      })
    );
  } else {
    // Nếu đang có một quá trình refresh khác, hãy chờ nó hoàn thành
    return refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(jwtToken => next(addTokenHeader(req, jwtToken)))
    );
  }
}

// Hàm helper để thêm header, tránh lặp code
function addTokenHeader(request: HttpRequest<any>, token: string) {
    return request.clone({ headers: request.headers.set('Authorization', `Bearer ${token}`) });
}