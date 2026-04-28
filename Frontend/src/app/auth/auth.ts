import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Api } from '../api';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './auth.html',
  styleUrl: './auth.css',
})
export class Auth {
  private api = inject(Api);
  private router = inject(Router);

  errorMessage = signal('');
  isLoading = signal(false);

  onSocialLogin(provider: 'google' | 'github') {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.api.socialLogin(provider).subscribe({
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
