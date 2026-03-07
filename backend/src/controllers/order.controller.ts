import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const placeOrderSchema = z.object({
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  paymentMethod: z.enum(['card', 'paypal', 'stripe']),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().min(1),
    })
  ).min(1),
});

// POST /api/orders
export async function placeOrder(req: Request, res: Response): Promise<void> {
  const parsed = placeOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid input.', errors: parsed.error.flatten() });
    return;
  }

  const { customerName, customerEmail, paymentMethod, items } = parsed.data;

  // Fetch products to validate they exist and get current prices
  const productIds = items.map((i) => i.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });

  if (products.length !== productIds.length) {
    res.status(400).json({ message: 'One or more products not found.' });
    return;
  }

  const priceMap = new Map(products.map((p) => [p.id, Number(p.price)]));

  const total = items.reduce((sum, item) => {
    return sum + (priceMap.get(item.productId) ?? 0) * item.quantity;
  }, 0);

  const order = await prisma.order.create({
    data: {
      userId: req.user!.userId,
      customerName,
      customerEmail,
      total,
      paymentMethod,
      items: {
        create: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: priceMap.get(item.productId) ?? 0,
        })),
      },
    },
    include: { items: { include: { product: true } } },
  });

  // Clear the user's cart after successful order
  await prisma.cartItem.deleteMany({ where: { userId: req.user!.userId } });

  res.status(201).json(order);
}

// GET /api/orders   — current user's orders
export async function getMyOrders(req: Request, res: Response): Promise<void> {
  const orders = await prisma.order.findMany({
    where: { userId: req.user!.userId },
    include: { items: { include: { product: true } } },
    orderBy: { placedAt: 'desc' },
  });
  res.json(orders);
}

// GET /api/orders/:id
export async function getOrder(req: Request, res: Response): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: req.params['id'] },
    include: { items: { include: { product: true } } },
  });

  if (!order) { res.status(404).json({ message: 'Order not found.' }); return; }

  // Users can only view their own orders; admins can view all
  if (req.user!.role !== 'ADMIN' && order.userId !== req.user!.userId) {
    res.status(403).json({ message: 'Forbidden.' });
    return;
  }

  res.json(order);
}

// GET /api/admin/orders   — all orders (admin only)
export async function getAllOrders(_req: Request, res: Response): Promise<void> {
  const orders = await prisma.order.findMany({
    include: { items: { include: { product: true } }, user: { select: { name: true, email: true } } },
    orderBy: { placedAt: 'desc' },
  });
  res.json(orders);
}

// PATCH /api/admin/orders/:id/status   (admin only)
export async function updateOrderStatus(req: Request, res: Response): Promise<void> {
  const { status } = req.body;
  const validStatuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
  if (!validStatuses.includes(status)) {
    res.status(400).json({ message: 'Invalid status.' });
    return;
  }
  try {
    const order = await prisma.order.update({
      where: { id: req.params['id'] },
      data: { status },
    });
    res.json(order);
  } catch {
    res.status(404).json({ message: 'Order not found.' });
  }
}
