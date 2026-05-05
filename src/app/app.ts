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

  avatars = ['🧑‍🚀', '🦸', '🧙', '🥷', '🐉'];
  colors = ['#38bdf8', '#a855f7', '#22c55e', '#facc15', '#ef4444'];

  activeSection = 'home';
  difficulty = 'easy';
  currentChallenge: any = null;
  leaderboard: any[] = [];
  communityChallenges: any[] = [];
  player: any = null;
  message = '';
  rewardMessage = '';
  proofText = '';

  communityForm = {
    title: '',
    description: '',
    difficulty: 'easy'
  };
  adminStats: any = null;
adminUsers: any[] = [];
adminChallenges: any[] = [];
adminCommunityChallenges: any[] = [];

adminChallengeForm = {
  title: '',
  description: '',
  difficulty: 'easy',
  xp_reward: 10
};
isAdmin(): boolean {
  return this.player?.is_admin === true || this.player?.is_admin === 1;
}

loadAdminPanel() {
  if (!this.isAdmin()) {
    this.message = 'Admin access required.';
    return;
  }

  this.gameService.getAdminDashboard().subscribe({
    next: (data: any) => {
      this.adminStats = data;
    }
  });

  this.loadAdminUsers();
  this.loadAdminChallenges();
  this.loadAdminCommunityChallenges();
}

loadAdminUsers() {
  this.gameService.getAdminUsers().subscribe({
    next: (data: any) => {
      this.adminUsers = data;
    },
    error: (err: any) => {
      this.message = err.error?.message || 'Could not load admin users.';
    }
  });
}

loadAdminChallenges() {
  this.gameService.getAdminChallenges().subscribe({
    next: (data: any) => {
      this.adminChallenges = data;
    },
    error: (err: any) => {
      this.message = err.error?.message || 'Could not load admin challenges.';
    }
  });
}

loadAdminCommunityChallenges() {
  this.gameService.getAdminCommunityChallenges().subscribe({
    next: (data: any) => {
      this.adminCommunityChallenges = data;
    },
    error: (err: any) => {
      this.message = err.error?.message || 'Could not load community challenges.';
    }
  });
}

createAdminChallenge() {
  this.gameService.createAdminChallenge(this.adminChallengeForm).subscribe({
    next: (data: any) => {
      this.message = data.message;

      this.adminChallengeForm = {
        title: '',
        description: '',
        difficulty: 'easy',
        xp_reward: 10
      };

      this.loadAdminChallenges();
    },
    error: (err: any) => {
      this.message = err.error?.message || 'Could not create challenge.';
    }
  });
}

deleteAdminChallenge(id: number) {
  if (!confirm('Delete this official challenge?')) return;

  this.gameService.deleteAdminChallenge(id).subscribe({
    next: (data: any) => {
      this.message = data.message;
      this.loadAdminChallenges();
    },
    error: (err: any) => {
      this.message = err.error?.message || 'Could not delete challenge.';
    }
  });
}

approveCommunityAsAdmin(id: number) {
  this.gameService.approveAdminCommunityChallenge(id).subscribe({
    next: (data: any) => {
      this.message = data.message;
      this.loadAdminCommunityChallenges();
      this.loadCommunityChallenges();
      this.loadAdminChallenges();
    },
    error: (err: any) => {
      this.message = err.error?.message || 'Could not approve challenge.';
    }
  });
}

deleteCommunityAsAdmin(id: number) {
  if (!confirm('Delete this player challenge?')) return;

  this.gameService.deleteAdminCommunityChallenge(id).subscribe({
    next: (data: any) => {
      this.message = data.message;
      this.loadAdminCommunityChallenges();
      this.loadCommunityChallenges();
    },
    error: (err: any) => {
      this.message = err.error?.message || 'Could not delete player challenge.';
    }
  });
}

