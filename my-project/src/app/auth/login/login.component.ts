// login.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet, RouterLink } from '@angular/router'; 
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, // <-- Make sure FormsModule is imported for ngModel
    RouterLink,  // <-- Import RouterLink if using routerLink
    RouterOutlet // <-- ADD RouterOutlet HERE
  ], // tự import luôn các module cần
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  // ... your component logic (email, password, showPassword, etc.)
  email = '';
  password = '';
  showPassword = false;
  rememberMe = false;

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    console.log('Login attempt:', this.email, this.password, this.rememberMe);
    // Add your actual login logic here
  }
}