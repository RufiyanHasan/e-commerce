import { Routes } from '@angular/router';
import { AuthPageComponent } from './pages/auth-page/auth-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { RegisterPageComponent } from './pages/register-page/register-page.component';
import { AdminLoginPageComponent } from './pages/admin-login-page/admin-login-page.component';

export const AUTH_ROUTES: Routes = [
  { path: '', component: AuthPageComponent },
  { path: 'login', component: LoginPageComponent },
  { path: 'register', component: RegisterPageComponent },
  { path: 'admin/login', component: AdminLoginPageComponent },
];
