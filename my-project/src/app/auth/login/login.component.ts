import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { NavbarIntroduceComponent } from '../../shared/components/navbar-introduce/navbar-introduce.component';
import { AuthService } from '../../core/services/auth.service';
import { HttpClientModule } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { AuthLoginDto } from '../../core/constants/api-endpoints';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterOutlet, NavbarIntroduceComponent, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email = '';
  password = '';
  showPassword = false;
  rememberMe = false;

  errorUserNotFound = false;
  errorPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) { }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    this.errorUserNotFound = false;
    this.errorPassword = false;

    if (!this.email || !this.password) {
      this.toastr.warning('Vui lòng nhập đầy đủ email và mật khẩu');
      if (!this.email) this.errorUserNotFound = true;
      if (!this.password) this.errorPassword = true;
      return;
    }

    const loginData: AuthLoginDto = {
      email: this.email,
      password: this.password
    };

    this.authService.login(loginData).subscribe({
      next: (res) => {
        if (res.tokens?.access_token) {
          localStorage.setItem('accessToken', res.tokens.access_token);
        }
        if (res.user) {
          localStorage.setItem('user_info', JSON.stringify(res.user));
        }
        const role = res.user?.role || res.role;

        if (role === 'Admin') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/home', 'home-page']);
        }
        this.toastr.success('Đăng nhập thành công!');
        this.errorUserNotFound = false;
        this.errorPassword = false;
      },
      error: (err) => {
        this.errorUserNotFound = false;
        this.errorPassword = false;

        if (err.error && err.error.message) {
          const msg = err.error.message.toLowerCase();

          const isUserError =
            msg.includes('user not found') ||
            msg.includes('username not found') ||
            msg.includes('email not found') ||
            msg.includes('usernameoremail must be required') ||
            msg.includes('no account found') ||
            msg.includes('unknown user') ||
            (msg.includes('invalid usernameoremail credentials') && !msg.includes('password'));

          const isPasswordError =
            msg.includes('password') || msg.includes('invalid password credentials');

          if (isUserError) {
            this.toastr.error('Tài khoản (username/email) không tồn tại!');
            this.errorUserNotFound = true;
          }

          if (isPasswordError) {
            this.toastr.error('Mật khẩu không đúng!');
            this.errorPassword = true;
          }

          if (!isUserError && !isPasswordError) {
            this.toastr.error('Đăng nhập thất bại. Vui lòng thử lại.');
          }
        } else {
          this.toastr.error('Đăng nhập thất bại. Đã có lỗi xảy ra, vui lòng thử lại.');
        }
      }
    });
  }
}