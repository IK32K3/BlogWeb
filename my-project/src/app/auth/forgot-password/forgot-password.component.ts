import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NavbarIntroduceComponent } from '../../shared/components/navbar-introduce/navbar-introduce.component';
import { FormsModule } from '@angular/forms'; // Nếu bạn sử dụng FormsModule trong các component
@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule,RouterLink,RouterOutlet,NavbarIntroduceComponent, FormsModule], // Thêm RouterLink và RouterOutlet vào imports
  standalone: true,
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  email: string = ''; // Biến để lưu trữ email nhập vào
  showEmailError: boolean = false; // Biến để kiểm tra xem có hiển thị lỗi email hay không
  onSubmit() {
    console.log("Form submitted!");
    // Logic để xử lý form quên mật khẩu ở đây
  }
}
