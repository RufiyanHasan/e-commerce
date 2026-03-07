import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly api = `${environment.apiUrl}/products`;
  private readonly productsSignal = signal<Product[]>([]);

  readonly products = this.productsSignal.asReadonly();

  constructor(private http: HttpClient) {
    this.loadProducts();
  }

  // ── Load all products from backend ─────────────────────────────────────────

  async loadProducts(): Promise<void> {
    try {
      const products = await firstValueFrom(this.http.get<Product[]>(this.api));
      // Backend returns price as string (Decimal) — normalise to number
      this.productsSignal.set(
        products.map((p) => ({ ...p, price: Number(p.price), rating: p.rating ? Number(p.rating) : undefined }))
      );
    } catch (err) {
      console.error('Failed to load products:', err);
    }
  }

  // ── Read ───────────────────────────────────────────────────────────────────

  getProducts(): Product[] {
    return this.productsSignal();
  }

  getProductById(id: string): Product | undefined {
    return this.productsSignal().find((p) => p.id === id);
  }

  getCategories(): string[] {
    const set = new Set(this.productsSignal().map((p) => p.category));
    return Array.from(set).sort();
  }

  // ── Admin: Add ─────────────────────────────────────────────────────────────

  async addProduct(product: Omit<Product, 'id'>): Promise<Product> {
    const created = await firstValueFrom(this.http.post<Product>(this.api, product));
    const normalised = { ...created, price: Number(created.price), rating: created.rating ? Number(created.rating) : undefined };
    this.productsSignal.update((list) => [...list, normalised]);
    return normalised;
  }

  // ── Admin: Edit ────────────────────────────────────────────────────────────

  async updateProduct(id: string, changes: Partial<Omit<Product, 'id'>>): Promise<void> {
    const updated = await firstValueFrom(this.http.patch<Product>(`${this.api}/${id}`, changes));
    const normalised = { ...updated, price: Number(updated.price), rating: updated.rating ? Number(updated.rating) : undefined };
    this.productsSignal.update((list) => list.map((p) => (p.id === id ? normalised : p)));
  }

  // ── Admin: Delete ──────────────────────────────────────────────────────────

  async deleteProduct(id: string): Promise<void> {
    await firstValueFrom(this.http.delete(`${this.api}/${id}`));
    this.productsSignal.update((list) => list.filter((p) => p.id !== id));
  }
}
