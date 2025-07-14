import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { HeaderComponent } from '../../shared/components/header/header.component';


@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule, RouterLink, RouterOutlet, FormsModule, HeaderComponent],
  standalone: true,
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  email = '';

  constructor(
    private authService: AuthService,
    private toastr: ToastrService
  ) { }

  onSubmit() {
    // Kiểm tra rỗng
    if (!this.email) {
      this.toastr.error('Email không được để trống!');
      return;
    }
    // Kiểm tra định dạng email
    const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!emailRegex.test(this.email)) {
      this.toastr.error('Email không đúng định dạng!');
      return;
    }

    this.authService.forgotPassword(this.email).subscribe({
      next: (res) => {
        this.toastr.success('Vui lòng kiểm tra email để đặt lại mật khẩu!');
      },
      error: (err) => {
        this.toastr.error('Không tìm thấy email hoặc có lỗi xảy ra!');
        console.error(err);
      }
    });
  }
}