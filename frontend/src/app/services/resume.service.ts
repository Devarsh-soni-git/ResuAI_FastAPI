import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AnalysisResult {
  id: string;
  ats_score: number;
  matched_skills: string[];
  missing_skills: string[];
  suggestions: string[];
  created_at: string;
}

export interface HistoryItem {
  id: string;
  resume_filename: string;
  ats_score: number;
  created_at: string;
}

export interface Stats {
  total_analyses: number;
  average_score: number;
}

@Injectable({ providedIn: 'root' })
export class ResumeService {
  private apiUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  analyze(resume: File, jobDescription: string): Observable<AnalysisResult> {
    const formData = new FormData();
    formData.append('resume', resume);
    formData.append('job_description', jobDescription);
    return this.http.post<AnalysisResult>(`${this.apiUrl}/analyze`, formData);
  }

  getHistory(): Observable<HistoryItem[]> {
    return this.http.get<HistoryItem[]>(`${this.apiUrl}/history`);
  }

  getStats(): Observable<Stats> {
    return this.http.get<Stats>(`${this.apiUrl}/stats`);
  }
}
