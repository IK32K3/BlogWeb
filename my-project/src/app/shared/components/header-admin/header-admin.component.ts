import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from '../../model/user.model';
import { AuthService } from '../../../core/services/auth.service';
import { UsersService } from '../../../core/services/users.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header-admin',
  imports: [CommonModule, FormsModule],
  standalone: true,
  templateUrl: './header-admin.component.html',
  styleUrl: './header-admin.component.css'
})
export class HeaderAdminComponent implements OnInit, OnDestroy {
  dropdownOpen = false;
  currentUser: User | null = null;
  private userSubscription: Subscription | null = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private usersService: UsersService
  ) {}

  ngOnInit() {
    // Subscribe to the current user observable
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    // If no user is loaded yet, try to load the profile
    if (!this.currentUser) {
      this.loadUserProfile();
    }
  }

  loadUserProfile() {
    this.usersService.getProfile().subscribe({
      next: (response) => {
        if (response.success && response.data.user) {
          this.currentUser = response.data.user;
          this.authService.updateCurrentUser(response.data.user);
        }
      },
      error: (error) => {
        console.error('Error loading user profile:', error);
        // If there's an error loading the profile, redirect to login
        this.router.navigate(['/auth/login']);
      }
    });
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  toggleMobileMenu() {
    console.log("Mobile menu toggled");
  }

  navigateHome() {
    this.dropdownOpen = false;
    this.router.navigate(['/home/home-page']);
  }

  logout() {
    this.dropdownOpen = false;
    this.authService.logout();
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }
}
