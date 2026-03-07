import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const upsertSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().min(1),
});

// GET /api/cart
export async function getCart(req: Request, res: Response): Promise<void> {
  const items = await prisma.cartItem.findMany({
    where: { userId: req.user!.userId },
    include: { product: true },
    orderBy: { id: 'asc' },
  });
  res.json(items);
}

// PUT /api/cart   — add or update quantity (upsert)
export async function upsertCartItem(req: Request, res: Response): Promise<void> {
  const parsed = upsertSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid input.', errors: parsed.error.flatten() });
    return;
  }

  const { productId, quantity } = parsed.data;

  const item = await prisma.cartItem.upsert({
    where: { userId_productId: { userId: req.user!.userId, productId } },
    create: { userId: req.user!.userId, productId, quantity },
    update: { quantity },
    include: { product: true },
  });

  res.json(item);
}

// DELETE /api/cart/:productId
export async function removeCartItem(req: Request, res: Response): Promise<void> {
  try {
    await prisma.cartItem.delete({
      where: {
        userId_productId: {
          userId: req.user!.userId,
          productId: req.params['productId'],
        },
      },
    });
    res.status(204).send();
  } catch {
    res.status(404).json({ message: 'Cart item not found.' });
  }
}

// DELETE /api/cart
export async function clearCart(req: Request, res: Response): Promise<void> {
  await prisma.cartItem.deleteMany({ where: { userId: req.user!.userId } });
  res.status(204).send();
}
