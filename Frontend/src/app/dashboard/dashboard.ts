import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { FormBuilder, FormArray, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Api } from '../api';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FONT_FAMILIES, BG_FILTERS, BG_ANIMATIONS } from '../models/webpage.model';
import { Analytics } from './analytics/analytics';
import * as XLSX from 'xlsx';
// sample test
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule, FormsModule, Analytics],
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
  activeTab = signal<'builder' | 'faqs' | 'history' | 'security' | 'products' | 'analytics'>('builder');

  fontFamilies = FONT_FAMILIES;
  bgFilters = BG_FILTERS;
  bgAnimations = BG_ANIMATIONS;

  // Products State
  products = signal<any[]>([]);
  pendingProducts = signal<any[]>([]);
  isLoadingProducts = signal(false);
  editingProduct = signal<any>(null);

  // Delete All Modal
  showDeleteAllModal = signal(false);
  deleteAllConfirmText = signal('');
  isDeletingAll = signal(false);
  
  productForm = this.fb.group({
    id: [0],
    productName: ['', Validators.required],
    productCategory: ['', Validators.required],
    subcategory: [''],
    price: [0, [Validators.required, Validators.min(0)]],
    availableQuantity: [0, [Validators.required, Validators.min(0)]],
    company: [''],
    description: [''],
    isHidden: [false],
    imageUrl: [''],
    specs: this.fb.array([])
  });

  imageInputMode = signal<'upload' | 'url'>('upload');
  productImagePreview = signal<string>('');
  isUploadingImage = signal(false);
  webpageId = signal(0);

  // Product Filters
  productSearch = signal('');
  productCategoryFilter = signal('');
  productSortBy = signal('');

  displayProducts = computed(() => {
    let list = [...this.products(), ...this.pendingProducts().map(p => ({ ...p, isPending: true }))];
    const q = this.productSearch().toLowerCase();
    const cat = this.productCategoryFilter();
    const sort = this.productSortBy();

    if (q) list = list.filter(p => p.productName?.toLowerCase().includes(q) || p.productCategory?.toLowerCase().includes(q));
    if (cat) list = list.filter(p => p.productCategory === cat);

    if (sort === 'price_asc') list.sort((a, b) => a.price - b.price);
    else if (sort === 'price_desc') list.sort((a, b) => b.price - a.price);
    else if (sort === 'name_asc') list.sort((a, b) => a.productName.localeCompare(b.productName));
    else list.sort((a, b) => b.id - a.id);
    return list;
  });

  productCategories = computed(() => [...new Set(this.products().map(p => p.productCategory))]);

  // Webpage Builder
  builderForm = this.fb.group({
    headerInfo: [''],
    menuInfo: this.fb.array([]),
    homeGroup: this.createCoreSectionForm(),
    aboutGroup: this.createCoreSectionForm(),
    servicesGroup: this.createCoreSectionForm(),
    teamsGroup: this.createCoreSectionForm(),
    contactGroup: this.fb.group({
      htmlContent: [''],
      background: this.fb.group({ url: [''], filter: ['none'], animation: ['none'] }),
      overlays: this.fb.array([]),
      address: [''],
      email: [''],
      phone: [''],
      mapUrl: ['']
    }),
    footerInfo: [''],
    additionalSections: this.fb.array([])
  });

  createCoreSectionForm() {
    return this.fb.group({
      htmlContent: [''],
      background: this.fb.group({ url: [''], filter: ['none'], animation: ['none'] }),
      overlays: this.fb.array([])
    });
  }

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



  get specControls() { return this.productForm.get('specs') as FormArray; }
  addSpec() { this.specControls.push(this.fb.group({ key: [''], value: [''] })); }
  removeSpec(i: number) { this.specControls.removeAt(i); }

  getSpec(product: any, key: string): string {
    try {
      const spec = JSON.parse(product.otherSpec || '{}');
      return spec[key] || '';
    } catch { return ''; }
  }

  isProductHidden(product: any): boolean {
    try { return JSON.parse(product.otherSpec || '{}').isHidden === true; } catch { return false; }
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

  setTab(tab: 'builder' | 'faqs' | 'history' | 'security' | 'products' | 'analytics') {
    this.activeTab.set(tab);
    if (tab === 'faqs') this.loadFAQs();
    if (tab === 'history') this.loadHistory();
    if (tab === 'products') this.loadProducts();
  }

  // --- Webpage Builder Methods ---
  loadWebpage() {
    this.isLoading.set(true);
    this.api.getMyWebpage().subscribe({
      next: (data) => {
        this.webpageId.set(data.id);
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

  // Generic Overlay Methods for Template usage
  getFormArray(group: any, name: string): FormArray {
    return group.get(name) as FormArray;
  }
  addGenericOverlay(group: any) {
    this.getFormArray(group, 'overlays').push(this.createOverlayForm());
  }
  removeGenericOverlay(group: any, index: number) {
    this.getFormArray(group, 'overlays').removeAt(index);
  }

  private parseCoreSection(formGroup: any, dataString: string) {
    if (dataString && dataString.startsWith('{')) {
      try {
        const parsed = JSON.parse(dataString);
        formGroup.patchValue({
          htmlContent: parsed.htmlContent || '',
          background: parsed.background || { url: '', filter: 'none', animation: 'none' }
        });
        const overlaysArr = formGroup.get('overlays') as FormArray;
        overlaysArr.clear();
        if (parsed.overlays) {
          parsed.overlays.forEach((o: any) => overlaysArr.push(this.createOverlayForm(o)));
        }
        return;
      } catch (e) {}
    }
    // Fallback: entire string is htmlContent
    formGroup.patchValue({ htmlContent: dataString || '' });
    (formGroup.get('overlays') as FormArray).clear();
  }

  private populateForm(data: any) {
    this.builderForm.patchValue({
      headerInfo: data.headerInfo,
      footerInfo: data.footerInfo,
    });
    
    this.parseCoreSection(this.builderForm.get('homeGroup'), data.homeSection);
    this.parseCoreSection(this.builderForm.get('aboutGroup'), data.aboutUsSection);
    this.parseCoreSection(this.builderForm.get('servicesGroup'), data.servicesProductsSection);
    this.parseCoreSection(this.builderForm.get('teamsGroup'), data.teamsSection);

    // Parse Contact Information
    const cGroup = this.builderForm.get('contactGroup');
    if (data.contactUsSection && data.contactUsSection.startsWith('{')) {
      try {
        this.parseCoreSection(cGroup, data.contactUsSection);
        const contactData = JSON.parse(data.contactUsSection);
        cGroup?.get('address')?.setValue(contactData.address || '');
        cGroup?.get('email')?.setValue(contactData.email || '');
        cGroup?.get('phone')?.setValue(contactData.phone || '');
        cGroup?.get('mapUrl')?.setValue(contactData.mapUrl || '');
      } catch (e) {
        cGroup?.get('htmlContent')?.setValue(data.contactUsSection);
      }
    } else {
      cGroup?.get('htmlContent')?.setValue(data.contactUsSection);
    }
    
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
      headerInfo: val.headerInfo,
      footerInfo: val.footerInfo,
      menuInfo: JSON.stringify(val.menuInfo),
      homeSection: JSON.stringify(val.homeGroup),
      aboutUsSection: JSON.stringify(val.aboutGroup),
      servicesProductsSection: JSON.stringify(val.servicesGroup),
      teamsSection: JSON.stringify(val.teamsGroup),
      contactUsSection: JSON.stringify(val.contactGroup),
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

  // --- Product Management Methods ---
  loadProducts() {
    const wId = this.webpageId();
    if (!wId) return;
    this.isLoadingProducts.set(true);
    this.api.getProducts(wId).subscribe({
      next: (data) => { this.products.set(data); this.isLoadingProducts.set(false); },
      error: () => this.isLoadingProducts.set(false)
    });
  }

  // --- Excel Import/Export ---
  exportToExcel() {
    const data = this.products().map(p => {
      let spec: any = {};
      try { spec = JSON.parse(p.otherSpec || '{}'); } catch {}
      return {
        'Product Name': p.productName,
        'Category': p.productCategory,
        'Subcategory': spec.subcategory || '',
        'Price': p.price,
        'Stock': p.availableQuantity,
        'Brand': spec.company || '',
        'Description': p.description,
        'Image URL': spec.imageUrl || ''
      };
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Products');
    XLSX.writeFile(wb, 'Products_Export.xlsx');
  }

  /** Case-insensitive, synonym-aware column value resolver for Excel imports */
  private resolveCell(row: any, ...aliases: string[]): string {
    const keys = Object.keys(row);
    for (const alias of aliases) {
      const match = keys.find(k => k.trim().toLowerCase() === alias.toLowerCase());
      if (match !== undefined && row[match] !== undefined && row[match] !== '') {
        return String(row[match]);
      }
    }
    return '';
  }

  onImportExcel(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const json: any[] = XLSX.utils.sheet_to_json(sheet);

      const imported = json.map(row => {
        // Resolve each field with common synonyms (case-insensitive)
        const name        = this.resolveCell(row, 'Product Name', 'Name', 'ProductName', 'product name') || 'New Product';
        const category    = this.resolveCell(row, 'Category', 'Product Category', 'ProductCategory') || 'General';
        const subcategory = this.resolveCell(row, 'Subcategory', 'Sub Category', 'Sub-Category');
        const priceStr    = this.resolveCell(row, 'Price', 'Unit Price', 'MRP');
        const stockStr    = this.resolveCell(row, 'Stock', 'Stock count', 'Stock Count', 'Quantity', 'Available Quantity', 'AvailableQuantity', 'Qty', 'Inventory');
        const brand       = this.resolveCell(row, 'Brand', 'Company', 'Manufacturer');
        const description = this.resolveCell(row, 'Description', 'Desc', 'Details');
        const imageUrl    = this.resolveCell(row, 'Image URL', 'ImageURL', 'Image', 'Image Url', 'image url');

        const spec = {
          subcategory,
          company: brand,
          imageUrl,
          isHidden: false,
          specs: []
        };

        return {
          id: 0,
          webpageId: this.webpageId(),
          productName: name,
          productCategory: category,
          price: parseFloat(priceStr) || 0,
          availableQuantity: parseInt(stockStr, 10) || 0,
          description,
          otherSpec: JSON.stringify(spec)
        };
      });
      this.pendingProducts.set(imported);
      this.showToast(`${imported.length} products imported for preview.`);
    };
    reader.readAsArrayBuffer(file);
    // Reset input
    event.target.value = '';
  }

  savePendingProducts() {
    if (this.pendingProducts().length === 0) return;
    this.isSaving.set(true);
    this.api.bulkCreateProducts(this.pendingProducts()).subscribe({
      next: (res) => {
        this.isSaving.set(false);
        this.products.set([...this.products(), ...res.products]);
        this.pendingProducts.set([]);
        this.showToast('All pending products saved successfully!');
      },
      error: () => {
        this.isSaving.set(false);
        alert('Failed to save products.');
      }
    });
  }

  startNewProduct() {
    this.editingProduct.set(null);
    this.specControls.clear();
    this.productImagePreview.set('');
    this.imageInputMode.set('upload');
    this.productForm.reset({ id: 0, price: 0, availableQuantity: 0, isHidden: false, imageUrl: '' });
  }

  editProduct(product: any) {
    this.editingProduct.set(product);
    this.specControls.clear();
    let spec: any = {};
    try { spec = JSON.parse(product.otherSpec || '{}'); } catch {}
    this.productForm.patchValue({
      id: product.id,
      productName: product.productName,
      productCategory: product.productCategory,
      subcategory: spec.subcategory || '',
      price: product.price,
      availableQuantity: product.availableQuantity,
      company: spec.company || '',
      description: product.description,
      isHidden: spec.isHidden || false,
      imageUrl: spec.imageUrl || ''
    });
    this.productImagePreview.set(spec.imageUrl || '');
    // If an existing image is stored as URL, default to URL mode
    this.imageInputMode.set(spec.imageUrl ? 'url' : 'upload');
    const customSpecs = spec.specs || [];
    customSpecs.forEach((s: any) => this.specControls.push(this.fb.group({ key: [s.key], value: [s.value] })));
  }

  onImageFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    // Validate on client side too
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      alert('Unsupported file type. Please upload JPG, PNG, WEBP, GIF, or SVG.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File is too large. Max size is 5 MB.');
      return;
    }
    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (e) => this.productImagePreview.set(e.target?.result as string);
    reader.readAsDataURL(file);
    // Upload to backend
    this.isUploadingImage.set(true);
    this.api.uploadImage(file).subscribe({
      next: (res) => {
        this.productForm.patchValue({ imageUrl: res.url });
        this.isUploadingImage.set(false);
        this.showToast('Image uploaded successfully!');
      },
      error: () => {
        this.isUploadingImage.set(false);
        this.productImagePreview.set('');
        alert('Image upload failed. Please try again.');
      }
    });
  }

  /** Called when the user types/pastes a direct image URL */
  onImageUrlInput(url: string) {
    const trimmed = url.trim();
    this.productForm.patchValue({ imageUrl: trimmed });
    this.productImagePreview.set(trimmed);
  }

  buildProductPayload(): any {
    const val = this.productForm.value as any;
    const otherSpec = JSON.stringify({
      subcategory: val.subcategory || '',
      company: val.company || '',
      isHidden: val.isHidden || false,
      imageUrl: val.imageUrl || '',
      specs: (val.specs || []).filter((s: any) => s.key)
    });
    return {
      id: val.id || 0,
      webpageId: this.webpageId(),
      productName: val.productName,
      productCategory: val.productCategory,
      price: val.price,
      availableQuantity: val.availableQuantity,
      description: val.description || '',
      otherSpec
    };
  }

  onSaveProduct() {
    if (!this.productForm.valid) return;
    const payload = this.buildProductPayload();
    const isEdit = payload.id > 0;
    const obs = isEdit
      ? this.api.updateProduct(payload.id, payload)
      : this.api.createProduct(payload);
    obs.subscribe({
      next: () => {
        this.loadProducts();
        this.startNewProduct();
        this.showToast(isEdit ? 'Product updated!' : 'Product created!');
      }
    });
  }

  toggleHideProduct(product: any) {
    let spec: any = {};
    try { spec = JSON.parse(product.otherSpec || '{}'); } catch {}
    spec.isHidden = !spec.isHidden;
    const updated = { ...product, otherSpec: JSON.stringify(spec) };
    this.api.updateProduct(product.id, updated).subscribe(() => this.loadProducts());
  }

  deleteProduct(id: number) {
    if (confirm('Are you sure you want to delete this product?')) {
      this.api.deleteProduct(id).subscribe(() => {
        this.loadProducts();
        this.showToast('Product deleted.');
      });
    }
  }

  openDeleteAllModal() {
    this.deleteAllConfirmText.set('');
    this.showDeleteAllModal.set(true);
  }

  closeDeleteAllModal() {
    this.showDeleteAllModal.set(false);
    this.deleteAllConfirmText.set('');
  }

  confirmDeleteAll() {
    if (this.deleteAllConfirmText().trim() !== 'delete all') return;
    this.isDeletingAll.set(true);
    this.api.deleteAllProducts(this.webpageId()).subscribe({
      next: (res: any) => {
        this.isDeletingAll.set(false);
        this.products.set([]);
        this.pendingProducts.set([]);
        this.closeDeleteAllModal();
        this.showToast(res.message || 'All products deleted.');
      },
      error: () => {
        this.isDeletingAll.set(false);
        alert('Failed to delete all products. Please try again.');
      }
    });
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
