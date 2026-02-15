import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-admin-login-page',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './admin-login-page.component.html',
  styleUrl: './admin-login-page.component.scss',
})
export class AdminLoginPageComponent {
  email = '';
  password = '';
  error: string | null = null;
  loading = false;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    this.error = null;
    this.loading = true;
    const err = this.auth.loginAdmin(this.email, this.password);
    this.loading = false;
    if (err) {
      this.error = err;
      return;
    }
    this.router.navigate(['/']);
  }
}
