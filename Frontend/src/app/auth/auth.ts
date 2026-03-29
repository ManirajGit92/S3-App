import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Api } from '../api';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './auth.html',
  styleUrl: './auth.css',
})
export class Auth {
  private fb = inject(FormBuilder);
  private api = inject(Api);
  private router = inject(Router);

  isLoginMode = signal(true);
  errorMessage = signal('');
  isLoading = signal(false);

  authForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    username: ['']
  });

  toggleMode() {
    this.isLoginMode.set(!this.isLoginMode());
    this.errorMessage.set('');
    this.authForm.reset();
  }

  onSubmit() {
    if (this.authForm.invalid) return;
    this.isLoading.set(true);
    this.errorMessage.set('');
    
    const val = this.authForm.value;

    if (this.isLoginMode()) {
      this.api.login({ email: val.email, password: val.password }).subscribe({
        next: (res) => this.handleSuccess(res),
        error: (err) => this.handleError(err)
      });
    } else {
      this.api.register(val).subscribe({
        next: () => {
          // auto login after register
          this.api.login({ email: val.email, password: val.password }).subscribe({
            next: (res) => this.handleSuccess(res),
            error: (err) => this.handleError(err)
          });
        },
        error: (err) => this.handleError(err)
      });
    }
  }

  onSocialLogin() {
    // Mock social login flow
    const mockEmail = `social_${Math.random().toString(36).substring(7)}@example.com`;
    this.isLoading.set(true);
    this.api.socialLogin({ email: mockEmail, username: 'SocialUser' }).subscribe({
      next: (res) => this.handleSuccess(res),
      error: (err) => this.handleError(err)
    });
  }

  private handleSuccess(res: any) {
    this.isLoading.set(false);
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res));
    this.router.navigate(['/dashboard']);
  }

  private handleError(err: any) {
    this.isLoading.set(false);
    this.errorMessage.set(err.error?.message || err.error || 'Authentication failed');
  }
}
