import { Component } from '@angular/core';
import { NavBarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { ContactService } from '../../core/services/contact.service';
import { ToastrService } from 'ngx-toastr';

import { HeaderComponent } from '../../shared/components/header/header.component';

@Component({
  selector: 'app-contact-us',
  imports: [CommonModule,RouterOutlet,FormsModule,RouterModule,FooterComponent,ReactiveFormsModule,HeaderComponent],
  templateUrl: './contact-us.component.html',
  styleUrl: './contact-us.component.css'
})
export class ContactUsComponent {
  contactForm: FormGroup;

  constructor(private fb: FormBuilder, private contactService: ContactService, private toastr: ToastrService) {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      subject: [''],
      message: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.contactForm.valid) {
      console.log(this.contactForm.value);
      this.contactService.sendMessage(this.contactForm.value).subscribe({
        next: (response) => {
          console.log('Message sent successfully:', response);
          this.toastr.success('Your message has been sent successfully!', 'Success');
          this.contactForm.reset();
        },
        error: (error) => {
          console.error('Error sending message:', error);
          this.toastr.error('Failed to send message. Please try again later.', 'Error');
        }
      });
    } else {
      this.contactForm.markAllAsTouched();
      this.toastr.warning('Please fill out all required fields.', 'Warning');
    }
  }
}
