import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Api } from '../api';

@Component({
  selector: 'app-storefront',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './storefront.html',
  styleUrl: './storefront.css',
})
export class Storefront implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(Api);

  webpageData = signal<any>(null);
  products = signal<any[]>([]);
  cart = signal<any[]>([]);
  numericWebpageId = signal(0); // tracks the numeric DB id for product queries
  
  isLoading = signal(true);
  isPurchasing = signal(false);
  purchaseSuccess = signal(false);
  
  searchQuery = signal('');
  sortBy = signal('');

  cartTotal = computed(() => {
    return this.cart().reduce((sum, item) => sum + (item.price * item.cartQty), 0);
  });

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (!id) return;

      // If the param is a plain number, load directly by numeric webpage ID
      const numericId = parseInt(id, 10);
      if (!isNaN(numericId) && String(numericId) === id) {
        this.numericWebpageId.set(numericId);
        // Fetch the webpage by numeric id to populate header/back-link
        this.api.getDefaultWebpage().subscribe({
          next: (data) => { this.webpageData.set(data); },
          error: () => {}
        });
        this.loadProducts();
      } else {
        // UUID path — original behaviour
        this.api.getPublicWebpage(id).subscribe({
          next: (data) => {
            this.webpageData.set(data);
            this.numericWebpageId.set(data.id);
            this.loadProducts();
          },
          error: () => this.isLoading.set(false)
        });
      }
    });
  }

  loadProducts() {
    this.isLoading.set(true);
    const wId = this.numericWebpageId();
    if (!wId) return;

    this.api.getProducts(wId, this.searchQuery(), this.sortBy()).subscribe({
      next: (data) => {
        // Parse OtherSpec and filter hidden products
        const parsed = data
          .map((p: any) => {
            let spec: any = {};
            try { spec = JSON.parse(p.otherSpec || '{}'); } catch {}
            return { ...p, _spec: spec };
          })
          .filter((p: any) => !p._spec.isHidden);
        this.products.set(parsed);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  getSubcategory(p: any): string { return p._spec?.subcategory || ''; }
  getCompany(p: any): string { return p._spec?.company || ''; }
  getCustomSpecs(p: any): { key: string; value: string }[] { return p._spec?.specs || []; }

  onSearch() {
    this.loadProducts();
  }

  onSortChange(event: any) {
    this.sortBy.set(event.target.value);
    this.loadProducts();
  }

  addToCart(product: any) {
    const currentCart = [...this.cart()];
    const existing = currentCart.find(p => p.id === product.id);
    
    if (existing) {
      if (existing.cartQty < product.availableQuantity) {
        existing.cartQty++;
      }
    } else {
      if (product.availableQuantity > 0) {
        currentCart.push({ ...product, cartQty: 1 });
      }
    }
    this.cart.set(currentCart);
  }

  removeFromCart(index: number) {
    const currentCart = [...this.cart()];
    currentCart.splice(index, 1);
    this.cart.set(currentCart);
  }

  buyNow() {
    if (this.cart().length === 0) return;
    this.isPurchasing.set(true);
    
    // For each item in cart we add its ID multiple times based on cartQty
    const idsToBuy: number[] = [];
    this.cart().forEach(item => {
      for(let i=0; i < item.cartQty; i++) {
        idsToBuy.push(item.id);
      }
    });

    this.api.buyProduct(idsToBuy).subscribe({
      next: () => {
        this.isPurchasing.set(false);
        this.purchaseSuccess.set(true);
        this.cart.set([]);
        this.loadProducts(); // refresh stock
        setTimeout(() => this.purchaseSuccess.set(false), 4000);
      },
      error: () => this.isPurchasing.set(false)
    });
  }
}
