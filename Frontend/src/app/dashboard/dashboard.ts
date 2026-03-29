import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Api } from '../api';
import { CommonModule } from '@angular/common';
import { FONT_FAMILIES, BG_FILTERS, BG_ANIMATIONS } from '../models/webpage.model';
// sample test
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(Api);
  private router = inject(Router);

  isLoading = signal(true);
  isSaving = signal(false);
  saveMessage = signal('');
  username = signal('');
  email = signal('');
  activeTab = signal('builder');

  fontFamilies = FONT_FAMILIES;
  bgFilters = BG_FILTERS;
  bgAnimations = BG_ANIMATIONS;

  // Webpage Builder
  builderForm = this.fb.group({
    headerInfo: [''],
    menuInfo: this.fb.array([]),
    homeSection: [''],
    aboutUsSection: [''],
    servicesProductsSection: [''],
    teamsSection: [''],
    contactUsSection: [''],
    footerInfo: [''],
    additionalSections: this.fb.array([])
  });

  // Section Form Factory
  createSectionForm(title = '', content = '') {
    let background = { url: '', filter: 'none', animation: 'none' };
    let overlays: any[] = [];

    // Check if content is actually a JSON string from the new editor
    if (content.startsWith('{')) {
      try {
        const data = JSON.parse(content);
        background = data.background || background;
        overlays = data.overlays || [];
      } catch (e) { }
    } else if (content) {
      // Legacy HTML support - put it as first overlay or just leave it blank for now
      overlays.push({ text: content, fontSize: 24, color: '#ffffff', fontFamily: 'Outfit', fontStyle: 'normal' });
    }

    return this.fb.group({
      title: [title],
      background: this.fb.group({
        url: [background.url],
        filter: [background.filter],
        animation: [background.animation]
      }),
      overlays: this.fb.array(overlays.map(o => this.createOverlayForm(o)))
    });
  }

  createOverlayForm(o: any = null) {
    return this.fb.group({
      text: [o?.text || ''],
      fontSize: [o?.fontSize || 24],
      color: [o?.color || '#ffffff'],
      fontFamily: [o?.fontFamily || 'Outfit'],
      fontStyle: [o?.fontStyle || 'normal']
    });
  }

  // FAQs
  faqs = signal<any[]>([]);
  faqForm = this.fb.group({
    id: [0],
    question: ['', Validators.required],
    answer: ['', Validators.required]
  });

  // Chat History
  chatHistory = signal<any[]>([]);

  // Security
  securityForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: [''],
    username: ['']
  });

  ngOnInit() {
    const userStr = localStorage.getItem('user');
    if (!userStr || !localStorage.getItem('token')) {
      this.router.navigate(['/home']);
      return;
    }
    const user = JSON.parse(userStr);
    this.username.set(user.username);
    this.email.set(user.email);

    this.securityForm.patchValue({
      email: user.email,
      username: user.username
    });

    this.loadWebpage();
  }

  setTab(tab: string) {
    this.activeTab.set(tab);
    if (tab === 'faqs') this.loadFAQs();
    if (tab === 'history') this.loadHistory();
  }

  // --- Webpage Builder Methods ---
  loadWebpage() {
    this.isLoading.set(true);
    this.api.getMyWebpage().subscribe({
      next: (data) => {
        this.populateForm(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  get menuInfo() { return this.builderForm.get('menuInfo') as FormArray; }
  get additionalSections() { return this.builderForm.get('additionalSections') as FormArray; }

  getOverlays(index: number) {
    return (this.additionalSections.at(index).get('overlays') as FormArray);
  }

  addMenuItem(label = '', link = '') { this.menuInfo.push(this.fb.group({ label, link })); }
  removeMenuItem(index: number) { this.menuInfo.removeAt(index); }

  addSection() {
    const title = window.prompt('Enter name for the new section:', 'New Section');
    if (!title) return;
    const id = title.toLowerCase().replace(/\s+/g, '-');
    this.additionalSections.push(this.createSectionForm(title));
    // Auto-add menu item
    this.addMenuItem(title, `#${id}`);
  }
  removeSection(index: number) { this.additionalSections.removeAt(index); }

  addOverlay(sectionIndex: number) {
    this.getOverlays(sectionIndex).push(this.createOverlayForm());
  }
  removeOverlay(sectionIndex: number, overlayIndex: number) {
    this.getOverlays(sectionIndex).removeAt(overlayIndex);
  }

  private populateForm(data: any) {
    this.builderForm.patchValue({
      headerInfo: data.headerInfo,
      footerInfo: data.footerInfo,
      // We will treat main content sections as legacy for now or just empty if they use additionalSections
      homeSection: data.homeSection,
      aboutUsSection: data.aboutUsSection,
      servicesProductsSection: data.servicesProductsSection,
      teamsSection: data.teamsSection,
      contactUsSection: data.contactUsSection,
    });
    this.menuInfo.clear();
    this.additionalSections.clear();
    try {
      if (data.menuInfo) {
        JSON.parse(data.menuInfo).forEach((m: any) => this.addMenuItem(m.label, m.link));
      }
      if (data.additionalSections) {
        JSON.parse(data.additionalSections).forEach((sec: any) => {
          this.additionalSections.push(this.createSectionForm(sec.title, sec.content || JSON.stringify(sec)));
        });
      }
    } catch (e) { }
  }

  onSaveWebpage() {
    this.isSaving.set(true);
    const val = this.builderForm.value as any;

    // Process additionalSections to stringify content
    const processedAdditional = val.additionalSections.map((sec: any) => {
      return {
        title: sec.title,
        // The "content" is now the entire structured data stringified
        content: JSON.stringify({
          background: sec.background,
          overlays: sec.overlays
        })
      };
    });

    const payload = {
      ...val,
      menuInfo: JSON.stringify(val.menuInfo),
      additionalSections: JSON.stringify(processedAdditional)
    };

    this.api.updateMyWebpage(payload).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.showToast('Webpage saved successfully!');
      },
      error: () => this.isSaving.set(false)
    });
  }

  // --- FAQ Methods ---
  loadFAQs() {
    this.api.getFAQs().subscribe(data => this.faqs.set(data));
  }

  onSaveFAQ() {
    if (this.faqForm.valid) {
      this.api.manageFAQ(this.faqForm.value).subscribe(() => {
        this.loadFAQs();
        this.faqForm.reset({ id: 0 });
        this.showToast('FAQ saved!');
      });
    }
  }

  editFAQ(faq: any) {
    this.faqForm.patchValue(faq);
  }

  deleteFAQ(id: number) {
    if (confirm('Delete this FAQ?')) {
      this.api.deleteFAQ(id).subscribe(() => this.loadFAQs());
    }
  }

  // --- Chat History Methods ---
  loadHistory() {
    this.api.getChatHistory().subscribe(data => this.chatHistory.set(data));
  }

  // --- Security Methods ---
  onUpdateProfile() {
    if (this.securityForm.valid) {
      this.api.updateProfile(this.securityForm.value).subscribe({
        next: (res: any) => {
          this.showToast('Profile updated!');
          this.username.set(res.username);
          this.email.set(res.email);
          // Update stored user
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          user.username = res.username;
          user.email = res.email;
          localStorage.setItem('user', JSON.stringify(user));
        },
        error: (err) => alert(err.error || 'Update failed')
      });
    }
  }

  private showToast(msg: string) {
    this.saveMessage.set(msg);
    setTimeout(() => this.saveMessage.set(''), 3000);
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/home']);
  }
}
