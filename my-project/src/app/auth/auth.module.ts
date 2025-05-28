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
import { HttpClient } from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';
import { HeaderComponent } from '../shared/components/header/header.component';

@NgModule({
  declarations: [
    LoginComponent,
    RegisterComponent,
    ForgotPasswordComponent,
    NavbarIntroduceComponent,
    HeaderComponent,
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
    FormsModule,// Nếu bạn sử dụng FormsModule trong các component
    HttpClient,
    ToastrModule.forRoot({
      positionClass: 'toast-top-center', // hoặc toast-bottom-right, toast-center-center,...
      timeOut: 3000,
      closeButton: true,
      progressBar: true,
    }),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AuthModule { }
