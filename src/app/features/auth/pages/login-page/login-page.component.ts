import { Component, OnInit, NgZone } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { environment } from '../../../../../environments/environment';

declare const google: {
  accounts: {
    id: {
      initialize: (config: object) => void;
      renderButton: (el: HTMLElement, options: object) => void;
    };
  };
};

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
})
export class LoginPageComponent implements OnInit {
  email = '';
  password = '';
  error: string | null = null;
  loading = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.initGoogleSignIn();
  }

  private initGoogleSignIn(): void {
    const wait = setInterval(() => {
      if (typeof google !== 'undefined') {
        clearInterval(wait);
        google.accounts.id.initialize({
          client_id: environment.googleClientId,
          callback: (response: { credential: string }) => {
            this.ngZone.run(() => this.handleGoogleCredential(response.credential));
          },
        });
        const btn = document.getElementById('google-signin-btn');
        if (btn) {
          google.accounts.id.renderButton(btn, {
            theme: 'outline', size: 'large', width: 352, text: 'signin_with',
          });
        }
      }
    }, 100);
  }

  async handleGoogleCredential(credential: string): Promise<void> {
    this.error = null;
    this.loading = true;
    const err = await this.auth.loginWithGoogle(credential);
    this.loading = false;
    if (err) { this.error = err; return; }
    this.router.navigate(['/products']);
  }

  async onSubmit(): Promise<void> {
    this.error = null;
    this.loading = true;
    const err = await this.auth.loginCustomer(this.email, this.password);
    this.loading = false;
    if (err) { this.error = err; return; }
    this.router.navigate(['/products']);
  }
}
