// login.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { NavbarIntroduceComponent } from '../../shared/components/navbar-introduce/navbar-introduce.component';
import { AuthService } from '../services/auth.service';
import { HttpClientModule } from '@angular/common/http'; // Ensure AuthService is provided correctly
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterOutlet, NavbarIntroduceComponent, HttpClientModule ],
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
  ) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    // Reset errors at the beginning of a new submission attempt
    this.errorUserNotFound = false;
    this.errorPassword = false;

    // Client-side validation for empty fields
    if (!this.email || !this.password) {
      this.toastr.warning('Vui lòng nhập đầy đủ email và mật khẩu');
      // Optionally mark fields as errored for empty submission
      if (!this.email) {
        this.errorUserNotFound = true; // Or handle via form's invalid state for specific message
      }
      if (!this.password) {
        this.errorPassword = true; // Or handle via form's invalid state for specific message
      }
      return;
    }

    this.authService.login(this.email, this.password).subscribe({
      next: (res) => {
        if (res.token) {
          localStorage.setItem('token', res.token);
        }
        const role = res.role || (res.user && res.user.role);

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
        // Explicitly reset flags here again before processing the error
        this.errorUserNotFound = false;
        this.errorPassword = false;

        if (err.error && err.error.message) {
          const msg = err.error.message.toLowerCase();

          // Kiểm tra lỗi tài khoản trước
          const isUserError =
            msg.includes('user not found') ||
            msg.includes('username not found') ||
            msg.includes('email not found') ||
            msg.includes('UsernameOrEmail must be required') ||
            msg.includes('no account found') ||
            msg.includes('unknown user') ||
            (msg.includes('invalid usernameoremail credentials') && !msg.includes('password'));

          // Kiểm tra lỗi mật khẩu
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

          // Nếu không phải lỗi tài khoản và cũng không phải lỗi mật khẩu thì báo lỗi chung
          if (!isUserError && !isPasswordError) {
            this.toastr.error('Đăng nhập thất bại. Vui lòng thử lại.');
            // Optional: console.error('Lỗi đăng nhập:', err.error.message);
          }
        } else {
          this.toastr.error('Đăng nhập thất bại. Đã có lỗi xảy ra, vui lòng thử lại.');
        }
      }
    });
  }
}