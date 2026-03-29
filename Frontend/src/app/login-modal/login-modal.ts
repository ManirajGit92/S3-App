import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Api } from '../api';
import { SettingsService } from '../services/settings.service';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login-modal.html',
  styleUrl: './login-modal.css',
})
export class LoginModal {
  @Output() loginSuccess = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private api = inject(Api);
  settings = inject(SettingsService);

  errorMessage = signal('');
  isLoading = signal(false);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit() {
    if (this.loginForm.invalid) return;
    this.isLoading.set(true);
    this.errorMessage.set('');

    const val = this.loginForm.value;
    this.api.login({ email: val.email, password: val.password }).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res));
        this.loginSuccess.emit(res);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || err.error || 'Authentication failed');
      },
    });
  }

  onOverlayClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.close.emit();
    }
  }
}
