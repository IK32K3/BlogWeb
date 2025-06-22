import { CommonModule } from '@angular/common';
import { Component, HostListener, ElementRef, signal, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, RouterLink, RouterLinkActive } from '@angular/router'; // Thêm RouterModule và RouterLinkActive
import { AuthService } from '../../../core/services/auth.service';
import { UsersService } from '../../../core/services/users.service';
import { User } from '../../model/user.model';
import { Subscription } from 'rxjs';

interface NavItem {
  path?: string;
  icon?: string;
  label?: string;
  exact?: boolean;
  badge?: number | string;
  isSettingsHeader?: boolean;
  settingsLabel?: string;
}

@Component({
  selector: 'app-sidebar-dashboard',
  imports: [CommonModule, FormsModule, RouterModule, RouterLink, RouterLinkActive], // Thêm RouterModule
  standalone: true,
  templateUrl: './sidebar-dashboard.component.html',
  styleUrls: ['./sidebar-dashboard.component.css'] // Sửa 'styleUrl' thành 'styleUrls' (mảng)
})
export class SidebarDashboardComponent implements OnInit, OnDestroy {
  // Sử dụng signal để quản lý trạng thái
  sidebarOpen = signal(true); // Mặc định mở trên desktop, đóng trên mobile ban đầu
  isMobileView = signal(window.innerWidth < 1024); // lg breakpoint của Tailwind

  @Output() sidebarToggled = new EventEmitter<boolean>(); // Để thông báo cho layout cha nếu cần

  // Dữ liệu cho các mục điều hướng (Lấy từ HTML của bạn)
  navItems: NavItem[] = [
    { path: '/dashboard/dashboard-main', icon: 'fas fa-chart-pie', label: 'Overview', exact: true },
    { path: '/dashboard/dashboard-post', icon: 'fas fa-newspaper', label: 'Posts', exact: true },
    { path: '/dashboard/dashboard-media', icon: 'fas fa-image', label: 'Media Library', exact: true },
    { isSettingsHeader: true, settingsLabel: 'Settings' },
    { path: '/dashboard/dashboard-setting', icon: 'fas fa-sliders-h', label: 'Settings', exact: true },
    { path: '/help', icon: 'fas fa-question-circle', label: 'Help Center', exact: true },
  ];

  // User data from AuthService
  currentUser: User | null = null;
  private userSubscription: Subscription | null = null;

  constructor(
    private elementRef: ElementRef,
    private authService: AuthService,
    private usersService: UsersService
  ) {
    // Ban đầu, nếu là mobile view, đóng sidebar
    if (this.isMobileView()) {
      this.sidebarOpen.set(false);
    }
  }

  ngOnInit() {
    window.addEventListener('resize', this.onResize);
    
    // Subscribe to current user changes
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
      }
    });
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.onResize);
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    // Không cần remove document:click listener vì HostListener tự quản lý
  }

  // Sử dụng arrow function để `this` luôn trỏ đúng vào component instance
  onResize = () => {
    const mobile = window.innerWidth < 1024;
    this.isMobileView.set(mobile);
    if (!mobile) {
      this.sidebarOpen.set(true); // Luôn mở trên desktop khi resize về desktop
    }
    // Nếu resize sang mobile, không tự động đóng nếu nó đang mở (người dùng có thể đã cố tình mở)
    // else if (this.sidebarOpen()) {
      // this.sidebarOpen.set(false); // Hoặc giữ nguyên trạng thái
    // }
  }

  toggleSidebar() {
    this.sidebarOpen.update(value => !value);
    this.sidebarToggled.emit(this.sidebarOpen());
  }

  // Đóng sidebar khi click vào một mục menu trên mobile
  closeSidebarOnMobileClick(): void {
    if (this.isMobileView() && this.sidebarOpen()) {
      this.toggleSidebar();
    }
  }

  // Optional: Đóng sidebar khi click ngoài (CHỈ TRÊN MOBILE)
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!this.isMobileView() || !this.sidebarOpen()) {
      return; // Chỉ hoạt động trên mobile và khi sidebar đang mở
    }

    const target = event.target as HTMLElement;
    const sidebarElement = this.elementRef.nativeElement.querySelector('aside');
    // Kiểm tra xem nút hamburger có phải là target không (giả sử nút hamburger có id hoặc class cụ thể)
    // Hoặc, nếu nút hamburger nằm ngoài component này, bạn cần một cách khác để xác định nó.
    // Ví dụ, nếu nút hamburger có class 'sidebar-toggle-button'
    const isToggleButton = target.closest('.sidebar-toggle-button');


    if (sidebarElement && !sidebarElement.contains(target) && !isToggleButton) {
      // console.log('Clicked outside sidebar on mobile, and not on toggle button.');
      this.sidebarOpen.set(false);
      this.sidebarToggled.emit(false);
    }
  }
}