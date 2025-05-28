import { Component, OnInit } from '@angular/core';
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
export class HeaderComponent implements OnInit {
  isLoggedIn = false;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isAuthenticated(); // hoặc dùng Observable
  }
}
