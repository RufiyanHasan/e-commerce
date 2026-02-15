import { Routes } from '@angular/router';
import { MainLayoutComponent } from './main-layout/main-layout.component';

export const LAYOUT_ROUTES: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('../features/home/home.routes').then((m) => m.HOME_ROUTES),
      },
      {
        path: 'products',
        loadChildren: () =>
          import('../features/products/products.routes').then((m) => m.PRODUCTS_ROUTES),
      },
      {
        path: 'cart',
        loadChildren: () =>
          import('../features/cart/cart.routes').then((m) => m.CART_ROUTES),
      },
      {
        path: 'checkout',
        loadChildren: () =>
          import('../features/checkout/checkout.routes').then((m) => m.CHECKOUT_ROUTES),
      },
      {
        path: 'auth',
        loadChildren: () =>
          import('../features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
      },
    ],
  },
];
