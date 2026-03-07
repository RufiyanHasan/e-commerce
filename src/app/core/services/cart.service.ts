import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product } from '../models/product.model';
import { CartItem } from '../models/cart-item.model';
import { TokenService } from './token.service';

interface ApiCartItem {
  id: string;
  productId: string;
  quantity: number;
  product: Product & { price: string | number; rating?: string | number };
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly api = `${environment.apiUrl}/cart`;
  private readonly http = inject(HttpClient);
  private readonly token = inject(TokenService);

  private readonly itemsSignal = signal<CartItem[]>([]);

  readonly items = this.itemsSignal.asReadonly();
  readonly totalItemCount = computed(() =>
    this.itemsSignal().reduce((sum, item) => sum + item.quantity, 0)
  );
  readonly totalPrice = computed(() =>
    this.itemsSignal().reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  );

  constructor() {
    // When a token appears (user logs in), load the server cart.
    // When it disappears (logout), clear the local state.
    effect(() => {
      if (this.token.isPresent()) {
        this.loadCart();
      } else {
        this.itemsSignal.set([]);
      }
    });
  }

  // ── Sync from backend ──────────────────────────────────────────────────────

  async loadCart(): Promise<void> {
    if (!this.token.isPresent()) return;
    try {
      const items = await firstValueFrom(this.http.get<ApiCartItem[]>(this.api));
      this.itemsSignal.set(items.map(this.normalise));
    } catch {
      // silently ignore (e.g. token expired)
    }
  }

  // ── Public API (mirrors old interface so templates don't change) ───────────

  getQuantity(productId: string): number {
    return this.itemsSignal().find((i) => i.product.id === productId)?.quantity ?? 0;
  }

  async addItem(product: Product, quantity = 1): Promise<void> {
    const current = this.getQuantity(product.id);
    await this.upsert(product, current + quantity);
  }

  async updateQuantity(productId: string, quantity: number): Promise<void> {
    if (quantity < 1) { await this.removeItem(productId); return; }
    const product = this.itemsSignal().find((i) => i.product.id === productId)?.product;
    if (!product) return;
    await this.upsert(product, quantity);
  }

  async removeItem(productId: string): Promise<void> {
    if (this.token.isPresent()) {
      try {
        await firstValueFrom(this.http.delete(`${this.api}/${productId}`));
      } catch { /* ignore */ }
    }
    this.itemsSignal.update((list) => list.filter((i) => i.product.id !== productId));
  }

  async clear(): Promise<void> {
    if (this.token.isPresent()) {
      try {
        await firstValueFrom(this.http.delete(this.api));
      } catch { /* ignore */ }
    }
    this.itemsSignal.set([]);
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private async upsert(product: Product, quantity: number): Promise<void> {
    // Optimistic update first
    this.setLocal(product, quantity);

    if (!this.token.isPresent()) return;

    try {
      const item = await firstValueFrom(
        this.http.put<ApiCartItem>(this.api, { productId: product.id, quantity })
      );
      // Reconcile with server response
      this.itemsSignal.update((list) =>
        list.map((i) => (i.product.id === product.id ? this.normalise(item) : i))
      );
    } catch { /* keep optimistic state */ }
  }

  private setLocal(product: Product, quantity: number): void {
    const current = this.itemsSignal();
    const exists = current.some((i) => i.product.id === product.id);
    const next = exists
      ? current.map((i) => (i.product.id === product.id ? { ...i, quantity } : i))
      : [...current, { product, quantity }];
    this.itemsSignal.set(next);
  }

  private normalise = (item: ApiCartItem): CartItem => ({
    product: {
      ...item.product,
      price: Number(item.product.price),
      rating: item.product.rating ? Number(item.product.rating) : undefined,
    },
    quantity: item.quantity,
  });
}
