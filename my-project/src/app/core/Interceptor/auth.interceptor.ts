import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    // Lấy accessToken từ localStorage thông qua AuthService
    const token = authService.isLoggedIn()
        ? (typeof authService['getToken'] === 'function'
            ? authService['getToken']()
            : (authService as any).getToken?.())
        : null;

    let modifiedReq = req;

    // 1. Thêm token vào header (nếu có)
    if (token) {
        modifiedReq = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    // 2. Xử lý response, bắt lỗi
    return next(modifiedReq).pipe(
        catchError((error: HttpErrorResponse) => {
            // Bắt lỗi 401 Unauthorized
            if (error.status === 401) {
                // Nếu là request refresh token hoặc login thì không thử refresh nữa
                if (req.url.includes('/auth/refresh-token') || req.url.includes('/auth/login')) {
                    authService.logout();
                    return throwError(() => new Error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.'));
                }

                // Token hết hạn, thử refresh token
                return authService.refreshToken(localStorage.getItem('refreshToken') || '').pipe(
                    switchMap((res: any) => {
                        const newToken = res?.accessToken || res;
                        if (newToken) {
                            // Lưu token mới vào localStorage
                            localStorage.setItem('auth_token', newToken);
                            // Clone request ban đầu với token mới
                            const newModifiedReq = req.clone({
                                setHeaders: {
                                    Authorization: `Bearer ${newToken}`
                                }
                            });
                            // Thử gửi lại request ban đầu với token mới
                            return next(newModifiedReq);
                        } else {
                            authService.logout();
                            return throwError(() => new Error('Token hết hạn. Vui lòng đăng nhập lại.'));
                        }
                    }),
                    catchError(() => {
                        authService.logout();
                        return throwError(() => new Error('Phiên làm việc hết hạn. Vui lòng đăng nhập lại.'));
                    })
                );
            }

            // Đối với các lỗi khác (không phải 401), ném lỗi gốc đi tiếp
            return throwError(() => error);
        })
    );
};
