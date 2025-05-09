// login.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet, RouterLink } from '@angular/router'; 
import { NavbarIntroduceComponent } from '../../shared/components/navbar-introduce/navbar-introduce.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule,FormsModule,RouterLink,RouterOutlet,NavbarIntroduceComponent ], 
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  // ... your component logic (email, password, showPassword, etc.)
  username = '';
  email = '';
  password = '';
  showPassword = false;
  rememberMe = false;

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (!this.email || !this.username || !this.password) {
      alert('Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }
  
    // Giả lập đăng nhập
    console.log('Login attempt:', this.email ,this.username, this.rememberMe);
    // this.authService.login(this.email, this.password).subscribe(...)
    
  }
}