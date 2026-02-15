import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

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

  onSubmit() {
    // TODO: call admin auth service
    console.log('Admin login', { email: this.email, password: this.password });
  }
}
