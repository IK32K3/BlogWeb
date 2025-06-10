import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface NavItem {
  path: string;
  label: string;
  icon?: string;
}

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, FormsModule, RouterModule],
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavBarComponent implements OnInit {
  dropdownOpen = false;
  menuOpen = false;
  isLargeScreen = false;
  
  readonly LARGE_SCREEN_BREAKPOINT = 1024;
  
  navItems: NavItem[] = [
    { path: '/category', label: 'Category', icon: 'fas fa-list' },
    { path: '/blog/write-post', label: 'Write', icon: 'fas fa-pen' }
  ];

  dropdownItems: NavItem[] = [
    { path: '/profile/profile-user', label: 'Profile' },
    { path: '/category', label: 'Category' },
    { path: '/blog/write-post', label: 'Write' },
    { path: '/blog/contact-us', label: 'Contact Us' },
    { path: '/settings', label: 'Settings' },
    { path: '#', label: 'About Us' },
    { path: '#', label: 'Help' },
    { path: '/home/introduce-page', label: 'Log out' }
  ];

  constructor() { }

  ngOnInit(): void {
    this.checkScreenSize();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.checkScreenSize();
  }

  checkScreenSize(): void {
    this.isLargeScreen = window.innerWidth >= this.LARGE_SCREEN_BREAKPOINT;
    if (this.isLargeScreen) {
      this.menuOpen = false;
    }
  }

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.dropdownOpen = !this.dropdownOpen;
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  @HostListener('document:click', ['$event'])
  handleOutsideClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const dropdownContainer = document.querySelector('.relative');
    const dropdownButton = target.closest('button');

    if (dropdownContainer && !dropdownContainer.contains(target) && !dropdownButton?.contains(target)) {
      this.dropdownOpen = false;
    }
  }
}
