import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Api } from '../api';
import { CommonModule } from '@angular/common';
import { SettingsService } from '../services/settings.service';
import { SiteHeader } from '../site-header/site-header';

@Component({
  selector: 'app-webpage',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './webpage.html',
  styleUrl: './webpage.css',
})
export class Webpage implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(Api);
  settings = inject(SettingsService);

  webpageData = signal<any>(null);
  menuItems = signal<any[]>([]);
  additionalSections = signal<any[]>([]);
  isLoading = signal(true);
  error = signal('');

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadWebpage(this.api.getPublicWebpage(id));
      } else {
        // No ID — load default public webpage
        this.loadWebpage(this.api.getDefaultWebpage());
      }
    });
  }

  private loadWebpage(source: any) {
    source.subscribe({
      next: (data: any) => {
        this.webpageData.set(data);
        try { this.menuItems.set(JSON.parse(data.menuInfo || '[]')); } catch (e) { }
        try { 
          const rawSections = JSON.parse(data.additionalSections || '[]');
          const processed = rawSections.map((sec: any) => {
            if (sec.content && sec.content.startsWith('{')) {
              try {
                const structured = JSON.parse(sec.content);
                return { ...sec, structured };
              } catch(e) { return sec; }
            }
            return sec;
          });
          this.additionalSections.set(processed);
        } catch (e) { }
        this.isLoading.set(false);

        // Update the site header with menu items from this webpage
        this.updateSiteHeader(data);
      },
      error: () => {
        this.error.set('Webpage not found');
        this.isLoading.set(false);
      }
    });
  }

  private updateSiteHeader(data: any) {
    // Dispatch custom event so the SiteHeader can pick up the dynamic data
    const event = new CustomEvent('webpage-loaded', {
      detail: {
        siteName: data.headerInfo || 'S3 Digital Solutions',
        menuItems: this.menuItems()
      }
    });
    window.dispatchEvent(event);
  }
}
