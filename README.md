# E-Commerce App

A full-stack e-commerce application built with **Angular 21** (frontend) and **Node.js + Express + Prisma** (backend).

## Tech Stack

### Frontend
- Angular 21 (standalone components, lazy-loaded routes)
- SCSS
- TypeScript
- Deployed on **Vercel**

### Backend
- Node.js + Express
- Prisma ORM with PostgreSQL
- JWT authentication + Google OAuth
- Zod validation
- Deployed on **Railway**

## Features

- User authentication (email/password + Google sign-in)
- Product catalog with categories, ratings, and search
- Shopping cart (persistent, server-side)
- Checkout and order placement
- Order tracking with status updates (Pending → Confirmed → Shipped → Delivered)
- Admin panel
- Contact form via EmailJS

## Project Structure

```
├── src/                        # Angular frontend
│   └── app/
│       ├── core/               # Services, guards, interceptors
│       ├── shared/             # Reusable components (header, footer)
│       ├── layout/             # Main layout shell
│       └── features/           # Lazy-loaded feature modules
│           ├── home/
│           ├── products/
│           ├── cart/
│           ├── checkout/
│           ├── auth/
│           └── admin/
├── backend/                    # Express API
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/             # auth, products, cart, orders
│   │   ├── middleware/
│   │   └── server.ts
│   └── prisma/
│       ├── schema.prisma
│       └── seed.ts
```

## Database Models

- **User** – email, name, password, role (Customer/Admin), optional Google ID
- **Product** – name, description, price, category, image, rating, stock status
- **Order** – user reference, total, payment method, status
- **OrderItem** – order reference, product reference, quantity, unit price
- **CartItem** – user reference, product reference, quantity

## Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL database
- npm

### Frontend

```bash
npm install
npm start
# Runs at http://localhost:4200
```

### Backend

```bash
cd backend
npm install
```

Create a `.env` file in `backend/` with:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/ecommerce
JWT_SECRET=your-secret-key
```

Then run:

```bash
npm run db:generate    # Generate Prisma client
npm run db:migrate     # Run database migrations
npm run db:seed        # Seed sample data (optional)
npm run dev            # Start dev server
```

### Useful Commands

| Command | Description |
|---------|-------------|
| `npm start` | Start Angular dev server |
| `npm run build` | Production build |
| `npm test` | Run unit tests |
| `cd backend && npm run dev` | Start backend dev server |
| `cd backend && npm run db:studio` | Open Prisma Studio |

## Deployment

- **Frontend** → Vercel (pre-built `dist/browser` served directly)
- **Backend** → Railway (Nixpacks build with Prisma generate)
