import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TokenService } from './token.service';

export type UserRole = 'CUSTOMER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthResponse {
  token: string;
  user: User;
}

const USER_KEY = 'ecommerce_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = `${environment.apiUrl}/auth`;
  private readonly currentUserSignal = signal<User | null>(this.loadStoredUser());

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isLoggedIn = computed(() => this.currentUserSignal() !== null);
  readonly isAdmin = computed(() => this.currentUserSignal()?.role === 'ADMIN');

  constructor(
    private http: HttpClient,
    private router: Router,
    private token: TokenService
  ) {}

  // ── Customer login ─────────────────────────────────────────────────────────

  async loginCustomer(email: string, password: string): Promise<string | null> {
    try {
      const res = await firstValueFrom(
        this.http.post<AuthResponse>(`${this.api}/login`, { email, password })
      );
      if (res.user.role !== 'CUSTOMER') return 'No customer account found with this email.';
      this.setSession(res);
      return null;
    } catch (err: unknown) {
      return this.extractError(err, 'Invalid email or password.');
    }
  }

  // ── Admin login ────────────────────────────────────────────────────────────

  async loginAdmin(email: string, password: string): Promise<string | null> {
    try {
      const res = await firstValueFrom(
        this.http.post<AuthResponse>(`${this.api}/login`, { email, password })
      );
      if (res.user.role !== 'ADMIN') return 'No admin account found with this email.';
      this.setSession(res);
      return null;
    } catch (err: unknown) {
      return this.extractError(err, 'Invalid email or password.');
    }
  }

  // ── Register ──────────────────────────────────────────────────────────────

  async register(name: string, email: string, password: string): Promise<string | null> {
    try {
      const res = await firstValueFrom(
        this.http.post<AuthResponse>(`${this.api}/register`, { name, email, password })
      );
      this.setSession(res);
      return null;
    } catch (err: unknown) {
      return this.extractError(err, 'Registration failed. Please try again.');
    }
  }

  // ── Google SSO ────────────────────────────────────────────────────────────

  async loginWithGoogle(credential: string): Promise<string | null> {
    try {
      const res = await firstValueFrom(
        this.http.post<AuthResponse>(`${this.api}/google`, { credential })
      );
      this.setSession(res);
      return null;
    } catch (err: unknown) {
      return this.extractError(err, 'Google sign-in failed. Please try again.');
    }
  }

  // ── Logout ────────────────────────────────────────────────────────────────

  logout(): void {
    this.currentUserSignal.set(null);
    this.token.remove();
    localStorage.removeItem(USER_KEY);
    this.router.navigate(['/']);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private setSession(res: AuthResponse): void {
    this.token.set(res.token);
    this.currentUserSignal.set(res.user);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
  }

  private loadStoredUser(): User | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }

  private extractError(err: unknown, fallback: string): string {
    const e = err as { error?: { message?: string } };
    return e?.error?.message ?? fallback;
  }
}
