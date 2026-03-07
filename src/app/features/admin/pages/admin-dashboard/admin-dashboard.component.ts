import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { Product } from '../../../../core/models/product.model';
import { ProductService } from '../../../../core/services/product.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [ReactiveFormsModule, DecimalPipe],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent {
  private productService = inject(ProductService);
  private fb = inject(FormBuilder);

  products = this.productService.products;

  showForm = signal(false);
  editingId = signal<string | null>(null);
  deleteConfirmId = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  readonly CATEGORIES = [
    'Audio', 'Accessories', 'Monitors', 'Phones',
    'Laptops', 'Tablets', 'Wearables', 'Storage', 'Other',
  ];

  productForm: FormGroup = this.buildForm();

  // ── Convenience getters for clean template access ──────────────────────────

  get name() { return this.productForm.get('name')!; }
  get description() { return this.productForm.get('description')!; }
  get price() { return this.productForm.get('price')!; }
  get category() { return this.productForm.get('category')!; }
  get imageUrl() { return this.productForm.get('imageUrl')!; }
  get rating() { return this.productForm.get('rating')!; }

  // ── Add ────────────────────────────────────────────────────────────────────

  openAddForm(): void {
    this.productForm = this.buildForm();
    this.editingId.set(null);
    this.showForm.set(true);
  }

  // ── Edit ───────────────────────────────────────────────────────────────────

  openEditForm(product: Product): void {
    this.productForm = this.buildForm({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      imageUrl: product.imageUrl,
      rating: product.rating ?? null,
    });
    this.editingId.set(product.id);
    this.showForm.set(true);
  }

  // ── Save (add or edit) ────────────────────────────────────────────────────

  saveProduct(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const raw = this.productForm.getRawValue();

    const payload: Omit<Product, 'id'> = {
      name: raw.name.trim(),
      description: raw.description.trim(),
      price: Number(raw.price),
      category: raw.category,
      imageUrl: raw.imageUrl?.trim() || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400',
      rating: raw.rating ? Number(raw.rating) : undefined,
    };

    const id = this.editingId();
    if (id) {
      this.productService.updateProduct(id, payload);
      this.flash('Product updated successfully.');
    } else {
      this.productService.addProduct(payload);
      this.flash('Product added successfully.');
    }

    this.closeForm();
  }

  cancelForm(): void {
    this.closeForm();
  }

  // ── Delete ─────────────────────────────────────────────────────────────────

  confirmDelete(id: string): void {
    this.deleteConfirmId.set(id);
  }

  cancelDelete(): void {
    this.deleteConfirmId.set(null);
  }

  deleteProduct(id: string): void {
    this.productService.deleteProduct(id);
    this.deleteConfirmId.set(null);
    this.flash('Product deleted.');
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private buildForm(values?: {
    name?: string;
    description?: string;
    price?: number | null;
    category?: string;
    imageUrl?: string;
    rating?: number | null;
  }): FormGroup {
    return this.fb.group({
      name:        [values?.name        ?? '', [Validators.required, Validators.minLength(2)]],
      description: [values?.description ?? ''],
      price:       [values?.price       ?? null, [Validators.required, Validators.min(0.01)]],
      category:    [values?.category    ?? '', Validators.required],
      imageUrl:    [values?.imageUrl    ?? '', Validators.pattern(/^(https?:\/\/.+)?$/)],
      rating:      [values?.rating      ?? null, [Validators.min(1), Validators.max(5)]],
    });
  }

  private closeForm(): void {
    this.showForm.set(false);
    this.editingId.set(null);
    this.productForm.reset();
  }

  private flash(message: string): void {
    this.successMessage.set(message);
    setTimeout(() => this.successMessage.set(null), 3000);
  }
}
