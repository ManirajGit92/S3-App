import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Api } from '../api';
import { CartService } from '../services/cart.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-storefront',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './storefront.html',
  styleUrl: './storefront.css',
})
export class Storefront implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(Api);
  public cartService = inject(CartService);

  // Core data
  webpageData = signal<any>(null);
  products = signal<any[]>([]);
  numericWebpageId = signal(0);

  // Loading states
  isLoading = signal(true);
  isPurchasing = signal(false);

  // Filters (client-side computed)
  searchQuery = signal('');
  sortBy = signal('');
  filterCategories = signal<string[]>([]);
  filterCompanies = signal<string[]>([]);
  filterMaxPrice = signal(999999);
  filterInStockOnly = signal(false);
  showFilterSidebar = signal(true);

  // Checkout state
  showCheckout = signal(false);
  checkoutStep = signal<'select' | 'details' | 'processing' | 'success'>('select');
  paymentMethod = signal<'upi' | 'cod' | 'netbanking'>('upi');

  // Customer
  customerName = signal('');
  customerPhone = signal('');
  customerAddress = signal('');

  // Payment details
  upiId = signal('');
  upiTxnId = signal('');
  bankName = signal('');
  accountNo = signal('');
  ifscCode = signal('');

  // Cart aliases for shorter template access
  cart = this.cartService.cart;
  cartTotal = this.cartService.cartTotal;
  cartCount = this.cartService.cartCount;

  // Derived data from product list
  allCategories = computed(() => [...new Set(this.products().map((p: any) => p.productCategory).filter(Boolean))]);
  allCompanies = computed(() => [...new Set(this.products().map((p: any) => p._spec?.company).filter(Boolean))]);
  maxProductPrice = computed(() => Math.ceil(Math.max(0, ...this.products().map((p: any) => p.price))));

  // Filtered products (fully client-side)
  filteredProducts = computed(() => {
    let list = this.products();
    const q = this.searchQuery().toLowerCase().trim();
    const cats = this.filterCategories();
    const companies = this.filterCompanies();
    const maxP = this.filterMaxPrice();
    const inStock = this.filterInStockOnly();

    if (q) list = list.filter((p: any) =>
      p.productName?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.productCategory?.toLowerCase().includes(q) ||
      p._spec?.company?.toLowerCase().includes(q) ||
      p._spec?.subcategory?.toLowerCase().includes(q)
    );
    if (cats.length) list = list.filter((p: any) => cats.includes(p.productCategory));
    if (companies.length) list = list.filter((p: any) => companies.includes(p._spec?.company));
    if (maxP < this.maxProductPrice()) list = list.filter((p: any) => p.price <= maxP);
    if (inStock) list = list.filter((p: any) => p.availableQuantity > 0);

    const sort = this.sortBy();
    if (sort === 'price_asc') list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === 'price_desc') list = [...list].sort((a, b) => b.price - a.price);
    else if (sort === 'name_asc') list = [...list].sort((a, b) => a.productName.localeCompare(b.productName));
    else if (sort === 'name_desc') list = [...list].sort((a, b) => b.productName.localeCompare(a.productName));
    return list;
  });



  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (!id) return;
      const numericId = parseInt(id, 10);
      if (!isNaN(numericId) && String(numericId) === id) {
        this.numericWebpageId.set(numericId);
        this.api.getDefaultWebpage().subscribe({ next: (data) => this.webpageData.set(data), error: () => {} });
        this.loadProducts();
      } else {
        this.api.getPublicWebpage(id).subscribe({
          next: (data) => { this.webpageData.set(data); this.numericWebpageId.set(data.id); this.loadProducts(); },
          error: () => this.isLoading.set(false)
        });
      }
    });
  }

  loadProducts() {
    this.isLoading.set(true);
    const wId = this.numericWebpageId();
    if (!wId) return;
    this.api.getProducts(wId).subscribe({
      next: (data) => {
        const parsed = data.map((p: any) => {
          let spec: any = {};
          try { spec = JSON.parse(p.otherSpec || '{}'); } catch {}
          return { ...p, _spec: spec };
        }).filter((p: any) => !p._spec.isHidden);
        this.products.set(parsed);
        // Init max price filter to the highest product price
        this.filterMaxPrice.set(Math.ceil(Math.max(0, ...parsed.map((p: any) => p.price))) || 999999);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  // Filters
  toggleCategory(cat: string) {
    const cur = this.filterCategories();
    this.filterCategories.set(cur.includes(cat) ? cur.filter(c => c !== cat) : [...cur, cat]);
  }
  toggleCompany(co: string) {
    const cur = this.filterCompanies();
    this.filterCompanies.set(cur.includes(co) ? cur.filter(c => c !== co) : [...cur, co]);
  }
  clearFilters() {
    this.filterCategories.set([]);
    this.filterCompanies.set([]);
    this.filterMaxPrice.set(this.maxProductPrice());
    this.filterInStockOnly.set(false);
    this.searchQuery.set('');
    this.sortBy.set('');
  }

  getSubcategory(p: any) { return p._spec?.subcategory || ''; }
  getCompany(p: any) { return p._spec?.company || ''; }
  getCustomSpecs(p: any): { key: string; value: string }[] { return p._spec?.specs || []; }

  // Cart
  addToCart(product: any) {
    this.cartService.addToCart(product);
  }

  buyNow(product: any) {
    this.cartService.addToCart(product);
    this.openCheckout();
  }

  updateCartQty(index: number, delta: number) {
    const item = this.cart()[index];
    if (item) this.cartService.updateQty(item.id, delta);
  }

  removeFromCart(index: number) {
    const item = this.cart()[index];
    if (item) this.cartService.removeFromCart(item.id);
  }

  // Checkout
  openCheckout() {
    if (this.cart().length === 0) return;
    this.checkoutStep.set('select');
    this.showCheckout.set(true);
  }
  closeCheckout() { this.showCheckout.set(false); }

  proceedToDetails() {
    if (!this.customerName().trim() || !this.customerPhone().trim()) {
      alert('Please fill in your name and phone number.');
      return;
    }
    this.checkoutStep.set('details');
  }

  processPayment() {
    const method = this.paymentMethod();
    if (method === 'upi' && !this.upiTxnId().trim()) {
      alert('Please enter the UPI Transaction ID after completing the payment.');
      return;
    }
    if (method === 'netbanking' && (!this.bankName().trim() || !this.accountNo().trim())) {
      alert('Please fill in bank details.');
      return;
    }
    this.checkoutStep.set('processing');
    this.isPurchasing.set(true);

    const idsToBuy: number[] = [];
    this.cart().forEach(item => { for (let i = 0; i < item.cartQty; i++) idsToBuy.push(item.id); });

    const checkoutData = {
      productIds: idsToBuy,
      customerName: this.customerName(),
      customerPhone: this.customerPhone(),
      paymentMethod: this.paymentMethod()
    };

    this.api.buyProduct(checkoutData).subscribe({
      next: () => {
        setTimeout(() => {
          this.isPurchasing.set(false);
          this.checkoutStep.set('success');
          this.cartService.clearCart();
          this.loadProducts();
        }, 1800);
      },
      error: () => { this.isPurchasing.set(false); this.checkoutStep.set('details'); alert('Payment failed. Please try again.'); }
    });
  }

  finishCheckout() {
    this.showCheckout.set(false);
    this.checkoutStep.set('select');
    this.customerName.set(''); this.customerPhone.set(''); this.customerAddress.set('');
  }

  countProductsByCategory(cat: string): number {
    return this.products().filter(p => p.productCategory === cat).length;
  }
}
