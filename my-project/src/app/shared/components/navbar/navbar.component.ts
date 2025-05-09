import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router'; // Thêm cái này để dùng routerLink
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], // ✅ Thêm RouterModule để dùng routerLink
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'] // ✅ Sửa thành styleUrls
})
export class NavBarComponent {
  dropdownOpen = false;
  menuOpen = false;

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
    const menu = document.getElementById('menu');
    if (menu) {
      menu.classList.toggle('hidden');
    }
  }

  @HostListener('document:click', ['$event'])
  handleOutsideClick(event: MouseEvent) {
    const target = event.target as HTMLElement;

    const dropdownButton = target.closest('button');
    const isDropdownButton = dropdownButton?.classList.contains('dropdown-toggle');

    if (!isDropdownButton && !target.closest('.dropdown-menu') && !target.closest('app-navbar')) {
      this.dropdownOpen = false;
    }
  }
}
