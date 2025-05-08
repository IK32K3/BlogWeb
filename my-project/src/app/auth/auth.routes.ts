// src/app/auth/auth.routes.ts
import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { RegisterComponent } from './register/register.component'; // Nếu bạn có thêm các component như Register, ForgotPassword, import ở đây tương tự
// Nếu bạn có thêm các component như Register, ForgotPassword, import ở đây tương tự

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent,
  },
  { path: 'register', component: RegisterComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
