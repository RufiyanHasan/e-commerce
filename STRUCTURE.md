# E-Commerce Frontend – Project Structure

Angular 21 standalone app with feature-based structure.

```
src/
├── app/
│   ├── core/                 # Singletons (services, guards, interceptors)
│   ├── shared/               # Reusable components, pipes, directives
│   │   └── components/       # Header, Footer, etc.
│   ├── layout/               # Shell (main layout, header/footer wrapper)
│   │   └── main-layout/
│   ├── features/             # Lazy-loaded feature areas
│   │   ├── home/
│   │   ├── products/
│   │   ├── cart/
│   │   ├── checkout/
│   │   └── auth/
│   ├── app.config.ts
│   ├── app.routes.ts
│   └── app.component.ts
├── styles.scss
└── main.ts
```

## Practices

- **Standalone components** – no NgModules for features
- **Lazy loading** – each feature has its own route and `loadChildren`
- **SCSS** – component and global styles
- **Single responsibility** – one main component per route in each feature

## Commands

- `npm start` – dev server
- `npm run build` – production build
