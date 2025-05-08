import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { AuthRoutingModule } from './auth-routing.module';
import { RouterModule } from '@angular/router';
import { AppComponent } from '../app.component'; // Đảm bảo đường dẫn đúng đến AppComponent
import { FormsModule } from '@angular/forms'; // Nếu bạn sử dụng FormsModule trong các component
import { NavbarIntroduceComponent } from '../shared/components/navbar-introduce/navbar-introduce.component'; // Đảm bảo đường dẫn đúng đến NavbarIntroduceComponent
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    LoginComponent,
    RegisterComponent,
    ForgotPasswordComponent,
    NavbarIntroduceComponent,
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    RouterModule.forChild([
      { path: 'login', component: LoginComponent },
      { path: 'forgot-password', component: ForgotPasswordComponent },
      { path: 'register', component: RegisterComponent },
    ]),
    SharedModule, 
    FormsModule ,// Nếu bạn sử dụng FormsModule trong các component
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AuthModule { }
