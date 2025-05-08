import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NavbarIntroduceComponent } from '../../shared/components/navbar-introduce/navbar-introduce.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  imports: [CommonModule,RouterLink,RouterOutlet,NavbarIntroduceComponent,FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  showPassword = false;

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit(form: any) {
    if (form.valid) {
      console.log('Form Submitted!', form.value);
      // Call service to register user
    } else {
      console.log('Form invalid!');
    }
  }
}
