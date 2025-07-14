import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { NavbarIntroduceComponent } from '../../shared/components/navbar-introduce/navbar-introduce.component';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, AsyncValidatorFn, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Observable, of } from 'rxjs';
import { map, catchError, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-register',
  imports: [CommonModule, RouterLink, RouterOutlet, NavbarIntroduceComponent, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  showPassword = false;
  registerForm: FormGroup;

  constructor(
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.registerForm = this.fb.group({
      username: this.fb.control(
        '',
        {
          validators: [
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(20),
            Validators.pattern(/^(?=[a-zA-Z0-9._]{8,20}$)(?!.*[_.]{2})[^_.].*[^_.]$/)
          ],
          asyncValidators: [this.usernameAsyncValidator()],
          updateOn: 'blur',
        }
      ),

      email: this.fb.control('', {
        validators: [
          Validators.required,
          Validators.email,
          Validators.pattern(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
        ],
      asyncValidators: [this.emailAsyncValidator()],
      updateOn: 'blur',
    }),

      password: this.fb.control('', {
        validators: [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(100),
          Validators.pattern(/^(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>])[^\s]{6,100}$/)
        ],
      updateOn: 'blur',
    }),

      confirmPassword: this.fb.control('', {
        validators: [Validators.required],
        updateOn: 'blur',
      }),
      terms: this.fb.control(false, { validators: [Validators.requiredTrue], updateOn: 'blur' }),
      updates: this.fb.control(false, { updateOn: 'blur' })
    }, { validators: this.passwordMatchValidator });
  }

  // Async validator cho username
  usernameAsyncValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) {
        return of(null);
      }

      return of(control.value).pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap(username => {
          return this.authService.checkUsernameExists(username).pipe(
            map(exists => exists ? { usernameExists: true } : null),
            catchError(() => of(null))
          );
        })
      );
    };
  }

  // Async validator cho email
  emailAsyncValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) {
        return of(null);
      }

      return of(control.value).pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap(email => {
          return this.authService.checkEmailExists(email).pipe(
            map(exists => exists ? { emailExists: true } : null),
            catchError(() => of(null))
          );
        })
      );
    };
  }

  // Validator để kiểm tra password match
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    
    return null;
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const formData = this.registerForm.value;
      delete formData.confirmPassword; // Xóa confirmPassword trước khi gửi
      formData.avatar = 'https://res.cloudinary.com/dejapatma/image/upload/v1750233119/uploads/htu0mixdm83palzdpf8i.png';

      this.authService.register(formData).subscribe({
        next: () => {
          this.toastr.success('Đăng ký thành công!');
          this.router.navigate(['/auth/login']);
        },
        error: (err) => {
          // Hiển thị lỗi cụ thể nếu backend trả về
          if (err.error && err.error.message) {
            this.toastr.error(err.error.message);
          } else {
            this.toastr.error('Đăng ký thất bại!');
          }
          console.error(err);
        }
      });
    } else {
      this.toastr.warning('Vui lòng nhập đầy đủ và đúng định dạng các trường!');
      this.markFormGroupTouched();
    }
  }

  // Đánh dấu tất cả các trường đã được touch để hiển thị lỗi
  markFormGroupTouched() {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });
  }

  // Helper methods để kiểm tra lỗi
  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) return `${fieldName} không được để trống.`;
      if (field.errors['minlength']) return `${fieldName} phải từ ${field.errors['minlength'].requiredLength} ký tự trở lên.`;
      if (field.errors['maxlength']) return `${fieldName} tối đa ${field.errors['maxlength'].requiredLength} ký tự.`;
      if (field.errors['pattern']) {
        if (fieldName === 'username') return 'Username phải từ 8-20 ký tự, chỉ chứa chữ cái, số và dấu chấm, gạch dưới.';
        if (fieldName === 'password') return 'Mật khẩu phải chứa ít nhất một số,một ký tự đặc biệt và không có khoảng trắng.';
        if (fieldName === 'email') return 'Email không đúng định dạng.';
      }
      if (field.errors['usernameExists']) return 'Username đã tồn tại.';
      if (field.errors['emailExists']) return 'Email đã tồn tại.';
    }
    return '';
  }
  
}
