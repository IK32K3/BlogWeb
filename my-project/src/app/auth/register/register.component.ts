import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NavbarIntroduceComponent } from '../../shared/components/navbar-introduce/navbar-introduce.component';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  imports: [CommonModule, RouterLink, RouterOutlet, NavbarIntroduceComponent, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  showPassword = false;

  constructor(
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit(form: any) {
    // Kiểm tra xác nhận mật khẩu
    if (form.value.password !== form.value.confirmPassword) {
      this.toastr.error('Mật khẩu xác nhận không khớp!');
      return;
    }

    if (form.valid) {
      this.authService.register(form.value).subscribe({
        next: (res) => {
          this.toastr.success('Đăng ký thành công!');
        },
        error: (err) => {
          // Hiển thị lỗi cụ thể nếu backend trả về
          if (err.error && err.error.message) {
            this.toastr.error(err.error.message);
          } else {
            this.toastr.error('Đăng ký thất bại!');
          }
          console.error(err);
        }
      });
    } else {
      this.toastr.warning('Vui lòng nhập đầy đủ và đúng định dạng các trường!');
    }
  }
}