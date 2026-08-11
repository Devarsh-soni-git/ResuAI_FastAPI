import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css',
})
export class ResetPasswordComponent implements OnInit {
  token = '';
  newPassword = '';
  loading = false;
  error = '';
  success = '';

  constructor(
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      if (params['token']) this.token = params['token'];
    });
  }

  onSubmit() {
    this.error = '';
    this.success = '';
    this.loading = true;
    this.auth.resetPassword(this.token, this.newPassword).subscribe({
      next: () => {
        this.success = 'Password updated. Redirecting to login...';
        this.loading = false;
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        this.error = err?.error?.detail || 'Reset failed. The token may have expired.';
        this.loading = false;
      },
    });
  }
}
