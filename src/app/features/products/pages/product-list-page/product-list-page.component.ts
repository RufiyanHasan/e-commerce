import { Component } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Product } from '../../../../core/models/product.model';
import { ProductService } from '../../../../core/services/product.service';
import { CartService } from '../../../../core/services/cart.service';

@Component({
  selector: 'app-product-list-page',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './product-list-page.component.html',
  styleUrl: './product-list-page.component.scss',
})
export class ProductListPageComponent {
  products: Product[] = [];

  constructor(
    private productService: ProductService,
    protected cart: CartService
  ) {
    this.products = this.productService.getProducts();
  }

  getQuantity(productId: string): number {
    return this.cart.getQuantity(productId);
  }

  addToCart(product: Product): void {
    this.cart.addItem(product, 1);
  }

  increase(productId: string, current: number): void {
    this.cart.updateQuantity(productId, current + 1);
  }

  decrease(productId: string, current: number): void {
    this.cart.updateQuantity(productId, current - 1);
  }
}
