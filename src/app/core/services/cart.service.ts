import { Injectable, signal, computed, effect } from '@angular/core';
import { Product } from '../models/product.model';
import { CartItem } from '../models/cart-item.model';

const CART_STORAGE_KEY = 'ecommerce_cart';

function isCartItem(raw: unknown): raw is CartItem {
  if (!raw || typeof raw !== 'object') return false;
  const o = raw as Record<string, unknown>;
  const q = o['quantity'];
  if (typeof q !== 'number' || q < 1) return false;
  const p = o['product'];
  if (!p || typeof p !== 'object') return false;
  const prod = p as Record<string, unknown>;
  return (
    typeof prod['id'] === 'string' &&
    typeof prod['name'] === 'string' &&
    typeof prod['price'] === 'number'
  );
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly itemsSignal = signal<CartItem[]>(this.loadFromStorage());

  readonly items = this.itemsSignal.asReadonly();
  readonly totalItemCount = computed(() =>
    this.itemsSignal().reduce((sum, item) => sum + item.quantity, 0)
  );
  readonly totalPrice = computed(() =>
    this.itemsSignal().reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  );

  constructor() {
    effect(() => {
      const items = this.itemsSignal();
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
        } catch {
          // ignore quota / private mode
        }
      }
    });
  }

  private loadFromStorage(): CartItem[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      if (!raw) return [];
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(isCartItem);
    } catch {
      return [];
    }
  }

  getQuantity(productId: string): number {
    return this.itemsSignal().find((i) => i.product.id === productId)?.quantity ?? 0;
  }

  addItem(product: Product, quantity = 1): void {
    const current = this.itemsSignal();
    const existing = current.find((i) => i.product.id === product.id);
    const next: CartItem[] = existing
      ? current.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        )
      : [...current, { product, quantity }];
    this.itemsSignal.set(next);
  }

  updateQuantity(productId: string, quantity: number): void {
    if (quantity < 1) {
      this.removeItem(productId);
      return;
    }
    const next = this.itemsSignal().map((i) =>
      i.product.id === productId ? { ...i, quantity } : i
    );
    this.itemsSignal.set(next);
  }

  removeItem(productId: string): void {
    this.itemsSignal.set(this.itemsSignal().filter((i) => i.product.id !== productId));
  }

  clear(): void {
    this.itemsSignal.set([]);
  }
}
