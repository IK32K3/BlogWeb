import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router'; // Thêm cái này để dùng routerLink
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], // ✅ Thêm RouterModule để dùng routerLink
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'] // ✅ Sửa thành styleUrls
})
export class NavBarComponent implements OnInit {
  dropdownOpen = false;
  menuOpen = false;
  isLargeScreen = false;

  constructor() { }

  ngOnInit() {
    this.checkScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.checkScreenSize();
  }

  checkScreenSize() {
    const largeScreenBreakpoint = 1024;
    this.isLargeScreen = window.innerWidth >= largeScreenBreakpoint;

    if (this.isLargeScreen) {
      this.menuOpen = false;
    }
  }

  toggleDropdown(event: Event) {
    // Prevent the click from immediately closing the dropdown via HostListener
    event.stopPropagation();
    this.dropdownOpen = !this.dropdownOpen;
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
    // Remove DOM manipulation here
  }

  @HostListener('document:click', ['$event'])
  handleOutsideClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    // Check if the click was outside the dropdown container and the dropdown toggle button
    const dropdownContainer = document.querySelector('.relative'); // Assuming the relative div is the container
    const dropdownButton = target.closest('button'); // Get the actual button element

    // If the click is outside the container or the button, close the dropdown
    if (dropdownContainer && !dropdownContainer.contains(target) && !dropdownButton?.contains(target)) {
       this.dropdownOpen = false;
    }

    // Assuming you might have a separate mobile menu button, adjust the logic if needed
    // For now, the HostListener only focuses on the dropdown.
    // Mobile menu closing on outside click might need different handling or a separate HostListener if it's complex.
  }

  // Add ViewChild to get references to the dropdown elements if more precise control is needed
  // @ViewChild('dropdownButton') dropdownButton!: ElementRef;
  // @ViewChild('dropdownMenu') dropdownMenu!: ElementRef;
}
