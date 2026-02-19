import { CartItem } from './cart-item.model';

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  items: CartItem[];
  total: number;
  paymentMethod: string;
  placedAt: Date;
}
