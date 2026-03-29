import { Component, inject, signal, HostListener, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SettingsService, ThemeMode, Language } from '../services/settings.service';
import { LoginModal } from '../login-modal/login-modal';

@Component({
  selector: 'app-site-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LoginModal],
  templateUrl: './site-header.html',
  styleUrl: './site-header.css',
})
export class SiteHeader implements OnInit, OnDestroy {
  settings = inject(SettingsService);
  private router = inject(Router);
  private ngZone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);

  siteName = signal('S3 Digital Solutions');
  menuItems = signal<{ label: string; link: string }[]>([]);

  showSettingsDropdown = signal(false);
  showLoginModal = signal(false);
  isLoggedIn = signal(false);
  adminName = signal('');

  fonts = ['Outfit', 'Inter', 'Roboto', 'Poppins', 'Montserrat'];
  themes: ThemeMode[] = ['dark', 'light', 'custom'];
  languages: { code: Language; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'ta', label: 'தமிழ் (Tamil)' },
    { code: 'hi', label: 'हिन्दी (Hindi)' },
  ];

  private onWebpageLoaded = (event: Event) => {
    this.ngZone.run(() => {
      const detail = (event as CustomEvent).detail;
      if (detail.siteName) this.siteName.set(detail.siteName);
      if (detail.menuItems) this.menuItems.set(detail.menuItems);
      this.cdr.detectChanges();
    });
  };

  ngOnInit() {
    this.checkAuth();
    window.addEventListener('webpage-loaded', this.onWebpageLoaded);
  }

  ngOnDestroy() {
    window.removeEventListener('webpage-loaded', this.onWebpageLoaded);
  }

  checkAuth() {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (user && token) {
      this.isLoggedIn.set(true);
      try {
        this.adminName.set(JSON.parse(user).username || 'Admin');
      } catch {
        this.adminName.set('Admin');
      }
    }
  }

  toggleSettings() {
    this.showSettingsDropdown.set(!this.showSettingsDropdown());
  }

  onLoginClick() {
    this.showLoginModal.set(true);
  }

  onLoginSuccess(res: any) {
    this.showLoginModal.set(false);
    this.isLoggedIn.set(true);
    this.adminName.set(res.username || 'Admin');
  }

  onLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.isLoggedIn.set(false);
    this.adminName.set('');
    this.router.navigate(['/home']);
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  onNavClick(event: Event, link: string) {
    if (link.startsWith('#')) {
      event.preventDefault();
      const el = document.querySelector(link);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      this.showSettingsDropdown.set(false);
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.settings-wrapper')) {
      this.showSettingsDropdown.set(false);
    }
  }
}
