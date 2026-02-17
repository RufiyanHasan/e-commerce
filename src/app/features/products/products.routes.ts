import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { ProductListPageComponent } from './pages/product-list-page/product-list-page.component';

export const PRODUCTS_ROUTES: Routes = [
  { path: '', component: ProductListPageComponent, canActivate: [authGuard] },
];
