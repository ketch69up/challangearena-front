import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameService } from './services/game';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  isLoggedIn = false;
  authMode: 'login' | 'register' = 'login';

  loginData = {
    email: '',
    password: ''
  };

  registerData = {
    name: '',
    email: '',
    password: '',
    avatar: '🧑‍🚀',
    avatar_color: '#38bdf8'
  };

  avatars = ['🧑‍🚀', '🦸', '🧙', '🥷', '🐉', ];
  colors = ['#38bdf8', '#a855f7', '#22c55e', '#facc15', '#ef4444'];

  activeSection = 'home';
  difficulty = 'easy';
  currentChallenge: any = null;
  leaderboard: any[] = [];
  player: any = null;
  message = '';

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    const savedPlayer = localStorage.getItem('player');

    if (savedPlayer) {
      this.player = JSON.parse(savedPlayer);
      this.isLoggedIn = true;
      this.loadProfile();
      this.loadLeaderboard();
    }
  }

  setAuthMode(mode: 'login' | 'register') {
    this.authMode = mode;
    this.message = '';
  }

  login() {
    this.gameService.login(this.loginData).subscribe({
      next: (data: any) => {
        this.player = data.user;
        this.isLoggedIn = true;
        localStorage.setItem('player', JSON.stringify(data.user));
        this.loadProfile();
        this.loadLeaderboard();
        this.message = '';
      },
      error: (err: any) => {
        this.message = err.error?.message || 'Login failed.';
      }
    });
  }

  register() {
    this.gameService.register(this.registerData).subscribe({
      next: (data: any) => {
        this.player = data.user;
        this.isLoggedIn = true;
        localStorage.setItem('player', JSON.stringify(data.user));
        this.loadProfile();
        this.loadLeaderboard();
        this.message = '';
      },
      error: (err: any) => {
        this.message = err.error?.message || 'Register failed.';
      }
    });
  }

  logout() {
    localStorage.removeItem('player');
    this.player = null;
    this.isLoggedIn = false;
    this.activeSection = 'home';
    this.currentChallenge = null;
  }

  setSection(section: string) {
    this.activeSection = section;
    this.message = '';
  }

  loadProfile() {
    if (!this.player) return;

    this.gameService.getProfile(this.player.id).subscribe({
      next: (data: any) => {
        this.player = data;
        localStorage.setItem('player', JSON.stringify(data));
      },
      error: () => {
        this.message = 'Could not load profile.';
      }
    });
  }

  getChallenge() {
    this.activeSection = 'challenge';

    this.gameService.getChallenge(this.difficulty).subscribe({
      next: (data: any) => {
        this.currentChallenge = data;
        this.message = '';
      },
      error: () => {
        this.message = 'Could not load challenge.';
      }
    });
  }

  skipChallenge() {
    if (!this.player) return;

    this.gameService.skipChallenge(this.player.id).subscribe({
      next: (data: any) => {
        this.message = data.message + ' | Energy: ' + data.energy;
        this.currentChallenge = null;
        this.loadProfile();
      },
      error: (err: any) => {
        this.message = err.error?.message || 'Skip failed.';
      }
    });
  }

  completeChallenge() {
    if (!this.currentChallenge || !this.player) return;

    this.gameService.completeChallenge(this.currentChallenge.id, this.player.id).subscribe({
      next: (data: any) => {
        this.message = `${data.message} | XP: ${data.xp} | Level: ${data.level}`;
        this.currentChallenge = null;
        this.loadProfile();
        this.loadLeaderboard();
      },
      error: () => {
        this.message = 'Could not complete challenge.';
      }
    });
  }

  loadLeaderboard() {
    this.gameService.getLeaderboard().subscribe({
      next: (data: any) => {
        this.leaderboard = data;
      },
      error: () => {
        this.message = 'Could not load leaderboard.';
      }
    });
  }
}