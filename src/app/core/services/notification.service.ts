import { Injectable } from '@angular/core';
import emailjs from '@emailjs/browser';
import { environment } from '../../../environments/environment';
import { Order } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {

  async notifyOrderPlaced(order: Order): Promise<void> {
    const itemsSummary = order.items
      .map((i) => `${i.product.name} x${i.quantity} — $${(i.product.price * i.quantity).toFixed(2)}`)
      .join('\n');

    const templateParams = {
      to_name: order.customerName,
      to_email: order.customerEmail,
      order_id: order.id,
      order_items: itemsSummary,
      order_total: `$${order.total.toFixed(2)} USD`,
      payment_method: order.paymentMethod,
      order_date: order.placedAt.toLocaleDateString(),
    };

    try {
      await emailjs.send(
        environment.emailjs.serviceId,
        environment.emailjs.templateId,
        templateParams,
        environment.emailjs.publicKey
      );
      console.log('✅ Confirmation email sent to', order.customerEmail);
    } catch (err) {
      console.error('❌ Failed to send email:', err);
    }
  }
}
