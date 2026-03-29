import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Api } from '../api';
import { CommonModule } from '@angular/common';
import { SettingsService } from '../services/settings.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

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
  private sanitizer = inject(DomSanitizer);
  settings = inject(SettingsService);

  webpageData = signal<any>(null);
  menuItems = signal<any[]>([]);
  additionalSections = signal<any[]>([]);
  contactData = signal<any>(null);
  homeData = signal<any>(null);
  aboutData = signal<any>(null);
  servicesData = signal<any>(null);
  teamsData = signal<any>(null);
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

  private parseCoreData(dataString: string, targetSignal: any) {
    if (dataString && dataString.startsWith('{')) {
      try {
        const parsed = JSON.parse(dataString);
        targetSignal.set(parsed);
        return;
      } catch (e) {}
    }
    // Fallback creates an object with `htmlContent` wrapping the raw text
    targetSignal.set({ htmlContent: dataString });
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

        // Parse Core Sections
        this.parseCoreData(data.homeSection, this.homeData);
        this.parseCoreData(data.aboutUsSection, this.aboutData);
        this.parseCoreData(data.servicesProductsSection, this.servicesData);
        this.parseCoreData(data.teamsSection, this.teamsData);

        // Parse Contact Data
        if (data.contactUsSection && data.contactUsSection.startsWith('{')) {
          try {
            const parsedContact = JSON.parse(data.contactUsSection);
            if (parsedContact && parsedContact.mapUrl) {
              parsedContact.safeMapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(parsedContact.mapUrl);
            }
            this.contactData.set(parsedContact);
          } catch (e) {}
        }

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
