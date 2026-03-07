import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional().default(''),
  price: z.number().positive(),
  category: z.string().min(1),
  imageUrl: z.string().url().optional().default(''),
  rating: z.number().min(1).max(5).optional(),
  inStock: z.boolean().optional().default(true),
});

// GET /api/products
export async function getProducts(req: Request, res: Response): Promise<void> {
  const { category, search } = req.query;

  const products = await prisma.product.findMany({
    where: {
      ...(category ? { category: String(category) } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: String(search), mode: 'insensitive' } },
              { description: { contains: String(search), mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json(products);
}

// GET /api/products/:id
export async function getProduct(req: Request, res: Response): Promise<void> {
  const product = await prisma.product.findUnique({ where: { id: req.params['id'] } });
  if (!product) { res.status(404).json({ message: 'Product not found.' }); return; }
  res.json(product);
}

// POST /api/products   (admin only)
export async function createProduct(req: Request, res: Response): Promise<void> {
  const parsed = productSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid input.', errors: parsed.error.flatten() });
    return;
  }
  const product = await prisma.product.create({ data: parsed.data });
  res.status(201).json(product);
}

// PATCH /api/products/:id   (admin only)
export async function updateProduct(req: Request, res: Response): Promise<void> {
  const parsed = productSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid input.', errors: parsed.error.flatten() });
    return;
  }
  try {
    const product = await prisma.product.update({
      where: { id: req.params['id'] },
      data: parsed.data,
    });
    res.json(product);
  } catch {
    res.status(404).json({ message: 'Product not found.' });
  }
}

// DELETE /api/products/:id   (admin only)
export async function deleteProduct(req: Request, res: Response): Promise<void> {
  try {
    await prisma.product.delete({ where: { id: req.params['id'] } });
    res.status(204).send();
  } catch {
    res.status(404).json({ message: 'Product not found.' });
  }
}
