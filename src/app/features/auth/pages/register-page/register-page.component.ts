import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.scss',
})
export class RegisterPageComponent {
  name = '';
  email = '';
  password = '';

  onSubmit() {
    // TODO: call auth service
    console.log('User register', { name: this.name, email: this.email, password: this.password });
  }
}
