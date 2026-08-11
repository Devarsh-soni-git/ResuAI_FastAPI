import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  fullName = '';
  email = '';
  password = '';
  loading = false;
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
    this.error = '';
    this.loading = true;
    this.auth.register(this.email, this.fullName, this.password).subscribe({
      next: () => {
        // auto-login right after successful registration
        this.auth.login(this.email, this.password).subscribe({
          next: () => this.router.navigate(['/analyze']),
          error: () => this.router.navigate(['/login']),
        });
      },
      error: (err) => {
        this.error = err?.error?.detail || 'Registration failed. Please try again.';
        this.loading = false;
      },
    });
  }
}
