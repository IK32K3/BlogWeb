import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { authInterceptor } from './auth.interceptor';
// import thêm các interceptor khác nếu có

export const httpInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useValue: authInterceptor, multi: true }
];