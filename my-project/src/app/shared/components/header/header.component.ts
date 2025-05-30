import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { NavBarComponent } from '../navbar/navbar.component';
import { NavbarIntroduceComponent } from '../navbar-introduce/navbar-introduce.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NavBarComponent, NavbarIntroduceComponent, CommonModule, RouterModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  private storageListener = () => this.checkLoginStatus();

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.checkLoginStatus();
    window.addEventListener('storage', this.storageListener);
  }

  ngOnDestroy(): void {
    window.removeEventListener('storage', this.storageListener);
  }

  checkLoginStatus() {
    this.isLoggedIn = this.authService.isLoggedIn?.() || false;
  }
}
