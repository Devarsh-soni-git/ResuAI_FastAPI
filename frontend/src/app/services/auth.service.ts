import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
}

interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

const TOKEN_KEY = 'resuai_token';
const USER_KEY = 'resuai_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8000/auth';

  // simple signal so the navbar can react to login/logout instantly
  currentUser = signal<User | null>(this.loadStoredUser());

  constructor(private http: HttpClient) {}

  private loadStoredUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  register(email: string, full_name: string, password: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, { email, full_name, password });
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((res) => {
        localStorage.setItem(TOKEN_KEY, res.access_token);
        localStorage.setItem(USER_KEY, JSON.stringify(res.user));
        this.currentUser.set(res.user);
      })
    );
  }

  forgotPassword(email: string): Observable<{ message: string; reset_token: string }> {
    return this.http.post<{ message: string; reset_token: string }>(
      `${this.apiUrl}/forgot-password`,
      { email }
    );
  }

  resetPassword(token: string, new_password: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/reset-password`, {
      token,
      new_password,
    });
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUser.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
