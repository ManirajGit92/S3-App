import { Injectable, signal, computed } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  // Centralized cart state
  private _cart = signal<any[]>([]);

  // Exposed read-only cart signal
  cart = computed(() => this._cart());

  // Computed totals
  cartCount = computed(() => this._cart().reduce((sum, item) => sum + item.cartQty, 0));
  cartTotal = computed(() => this._cart().reduce((sum, item) => sum + (item.price * item.cartQty), 0));

  constructor() {
    this.loadFromStorage();
  }

  addToCart(product: any) {
    const current = [...this._cart()];
    const existing = current.find(p => p.id === product.id);

    if (existing) {
      if (existing.cartQty < product.availableQuantity) {
        existing.cartQty++;
      }
    } else if (product.availableQuantity > 0) {
      current.push({ ...product, cartQty: 1 });
    }
    this._setData(current);
  }

  updateQty(id: number, delta: number) {
    const current = [...this._cart()];
    const item = current.find(p => p.id === id);
    if (!item) return;

    item.cartQty = Math.max(1, Math.min(item.cartQty + delta, item.availableQuantity));
    this._setData(current);
  }

  removeFromCart(id: number) {
    const filtered = this._cart().filter(p => p.id !== id);
    this._setData(filtered);
  }

  clearCart() {
    this._setData([]);
  }

  private _setData(data: any[]) {
    this._cart.set(data);
    this.saveToStorage();
  }

  private saveToStorage() {
    localStorage.setItem('s3app_cart', JSON.stringify(this._cart()));
  }

  private loadFromStorage() {
    try {
      const saved = localStorage.getItem('s3app_cart');
      if (saved) {
        this._cart.set(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Error loading cart from storage', e);
    }
  }
}
