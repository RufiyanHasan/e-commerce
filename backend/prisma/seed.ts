import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const PRODUCTS = [
  { name: 'Wireless Bluetooth Headphones', description: 'Over-ear noise-cancelling headphones with 30hr battery.', price: 129.99, category: 'Audio', imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', rating: 4.5 },
  { name: 'Mechanical Gaming Keyboard', description: 'RGB backlit, Cherry MX switches, programmable keys.', price: 149.99, category: 'Accessories', imageUrl: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=400', rating: 4.7 },
  { name: '27" 4K Monitor', description: 'IPS panel, 144Hz, HDR, USB-C.', price: 449.99, category: 'Monitors', imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400', rating: 4.8 },
  { name: 'Smartphone 128GB', description: '6.5" AMOLED, 5G, triple camera, 5000mAh.', price: 599.99, category: 'Phones', imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400', rating: 4.6 },
  { name: 'Laptop 15" Ultrabook', description: 'Intel i7, 16GB RAM, 512GB SSD, 8hr battery.', price: 999.99, category: 'Laptops', imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400', rating: 4.5 },
  { name: 'Wireless Mouse', description: 'Ergonomic, 16000 DPI, 70-day battery.', price: 49.99, category: 'Accessories', imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400', rating: 4.4 },
  { name: 'Smart Watch', description: 'Health tracking, GPS, 7-day battery, water resistant.', price: 279.99, category: 'Wearables', imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', rating: 4.3 },
  { name: 'USB-C Hub 7-in-1', description: 'HDMI, USB 3.0, SD card, 100W PD.', price: 59.99, category: 'Accessories', imageUrl: 'https://images.unsplash.com/photo-1625723044792-44de16ccb4e9?w=400', rating: 4.6 },
  { name: 'Tablet 10.9"', description: '64GB, Retina display, Apple Pencil support.', price: 449.99, category: 'Tablets', imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400', rating: 4.7 },
  { name: 'Portable SSD 1TB', description: 'USB 3.2, up to 1050MB/s read, shock resistant.', price: 119.99, category: 'Storage', imageUrl: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400', rating: 4.8 },
  { name: 'Webcam 1080p', description: 'Auto-focus, built-in mic, privacy shutter.', price: 79.99, category: 'Accessories', imageUrl: 'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=400', rating: 4.2 },
  { name: 'Smart Speaker', description: 'Voice assistant, 360° sound, smart home hub.', price: 99.99, category: 'Audio', imageUrl: 'https://images.unsplash.com/photo-1558089687-f282ffc0f0e0?w=400', rating: 4.4 },
];

async function main() {
  console.log('🌱 Seeding database...');

  // ── Users ──────────────────────────────────────────────────────────────────
  await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: { password: await bcrypt.hash('password123', 10) },
    create: {
      email: 'user@example.com',
      name: 'John Doe',
      password: await bcrypt.hash('password123', 10),
      role: Role.CUSTOMER,
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@store.com' },
    update: { password: await bcrypt.hash('admin123', 10) },
    create: {
      email: 'admin@store.com',
      name: 'Store Admin',
      password: await bcrypt.hash('admin123', 10),
      role: Role.ADMIN,
    },
  });

  // ── Products (upsert on name — safe to re-run) ─────────────────────────────
  for (const product of PRODUCTS) {
    await prisma.product.upsert({
      where: { name: product.name },
      update: product,
      create: product,
    });
  }

  const count = await prisma.product.count();
  console.log(`✅ Seeding complete — ${count} products in DB.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
