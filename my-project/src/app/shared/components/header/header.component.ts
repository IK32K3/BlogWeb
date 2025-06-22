import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { NavBarComponent } from '../navbar/navbar.component';
import { NavbarIntroduceComponent } from '../navbar-introduce/navbar-introduce.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SharedModule } from 'app/shared/shared.module';

@Component({
  selector: 'app-header',
  imports: [ CommonModule, RouterModule, FormsModule, NavBarComponent, NavbarIntroduceComponent],
  standalone: true,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  private authSubscription?: Subscription;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authSubscription = this.authService.isLoggedIn$.subscribe(
      (status) => {
        this.isLoggedIn = status;
      }
    );
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
  }
}
