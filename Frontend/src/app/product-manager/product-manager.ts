import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Api } from '../api';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-manager',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './product-manager.html',
  styleUrl: './product-manager.css',
})
export class ProductManager implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(Api);
  private router = inject(Router);

  products = signal<any[]>([]);
  isLoading = signal(true);
  isSaving = signal(false);
  
  webpageId = signal(0);
  username = signal('');
  uniqueId = signal('');
  
  showForm = signal(false);
  editingId = signal<number | null>(null);

  productForm = this.fb.group({
    productName: ['', Validators.required],
    productCategory: [''],
    price: [0, [Validators.required, Validators.min(0)]],
    availableQuantity: [1, [Validators.required, Validators.min(0)]],
    description: ['']
  });

  ngOnInit() {
    const userStr = localStorage.getItem('user');
    if (!userStr || !localStorage.getItem('token')) {
      this.router.navigate(['/login']);
      return;
    }
    const user = JSON.parse(userStr);
    this.webpageId.set(user.webpageId);
    this.username.set(user.username);
    this.uniqueId.set(user.uniqueId);

    this.loadProducts();
  }

  loadProducts() {
    this.isLoading.set(true);
    this.api.getProducts(this.webpageId()).subscribe({
      next: (data) => {
        this.products.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  openNew() {
    this.productForm.reset({ price: 0, availableQuantity: 1 });
    this.editingId.set(null);
    this.showForm.set(true);
  }

  editProduct(p: any) {
    this.productForm.patchValue(p);
    this.editingId.set(p.id);
    this.showForm.set(true);
  }

  deleteProduct(id: number) {
    if(confirm('Are you sure you want to delete this product?')) {
      this.api.deleteProduct(id).subscribe(() => this.loadProducts());
    }
  }

  cancel() {
    this.showForm.set(false);
  }

  onSubmit() {
    if (this.productForm.invalid) return;
    this.isSaving.set(true);

    const val = { ...this.productForm.value, webpageId: this.webpageId() };

    if (this.editingId()) {
      this.api.updateProduct(this.editingId()!, val).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.showForm.set(false);
          this.loadProducts();
        },
        error: () => this.isSaving.set(false)
      });
    } else {
      this.api.createProduct(val).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.showForm.set(false);
          this.loadProducts();
        },
        error: () => this.isSaving.set(false)
      });
    }
  }
}
