import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Api } from '../api';
import { SettingsService } from '../services/settings.service';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login-modal.html',
  styleUrl: './login-modal.css',
})
export class LoginModal {
  @Output() loginSuccess = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  private api = inject(Api);
  settings = inject(SettingsService);

  errorMessage = signal('');
  isLoading = signal(false);

  onSocialLogin(provider: 'google' | 'github') {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.api.socialLogin(provider).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res));
        this.loginSuccess.emit(res);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || err.error || `${provider} login failed`);
      },
    });
  }

  onOverlayClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.close.emit();
    }
  }
}
