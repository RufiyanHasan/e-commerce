import { Injectable } from '@angular/core';
import { Product } from '../models/product.model';

/** Electronics & tech products – shown to logged-in users. */
const ELECTRONICS_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Wireless Bluetooth Headphones',
    description: 'Over-ear noise-cancelling headphones with 30hr battery.',
    price: 129.99,
    category: 'Audio',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    rating: 4.5,
  },
  {
    id: '2',
    name: 'Mechanical Gaming Keyboard',
    description: 'RGB backlit, Cherry MX switches, programmable keys.',
    price: 149.99,
    category: 'Accessories',
    imageUrl: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=400',
    rating: 4.7,
  },
  {
    id: '3',
    name: '27" 4K Monitor',
    description: 'IPS panel, 144Hz, HDR, USB-C.',
    price: 449.99,
    category: 'Monitors',
    imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400',
    rating: 4.8,
  },
  {
    id: '4',
    name: 'Smartphone 128GB',
    description: '6.5" AMOLED, 5G, triple camera, 5000mAh.',
    price: 599.99,
    category: 'Phones',
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
    rating: 4.6,
  },
  {
    id: '5',
    name: 'Laptop 15" Ultrabook',
    description: 'Intel i7, 16GB RAM, 512GB SSD, 8hr battery.',
    price: 999.99,
    category: 'Laptops',
    imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
    rating: 4.5,
  },
  {
    id: '6',
    name: 'Wireless Mouse',
    description: 'Ergonomic, 16000 DPI, 70-day battery.',
    price: 49.99,
    category: 'Accessories',
    imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400',
    rating: 4.4,
  },
  {
    id: '7',
    name: 'Smart Watch',
    description: 'Health tracking, GPS, 7-day battery, water resistant.',
    price: 279.99,
    category: 'Wearables',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
    rating: 4.3,
  },
  {
    id: '8',
    name: 'USB-C Hub 7-in-1',
    description: 'HDMI, USB 3.0, SD card, 100W PD.',
    price: 59.99,
    category: 'Accessories',
    imageUrl: 'https://images.unsplash.com/photo-1625723044792-44de16ccb4e9?w=400',
    rating: 4.6,
  },
  {
    id: '9',
    name: 'Tablet 10.9"',
    description: '64GB, Retina display, Apple Pencil support.',
    price: 449.99,
    category: 'Tablets',
    imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400',
    rating: 4.7,
  },
  {
    id: '10',
    name: 'Portable SSD 1TB',
    description: 'USB 3.2, up to 1050MB/s read, shock resistant.',
    price: 119.99,
    category: 'Storage',
    imageUrl: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400',
    rating: 4.8,
  },
  {
    id: '11',
    name: 'Webcam 1080p',
    description: 'Auto-focus, built-in mic, privacy shutter.',
    price: 79.99,
    category: 'Accessories',
    imageUrl: 'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=400',
    rating: 4.2,
  },
  {
    id: '12',
    name: 'Smart Speaker',
    description: 'Voice assistant, 360° sound, smart home hub.',
    price: 99.99,
    category: 'Audio',
    imageUrl: 'https://images.unsplash.com/photo-1548617335-c1b176388c65?q=80&w=3270&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    rating: 4.4,
  },
];

@Injectable({ providedIn: 'root' })
export class ProductService {
  getProducts(): Product[] {
    return [...ELECTRONICS_PRODUCTS];
  }

  getProductById(id: string): Product | undefined {
    return ELECTRONICS_PRODUCTS.find((p) => p.id === id);
  }

  getCategories(): string[] {
    const set = new Set(ELECTRONICS_PRODUCTS.map((p) => p.category));
    return Array.from(set).sort();
  }
}
