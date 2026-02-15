import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';

export type UserRole = 'customer' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  /** In a real app this would be a hash; for dummy usage we store plain. */
  password: string;
}

const STORAGE_KEY = 'ecommerce_user';

/** Dummy users for real-life-style login. In production, these come from an API. */
const DUMMY_USERS: User[] = [
  {
    id: '1',
    email: 'user@example.com',
    name: 'John Doe',
    role: 'customer',
    password: 'password123',
  },
  {
    id: '2',
    email: 'jane@example.com',
    name: 'Jane Doe',
    role: 'customer',
    password: 'password123',
  },
  {
    id: 'admin-1',
    email: 'admin@store.com',
    name: 'Store Admin',
    role: 'admin',
    password: 'admin123',
  },
];

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly currentUserSignal = signal<User | null>(this.loadStoredUser());

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isLoggedIn = computed(() => this.currentUserSignal() !== null);
  readonly isAdmin = computed(() => this.currentUserSignal()?.role === 'admin');

  /** In-memory list; new registrations are added here (and lost on refresh). */
  private users = [...DUMMY_USERS];

  constructor(private router: Router) {}

  private loadStoredUser(): User | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const stored = JSON.parse(raw) as User;
      // Re-validate against known users (id match); keeps session for dummy users
      const known = DUMMY_USERS.find((u) => u.id === stored.id) ?? this.users.find((u) => u.id === stored.id);
      if (known && known.email === stored.email) return { ...stored, password: known.password };
      return null;
    } catch {
      return null;
    }
  }

  private persistUser(user: User | null): void {
    if (typeof window === 'undefined') return;
    if (!user) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    const { password: _, ...safe } = user;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(safe));
  }

  /** Customer login. Returns error message or null on success. */
  loginCustomer(email: string, password: string): string | null {
    const user = this.users.find(
      (u) => u.role === 'customer' && u.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (!user) return 'No account found with this email.';
    if (user.password !== password) return 'Incorrect password.';
    this.currentUserSignal.set(user);
    this.persistUser(user);
    return null;
  }

  /** Admin login. Returns error message or null on success. */
  loginAdmin(email: string, password: string): string | null {
    const user = this.users.find(
      (u) => u.role === 'admin' && u.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (!user) return 'No admin account found with this email.';
    if (user.password !== password) return 'Incorrect password.';
    this.currentUserSignal.set(user);
    this.persistUser(user);
    return null;
  }

  /** Register a new customer. Returns error message or null on success. */
  register(name: string, email: string, password: string): string | null {
    const trimmedEmail = email.trim().toLowerCase();
    if (!name.trim()) return 'Name is required.';
    if (!trimmedEmail) return 'Email is required.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    const exists = this.users.some((u) => u.email.toLowerCase() === trimmedEmail);
    if (exists) return 'An account with this email already exists.';
    const user: User = {
      id: `reg-${Date.now()}`,
      email: trimmedEmail,
      name: name.trim(),
      role: 'customer',
      password,
    };
    this.users.push(user);
    this.currentUserSignal.set(user);
    this.persistUser(user);
    return null;
  }

  logout(): void {
    this.currentUserSignal.set(null);
    this.persistUser(null);
    this.router.navigate(['/']);
  }
}
