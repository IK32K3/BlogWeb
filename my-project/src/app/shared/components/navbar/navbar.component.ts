import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, inject, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { UsersService } from '../../../core/services/users.service';
import { User } from '../../model/user.model';
import { BlogPostService } from '../../../core/services/blog-post.service';
import { Subject } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { Post } from '../../model/post.model';

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
  @Input() posts: Post[] = [];
  
  readonly LARGE_SCREEN_BREAKPOINT = 1024;
  
  navItems: NavItem[] = [
    { path: '/category', label: 'Category', icon: 'fas fa-list' },
    { path: '/blog/write-post', label: 'Write', icon: 'fas fa-pen' }
  ];

  dropdownItems: NavItem[] = [];

  currentUser: User | null = null;

  authService = inject(AuthService);
  usersService = inject(UsersService);
  private blogPostService = inject(BlogPostService);

  searchBoxOpen = false;
  searchKeyword = '';
  searchResults: any[] = [];
  autocompleteResults: any[] = [];
  showAutocomplete = false;
  searchInput$ = new Subject<string>();

  ngOnInit(): void {
    this.checkScreenSize();
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.updateDropdownItems();
      if (user && (!user.avatar || user.avatar === 'assets/images/default-avatar.jpg')) {
        this.loadUserProfile();
      }
    });
    // Autocomplete logic
    this.searchInput$
      .pipe(
        debounceTime(300),
        switchMap(term => this.blogPostService.getAll({ search: term, autocomplete: true }))
      )
      .subscribe({
        next: (res) => {
          this.autocompleteResults = res.data?.posts || [];
          this.showAutocomplete = !!this.searchKeyword && this.autocompleteResults.length > 0;
        },
        error: () => {
          this.autocompleteResults = [];
          this.showAutocomplete = false;
        }
      });
  }

  updateDropdownItems(): void {
    const baseItems: NavItem[] = [
      { path: '/profile/profile-user', label: 'Profile', icon: 'fas fa-user' },
      { path: '/category', label: 'Category', icon: 'fas fa-list' },
      { path: '/blog/write-post', label: 'Write', icon: 'fas fa-pen' },
      { path: '/blog/contact-us', label: 'Contact Us', icon: 'fas fa-envelope' },
      { path: '/dashboard/dashboard-setting', label: 'Settings', icon: 'fas fa-cog' },
      { path: '/home/about-page', label: 'About Us', icon: 'fas fa-info-circle' },
    ];

    if (this.currentUser) {
      if (this.currentUser.role_id === 1) { // Admin
        baseItems.push({ path: '/admin/dashboard', label: 'Dashboard', icon: 'fas fa-tachometer-alt' });
      } else if (this.currentUser.role_id === 2) { // Blogger
        baseItems.push({ path: '/dashboard/dashboard-main', label: 'Dashboard', icon: 'fas fa-tachometer-alt' });
      }
    }

    baseItems.push({ path: 'logout', label: 'Log out', icon: 'fas fa-sign-out-alt' });

    this.dropdownItems = baseItems;
  }

  loadUserProfile(): void {
    if (!this.authService.isAuthenticated()) {
      return;
    }

    this.usersService.getProfile().subscribe({
      next: (response) => {
        if (response.success && response.data && response.data.user) {
          const userData = response.data.user;
          // Set avatar from userUploads if available
          if (userData.userUploads && userData.userUploads.length > 0) {
            const avatarMedia = userData.userUploads.find(media => media.file?.type === 'image');
            if (avatarMedia) {
              userData.avatar = avatarMedia.file.url;
            }
          }
          this.currentUser = userData;
          this.authService.updateCurrentUser(userData);
        }
      },
      error: (error) => {
        console.error('Error loading user profile:', error);
      }
    });
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

  logout(): void {
    this.authService.logout();
  }

  get avatarUrl(): string {
    if (this.currentUser?.avatar) {
      // Nếu avatar là URL đầy đủ (bắt đầu bằng http/https), dùng trực tiếp
      if (this.currentUser.avatar.startsWith('http')) {
        return this.currentUser.avatar;
      }
      // Nếu avatar là đường dẫn tương đối, thêm base URL
      if (this.currentUser.avatar.startsWith('/')) {
        return this.currentUser.avatar;
      }
      // Nếu avatar chỉ là tên file, trả về đường dẫn tới thư mục uploads
      return `/uploads/${this.currentUser.avatar}`;
    }
    // Nếu không có avatar, trả về ảnh mặc định
    return 'assets/images/default-avatar.jpg';
  }
  onImgError(event: Event) {
    (event.target as HTMLImageElement).src = 'assets/images/default-avatar.jpg';
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

  openSearchBox() {
    this.searchBoxOpen = true;
    this.searchKeyword = '';
    this.searchResults = [];
    this.autocompleteResults = [];
    this.showAutocomplete = false;
  }

  closeSearchBox() {
    this.searchBoxOpen = false;
    this.searchKeyword = '';
    this.searchResults = [];
    this.autocompleteResults = [];
    this.showAutocomplete = false;
  }

  onSearchInput(term: string) {
    this.searchKeyword = term;
    if (!term || !term.trim() || term.trim().length < 1) {
      this.showAutocomplete = false;
      this.autocompleteResults = [];
      return;
    }
    this.searchInput$.next(term);
  }

  selectAutocomplete(post: any) {
    this.searchKeyword = post.title;
    this.showAutocomplete = false;
    this.searchResults = [post];
  }

  onSearch() {
    if (!this.searchKeyword.trim()) {
      this.searchResults = [];
      return;
    }
    this.blogPostService.searchPosts(this.searchKeyword).subscribe({
      next: (res) => {
        this.searchResults = res.data?.posts || res.data || [];
        this.showAutocomplete = false;
      },
      error: () => {
        this.searchResults = [];
        this.showAutocomplete = false;
      }
    });
  }
}

