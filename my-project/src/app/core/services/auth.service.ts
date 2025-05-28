import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AUTH_API } from '../constants/api-endpoints';
import { AuthLoginDto, AuthRegisterDto } from '../constants/api-endpoints';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http: HttpClient) { }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken'); // hoặc sessionStorage, cookie
  }

  login(data: AuthLoginDto): Observable<any> {
    return this.http.post(AUTH_API.LOGIN, data);
  }

  register(data: AuthRegisterDto): Observable<any> {
    return this.http.post(AUTH_API.REGISTER, data);
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(AUTH_API.FORGOT_PASSWORD, { email });
  }

  resetPassword(data: { token: string, newPassword: string, confirmPassword: string }): Observable<any> {
    return this.http.post(AUTH_API.RESET_PASSWORD, data);
  }
}
