import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../lib/prisma';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function signToken(userId: string, role: string): string {
  return jwt.sign(
    { userId, role },
    process.env['JWT_SECRET'] as string,
    { expiresIn: (process.env['JWT_EXPIRES_IN'] ?? '7d') as jwt.SignOptions['expiresIn'] }
  );
}

// POST /api/auth/register
export async function register(req: Request, res: Response): Promise<void> {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid input.', errors: parsed.error.flatten() });
    return;
  }

  const { name, email, password } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ message: 'Email already in use.' });
    return;
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hashed },
    select: { id: true, name: true, email: true, role: true },
  });

  res.status(201).json({ token: signToken(user.id, user.role), user });
}

// POST /api/auth/login
export async function login(req: Request, res: Response): Promise<void> {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid input.' });
    return;
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401).json({ message: 'Invalid email or password.' });
    return;
  }

  res.json({
    token: signToken(user.id, user.role),
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
}

// GET /api/auth/me   (requires authenticate middleware)
export async function me(req: Request, res: Response): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  if (!user) { res.status(404).json({ message: 'User not found.' }); return; }
  res.json(user);
}

// POST /api/auth/google
// Receives a Google ID token (credential) from the frontend,
// verifies it, then creates or finds the user and returns a JWT.
export async function googleSignIn(req: Request, res: Response): Promise<void> {
  const { credential } = req.body as { credential?: string };
  if (!credential) {
    res.status(400).json({ message: 'Google credential is required.' });
    return;
  }

  const clientId = process.env['GOOGLE_CLIENT_ID'];
  if (!clientId) {
    res.status(500).json({ message: 'Google OAuth is not configured on this server.' });
    return;
  }

  try {
    const client = new OAuth2Client(clientId);
    const ticket = await client.verifyIdToken({ idToken: credential, audience: clientId });
    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      res.status(401).json({ message: 'Invalid Google token.' });
      return;
    }

    const { email, name, sub: googleId } = payload;

    // Find existing user or create a new one (no password — Google-only accounts get a random hash)
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: name ?? email.split('@')[0],
          password: await bcrypt.hash(googleId, 10), // never used for Google users
          googleId,
        },
      });
    } else if (!user.googleId) {
      // Link Google ID to existing email account
      user = await prisma.user.update({
        where: { email },
        data: { googleId },
      });
    }

    res.json({
      token: signToken(user.id, user.role),
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error('Google sign-in error:', errMsg);
    console.error('GOOGLE_CLIENT_ID used:', clientId);
    console.error('Credential (first 20 chars):', credential.substring(0, 20));
    res.status(401).json({ message: 'Failed to verify Google token.', detail: errMsg });
  }
}