deleteUserAsAdmin(id: number) {
  if (!confirm('Delete this user?')) return;

  this.gameService.deleteAdminUser(id).subscribe({
    next: (data: any) => {
      this.message = data.message;
      this.loadAdminUsers();
      this.loadLeaderboard();
    },
    error: (err: any) => {
      this.message = err.error?.message || 'Could not delete user.';
    }
  });
}

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    const savedPlayer = this.getSavedPlayer();

    if (savedPlayer) {
      this.player = savedPlayer;
      this.isLoggedIn = true;
      this.loadProfile();
      this.loadLeaderboard();
      this.loadCommunityChallenges();
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

      this.savePlayer(data.user);
      this.saveToken(data.token);

      this.loadProfile();
      this.loadLeaderboard();
      this.loadCommunityChallenges();

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

      this.savePlayer(data.user);
      this.saveToken(data.token);

      this.loadProfile();
      this.loadLeaderboard();
      this.loadCommunityChallenges();

      this.message = '';
    },
    error: (err: any) => {
  console.error('Login error:', err);

  if (err.error?.errors) {
    const firstErrorKey = Object.keys(err.error.errors)[0];
    this.message = err.error.errors[firstErrorKey][0];
  } else {
    this.message = err.error?.message || err.message || 'Login failed.';
  }
}
  });
}

  logout() {
  this.gameService.logout().subscribe({
    next: () => {},
    error: () => {}
  });

  this.clearSavedPlayer();
  this.clearToken();

  this.player = null;
  this.isLoggedIn = false;
  this.activeSection = 'home';
  this.currentChallenge = null;
  this.proofText = '';
  this.message = '';
}
  setSection(section: string) {
    this.activeSection = section;
    this.message = '';
    if (section === 'admin') {
  this.loadAdminPanel();
}

    if (section === 'leaderboard') {
      this.loadLeaderboard();
    }

    if (section === 'community') {
      this.loadCommunityChallenges();
    }
  }

  loadProfile() {
  if (!this.getToken()) return;

  this.gameService.getProfile().subscribe({
    next: (data: any) => {
      this.player = data;
      this.savePlayer(data);
    },
    error: () => {
      this.message = 'Could not load profile.';
    }
  });
}

  getChallenge(excludeId?: number) {
    this.activeSection = 'challenge';
    this.proofText = '';

    this.gameService.getChallenge(this.difficulty, excludeId).subscribe({
      next: (data: any) => {
        this.currentChallenge = data;
        this.message = '';
      },
      error: (err: any) => {
        this.currentChallenge = null;
        this.message = err.error?.message || 'Could not load challenge.';
      }
    });
  }

  skipChallenge() {
  if (!this.player || !this.currentChallenge) return;

  const skippedChallengeId = this.currentChallenge.id;

  this.gameService.skipChallenge().subscribe({
    next: (data: any) => {
      this.message = data.message + ' | Energy: ' + data.energy;
      this.proofText = '';

      this.loadProfile();
      this.getChallenge(skippedChallengeId);
    },
    error: (err: any) => {
      this.message = err.error?.message || 'Skip failed.';
    }
  });
}

  submitProof() {
  if (!this.currentChallenge || !this.player) return;

  if (this.proofText.trim().length < 5) {
    this.message = 'Write at least 5 characters as proof.';
    return;
  }

  const proofData = {
    challenge_id: this.currentChallenge.id,
    proof_text: this.proofText
  };

  this.gameService.submitProof(proofData).subscribe({
    next: (data: any) => {
      this.message = data.message;
      this.rewardMessage = `+${data.reward} XP`;

      const completedChallengeId = this.currentChallenge.id;

      this.currentChallenge = null;
      this.proofText = '';

      this.loadProfile();
      this.loadLeaderboard();
      this.getChallenge(completedChallengeId);

      setTimeout(() => {
        this.rewardMessage = '';
      }, 2000);
    },
    error: (err: any) => {
      this.message = err.error?.message || 'Could not submit proof.';
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

  loadCommunityChallenges() {
    this.gameService.getCommunityChallenges().subscribe({
      next: (data: any) => {
        this.communityChallenges = data;
      },
      error: () => {
        this.message = 'Could not load community challenges.';
      }
    });
  }

  suggestChallenge() {
  if (!this.player) return;

  if (
    this.communityForm.title.trim() === '' ||
    this.communityForm.description.trim().length < 10
  ) {
    this.message = 'Add a title and a description with at least 10 characters.';
    return;
  }

  const data = {
    title: this.communityForm.title,
    description: this.communityForm.description,
    difficulty: this.communityForm.difficulty
  };

  this.gameService.suggestCommunityChallenge(data).subscribe({
    next: () => {
      this.message = 'Community challenge submitted!';

      this.communityForm = {
        title: '',
        description: '',
        difficulty: 'easy'
      };

      this.loadCommunityChallenges();
    },
    error: (err: any) => {
      this.message = err.error?.message || 'Could not submit community challenge.';
    }
  });
}

  voteCommunityChallenge(id: number, vote: 'like' | 'dislike') {
  if (!this.player) {
    this.message = 'You must login first.';
    return;
  }

  this.gameService.voteCommunityChallenge(id, vote).subscribe({
    next: (data: any) => {
      this.message = data.message;
      this.loadCommunityChallenges();
    },
    error: (err: any) => {
      this.message = err.error?.message || err.message || 'Vote failed.';
      console.error('Vote error:', err);
    }
  });
}

  getXpProgress(): number {
    if (!this.player) return 0;
    return this.player.xp % 100;
  }

  getXpToNextLevel(): number {
    if (!this.player) return 100;

    const left = 100 - (this.player.xp % 100);
    return left === 100 ? 100 : left;
  }

  private getSavedPlayer(): any {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }

    const savedPlayer = window.localStorage.getItem('player');

    try {
      return savedPlayer ? JSON.parse(savedPlayer) : null;
    } catch {
      return null;
    }
  }

  private savePlayer(player: any): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('player', JSON.stringify(player));
    }
  }
  private saveToken(token: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem('token', token);
  }
}

private getToken(): string | null {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }

  return window.localStorage.getItem('token');
}

private clearToken(): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem('token');
  }
}

  private clearSavedPlayer(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem('player');
    }
  }
}