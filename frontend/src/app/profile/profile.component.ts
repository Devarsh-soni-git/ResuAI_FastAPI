import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResumeService, HistoryItem, Stats } from '../services/resume.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  history: HistoryItem[] = [];
  stats: Stats | null = null;
  loading = true;

  constructor(private resumeService: ResumeService, public auth: AuthService) {}

  ngOnInit() {
    this.resumeService.getStats().subscribe({
      next: (s) => (this.stats = s),
      error: () => {},
    });
    this.resumeService.getHistory().subscribe({
      next: (items) => {
        this.history = items;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }
}
