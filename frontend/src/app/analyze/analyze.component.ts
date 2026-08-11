import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ResumeService, AnalysisResult } from '../services/resume.service';

@Component({
  selector: 'app-analyze',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './analyze.component.html',
  styleUrl: './analyze.component.css',
})
export class AnalyzeComponent {
  jobDescription = '';
  selectedFile: File | null = null;
  loading = false;
  error = '';
  result: AnalysisResult | null = null;

  constructor(private resumeService: ResumeService) {}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.selectedFile = input.files[0];
    }
  }

  onSubmit() {
    if (!this.selectedFile || !this.jobDescription.trim()) {
      this.error = 'Please upload a PDF resume and paste a job description.';
      return;
    }
    this.error = '';
    this.loading = true;
    this.result = null;

    this.resumeService.analyze(this.selectedFile, this.jobDescription).subscribe({
      next: (res) => {
        this.result = res;
        this.loading = false;
      },
      error: () => {
        this.error = 'Something went wrong analyzing your resume. Please try again.';
        this.loading = false;
      },
    });
  }

  scoreClass(score: number): string {
    if (score >= 75) return 'score-good';
    if (score >= 50) return 'score-mid';
    return 'score-low';
  }
}