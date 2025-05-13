import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header-dashboard',
  imports: [CommonModule,FormsModule],
  standalone: true,
  templateUrl: './header-dashboard.component.html',
  styleUrl: './header-dashboard.component.css'
})
export class HeaderDashboardComponent {
dropdownOpen = false;

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  toggleMobileMenu() {
    // Xử lý menu mobile nếu có
    console.log("Mobile menu toggled");
  }
}

