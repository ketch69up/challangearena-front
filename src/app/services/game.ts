import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private apiUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  login(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, data);
  }

  getProfile(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile/${userId}`);
  }

  getChallenge(difficulty: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/challenge/${difficulty}`);
  }

  skipChallenge(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/skip/${userId}`);
  }

  completeChallenge(challengeId: number, userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/complete/${challengeId}/${userId}`);
  }

  getLeaderboard(): Observable<any> {
    return this.http.get(`${this.apiUrl}/leaderboard`);
  }
}