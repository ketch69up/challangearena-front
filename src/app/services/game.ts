import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameService {
private apiUrl = 'https://web-production-d492c.up.railway.app/api';
  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = localStorage.getItem('token');

    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };
  }

  login(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, data);
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}, this.getHeaders());
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile`, this.getHeaders());
  }

  getChallenge(difficulty: string, excludeId?: number): Observable<any> {
    let url = `${this.apiUrl}/challenges/random?difficulty=${difficulty}`;

    if (excludeId) {
      url += `&exclude_id=${excludeId}`;
    }

    return this.http.get(url, this.getHeaders());
  }

  skipChallenge(): Observable<any> {
    return this.http.post(`${this.apiUrl}/challenges/skip`, {}, this.getHeaders());
  }

  submitProof(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/proofs`, data, this.getHeaders());
  }

  getLeaderboard(): Observable<any> {
    return this.http.get(`${this.apiUrl}/leaderboard`);
  }

  getCommunityChallenges(): Observable<any> {
    return this.http.get(`${this.apiUrl}/community-challenges`);
  }

  suggestCommunityChallenge(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/community-challenges`, data, this.getHeaders());
  }

  voteCommunityChallenge(id: number, vote: 'like' | 'dislike'): Observable<any> {
    return this.http.post(`${this.apiUrl}/community-challenges/${id}/vote`, {
      vote
    }, this.getHeaders());
  }
}