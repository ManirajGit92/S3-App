import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Api } from '../api';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(Api);
  public cartService = inject(CartService);

  webpageData = signal<any>(null);
  numericWebpageId = signal(0);
  isLoading = signal(true);

  // Checkout states (integrated into cart page)
  showCheckoutForm = signal(false);
  isPurchasing = signal(false);
  purchaseSuccess = signal(false);
  paymentMethod = signal<'upi' | 'cod' | 'netbanking'>('upi');

  // Form signals
  customerName = signal('');
  customerPhone = signal('');
  customerAddress = signal('');
  upiTxnId = signal('');
  bankName = signal('');
  accountNo = signal('');

  cart = this.cartService.cart;
  cartTotal = this.cartService.cartTotal;
  cartCount = this.cartService.cartCount;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        const numericId = parseInt(id, 10);
        this.numericWebpageId.set(numericId);
        this.api.getDefaultWebpage().subscribe({
          next: (data) => {
            this.webpageData.set(data);
            this.isLoading.set(false);
          },
          error: () => this.isLoading.set(false)
        });
      }
    });
  }

  updateQty(id: number, delta: number) {
    this.cartService.updateQty(id, delta);
  }

  removeItem(id: number) {
    this.cartService.removeFromCart(id);
  }

  checkout() {
    if (this.cart().length === 0) return;
    this.showCheckoutForm.set(true);
    // Scroll to form
    setTimeout(() => {
      document.getElementById('checkout-form')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  processOrder() {
    if (!this.customerName().trim() || !this.customerPhone().trim()) {
      alert('Please fill in required fields.');
      return;
    }

    if (this.paymentMethod() === 'upi' && !this.upiTxnId().trim()) {
      alert('Please enter UPI Transaction ID.');
      return;
    }

    this.isPurchasing.set(true);
    const idsToBuy: number[] = [];
    this.cart().forEach(item => {
      for (let i = 0; i < item.cartQty; i++) idsToBuy.push(item.id);
    });

    const checkoutData = {
      productIds: idsToBuy,
      customerName: this.customerName(),
      customerPhone: this.customerPhone(),
      paymentMethod: this.paymentMethod()
    };

    this.api.buyProduct(checkoutData).subscribe({
      next: () => {
        this.isPurchasing.set(false);
        this.purchaseSuccess.set(true);
        this.cartService.clearCart();
        setTimeout(() => {
          this.purchaseSuccess.set(false);
          this.showCheckoutForm.set(false);
        }, 5000);
      },
      error: () => {
        this.isPurchasing.set(false);
        alert('Order failed. Please try again.');
      }
    });
  }
}
