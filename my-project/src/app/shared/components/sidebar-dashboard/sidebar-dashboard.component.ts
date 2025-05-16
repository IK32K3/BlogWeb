import { CommonModule } from '@angular/common';
import { Component, HostListener, ElementRef, signal, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, RouterLink, RouterLinkActive } from '@angular/router'; // Thêm RouterModule và RouterLinkActive

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
    { path: '/dashboard/overview', icon: 'fas fa-chart-pie', label: 'Overview', exact: true },
    { path: 'dashboard/posts', icon: 'fas fa-newspaper', label: 'Posts', badge: 12, exact: true },
    { path: '/media', icon: 'fas fa-image', label: 'Media Library', exact: true },
    { path: '/audience', icon: 'fas fa-users', label: 'Audience', exact: true },
    { isSettingsHeader: true, settingsLabel: 'Settings' },
    { path: '/profile', icon: 'fas fa-user-cog', label: 'Profile', exact: true },
    { path: '/settings', icon: 'fas fa-sliders-h', label: 'Settings', exact: true },
    { path: '/help', icon: 'fas fa-question-circle', label: 'Help Center', exact: true },
  ];

  // Dữ liệu người dùng (Lấy từ HTML của bạn)
  user = {
    name: 'Edogawa Conan',
    role: 'Admin Blogger',
    avatarUrl: 'https://phunuvietnam.mediacdn.vn/179072216278405120/2022/11/4/edogawa-conan--166754179290680712885.jpg'
  };

  constructor(private elementRef: ElementRef) {
    // Ban đầu, nếu là mobile view, đóng sidebar
    if (this.isMobileView()) {
      this.sidebarOpen.set(false);
    }
  }

  ngOnInit() {
    window.addEventListener('resize', this.onResize);
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.onResize);
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