import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { AuthRoutingModule } from './auth-routing.module';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AppComponent } from '../app.component'; // Đảm bảo đường dẫn đúng đến AppComponent
import { FormsModule } from '@angular/forms'; // Nếu bạn sử dụng FormsModule trong các component


@NgModule({
  declarations: [
    LoginComponent,
    RegisterComponent,
    ForgotPasswordComponent,
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    BrowserModule,
    RouterModule,
    FormsModule // Nếu bạn sử dụng FormsModule trong các component
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AuthModule { }
