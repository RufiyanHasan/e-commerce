import { Component, OnDestroy, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../../core/services/cart.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Order } from '../../../../core/models/order.model';
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
  selectedMethod: PaymentMethod = 'card';
  orderPlaced = false;
  placing = false;
  paypalLoaded = false;
  paypalError: string | null = null;

  // Customer contact details for email notification
  customerName = '';
  customerEmail = '';

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

  constructor(
    protected cart: CartService,
    private notifications: NotificationService
  ) {}

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

  async placeOrder(): Promise<void> {
    this.placing = true;
    const order = this.buildOrder();
    await this.notifications.notifyOrderPlaced(order);
    this.cart.clear();
    this.orderPlaced = true;
    this.placing = false;
  }

  private buildOrder(): Order {
    return {
      id: `ORD-${Date.now()}`,
      customerName: this.customerName || 'Customer',
      customerEmail: this.customerEmail,
      items: this.cart.items(),
      total: this.cart.totalPrice(),
      paymentMethod: this.selectedMethod,
      placedAt: new Date(),
    };
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
