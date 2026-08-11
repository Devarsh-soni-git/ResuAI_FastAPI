import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css',
})
export class ForgotPasswordComponent {
  email = '';
  loading = false;
  error = '';
  message = '';

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
    this.error = '';
    this.loading = true;
    this.auth.forgotPassword(this.email).subscribe({
      next: (res) => {
        this.loading = false;
        // Minimal build has no email server — carry the token straight to the reset page.
        this.router.navigate(['/reset-password'], { queryParams: { token: res.reset_token } });
      },
      error: (err) => {
        this.error = err?.error?.detail || 'Could not find an account with that email.';
        this.loading = false;
      },
    });
  }
}
