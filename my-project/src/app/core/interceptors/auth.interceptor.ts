import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';
import { AUTH_API } from '../constants/api-endpoints';
import { StorageUtil, REFRESH_TOKEN_KEY } from '../constants/storage-key';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  let modifiedReq = req;

  // 1. Add token to header if exists
  if (token) {
    modifiedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // 2. Handle response and catch errors
  return next(modifiedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 Unauthorized error
      if (error.status === 401) {
        // Check if this is a refresh token request
        if (req.url.includes('/auth/refresh-token')) {
          // If refresh token request fails, logout user
          authService.logout();
          return throwError(() => new Error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.'));
        }
        
        // Skip refresh token for login requests
        if (req.url.includes('/auth/login')) {
          return throwError(() => error);
        }

        // Get refresh token from storage
        const refreshToken = StorageUtil.get<string>(REFRESH_TOKEN_KEY);
        if (!refreshToken) {
          authService.logout();
          return throwError(() => new Error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.'));
        }

        // Token expired, try to refresh
        return authService.refreshToken(refreshToken).pipe(
          switchMap((response: any) => {
            if (response.access_token) {
              // Refresh successful, retry original request with new token
              const newModifiedReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${response.access_token}`
                }
              });
              return next(newModifiedReq);
            } else {
              // Refresh failed
              authService.logout();
              return throwError(() => new Error('Token hết hạn. Vui lòng đăng nhập lại.'));
            }
          }),
          catchError((refreshError) => {
            // Error during refresh token process
            authService.logout();
            return throwError(() => new Error('Phiên làm việc hết hạn. Vui lòng đăng nhập lại.'));
          })
        );
      }

      // For other errors, pass through the original error
      return throwError(() => error);
    })
  );
};
