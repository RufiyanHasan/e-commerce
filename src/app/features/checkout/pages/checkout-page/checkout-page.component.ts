import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { CartService } from '../../../../core/services/cart.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { AuthService } from '../../../../core/services/auth.service';
import { environment } from '../../../../../environments/environment';

export type PaymentMethod = 'card' | 'paypal' | 'stripe';

declare const paypal: {
  Buttons: (config: {
    createOrder: (data: unknown, actions: PayPalActions) => Promise<string>;
    onApprove: (data: { orderID: string }, actions: PayPalActions) => Promise<void>;
    onError: (err: unknown) => void;
  }) => { render: (selector: string) => void };
};

interface PayPalActions {
  order: {
    create: (order: unknown) => Promise<string>;
    capture: () => Promise<{ payer: { name: { given_name: string } } }>;
  };
}

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [DecimalPipe, RouterLink, FormsModule],
  templateUrl: './checkout-page.component.html',
  styleUrl: './checkout-page.component.scss',
})
export class CheckoutPageComponent implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  protected cart = inject(CartService);
  private notifications = inject(NotificationService);
  private auth = inject(AuthService);
  selectedMethod: PaymentMethod = 'card';
  orderPlaced = false;
  placing = false;
  paypalLoaded = false;
  paypalError: string | null = null;
  emailError: string | null = null;

  // Customer contact details — pre-fill from logged-in user
  customerName = this.auth.currentUser()?.name ?? '';
  customerEmail = this.auth.currentUser()?.email ?? '';

  private scriptEl: HTMLScriptElement | null = null;

  methods: { id: PaymentMethod; label: string; icon: string; note: string }[] = [
    {
      id: 'card',
      label: 'Credit / Debit Card',
      icon: '💳',
      note: 'Visa, Mastercard, Amex – powered by Stripe (test mode)',
    },
    {
      id: 'paypal',
      label: 'PayPal',
      icon: '🅿️',
      note: 'Pay with your PayPal account (sandbox)',
    },
    {
      id: 'stripe',
      label: 'Stripe Checkout',
      icon: '⚡',
      note: 'Fast, one-click checkout via Stripe (test mode)',
    },
  ];

  constructor() {}

  ngOnInit(): void {
    this.loadPayPalScript();
  }

  ngOnDestroy(): void {
    if (this.scriptEl) {
      document.body.removeChild(this.scriptEl);
      this.scriptEl = null;
    }
  }

  onMethodChange(): void {
    if (this.selectedMethod === 'paypal' && this.paypalLoaded) {
      setTimeout(() => this.renderPayPalButton(), 0);
    }
  }

  onEmailChange(): void {
    if (this.customerEmail && this.customerEmail.includes('@')) {
      this.emailError = null;
    }
  }

  async placeOrder(): Promise<void> {
    if (!this.customerEmail || !this.customerEmail.includes('@')) {
      this.emailError = 'A valid email address is required to place an order.';
      return;
    }
    this.emailError = null;
    this.placing = true;

    try {
      const orderPayload = {
        customerName: this.customerName || 'Customer',
        customerEmail: this.customerEmail,
        paymentMethod: this.selectedMethod,
        items: this.cart.items().map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
        })),
      };

      const order = await firstValueFrom(
        this.http.post<{ id: string; customerName: string; customerEmail: string; total: number; paymentMethod: string; placedAt: string }>(
          `${environment.apiUrl}/orders`,
          orderPayload
        )
      );

      // Send confirmation email via EmailJS
      await this.notifications.notifyOrderPlaced({
        id: order.id,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        items: this.cart.items(),
        total: Number(order.total),
        paymentMethod: order.paymentMethod,
        placedAt: new Date(order.placedAt),
      });

      // Cart is cleared server-side by the order endpoint; clear locally too
      await this.cart.clear();
      this.orderPlaced = true;
    } catch (err) {
      console.error('Order failed:', err);
      this.emailError = 'Failed to place order. Please try again.';
    } finally {
      this.placing = false;
    }
  }

  private loadPayPalScript(): void {
    if (document.getElementById('paypal-sdk')) {
      this.paypalLoaded = true;
      return;
    }
    const script = document.createElement('script');
    script.id = 'paypal-sdk';
    script.src = `https://www.paypal.com/sdk/js?client-id=${environment.paypalClientId}&currency=USD`;
    script.onload = () => {
      this.paypalLoaded = true;
      if (this.selectedMethod === 'paypal') {
        this.renderPayPalButton();
      }
    };
    script.onerror = () => {
      this.paypalError = 'Failed to load PayPal. Check your Client ID or network.';
    };
    this.scriptEl = script;
    document.body.appendChild(script);
  }

  private renderPayPalButton(): void {
    const container = document.getElementById('paypal-button-container');
    if (!container) return;
    container.innerHTML = '';

    paypal
      .Buttons({
        createOrder: (_data: unknown, actions: PayPalActions) =>
          actions.order.create({
            purchase_units: [{ amount: { value: this.cart.totalPrice().toFixed(2) } }],
          }),
        onApprove: (_data: { orderID: string }, actions: PayPalActions) =>
          actions.order.capture().then(async (details) => {
            const name = details?.payer?.name?.given_name ?? 'Customer';
            this.customerName = this.customerName || name;
            await this.placeOrder();
          }),
        onError: (err: unknown) => {
          console.error('PayPal error:', err);
          this.paypalError = 'Payment failed. Please try again.';
        },
      })
      .render('#paypal-button-container');
  }
}
