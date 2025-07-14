import { Component, OnInit, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet, Router } from '@angular/router';
import { HeaderDashboardComponent } from '../../shared/components/header-dashboard/header-dashboard.component';
import { SidebarDashboardComponent } from '../../shared/components/sidebar-dashboard/sidebar-dashboard.component';
import { CommonModule } from '@angular/common';
import { UsersService } from '../../core/services/users.service';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../shared/model/user.model';
import Swal from 'sweetalert2';
import { MediaComponent } from '../media/media.component';
import { forkJoin, Observable, of, Subject } from 'rxjs';
import { map, catchError, debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { LanguagesService } from '../../core/services/languages.service';
import { CreateTranslationDto, USER_API } from '../../core/constants/api-endpoints';

@Component({
  selector: 'app-setting',
  imports: [CommonModule,FormsModule,RouterOutlet,HeaderDashboardComponent,SidebarDashboardComponent, MediaComponent],
  templateUrl: './setting.component.html',
  styleUrl: './setting.component.css'
})
export class SettingComponent implements OnInit {
  activeTab: 'appearance' | 'account' | 'advanced' | 'security' = 'appearance';
  avatarPreviewUrl: string | null = null;
  showMediaModal: boolean = false;
  selectedAvatarName: string = '';
  searchTerm: string = '';
  userSearchResults: User[] = [];
  isSearching: boolean = false;
  blockedUsernames: string[] = [];
  private searchSubject = new Subject<string>();

  securityPasswordError: string = '';

  appearance = {
    theme: 'light',
    darkMode: false,
    logo: null as File | null,
    favicon: null as File | null,
    layout: '1col',
    language: 'en'
  };

  showLanguageDropdown = false;
  
  languages = [
    { code: 'en', name: 'English', flag: 'us' },
    { code: 'vi', name: 'Tiếng Việt', flag: 'vn' },
    { code: 'fr', name: 'Français', flag: 'fr' },
    { code: 'de', name: 'Deutsch', flag: 'de' },
    { code: 'es', name: 'Español', flag: 'es' },
    { code: 'zh', name: '中文', flag: 'cn' },
    { code: 'ja', name: '日本語', flag: 'jp' },
    { code: 'ko', name: '한국어', flag: 'kr' }
  ];

  account = {
    name: '',
    email: '',
    phone: '',
    avatar: null as File | string | null,
    password: '',
    currentPassword: '',
    firstName: '',
    lastName: '',
    bio: '',
    website: '',
    location: ''
  };

  advanced = {
    betaFeatures: false,
    apiToken: '',
    blockedUsers: '',
    lockComments: false
  };

  security = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false,
    devices: [
      { id: 1, browser: 'Chrome', os: 'Windows', location: 'Hanoi, Vietnam', last_active: 'Now', current: true },
      { id: 2, browser: 'Safari', os: 'macOS', location: 'Ho Chi Minh City, Vietnam', last_active: '2 hours ago', current: false },
      { id: 3, browser: 'Chrome', os: 'Android', location: 'Da Nang, Vietnam', last_active: '1 day ago', current: false },
    ]
  };

  user: User | null = null;
  loading = false;
  private initialSettings: any = {}; // Store the original state

  constructor(
    private usersService: UsersService,
    private authService: AuthService,
    private http: HttpClient,
    private languagesService: LanguagesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      tap(() => {
        this.isSearching = true;
        this.userSearchResults = [];
      }),
      switchMap(term => {
        if (!term.trim()) {
          this.isSearching = false;
          return of({ data: { users: [] } });
        }
        return this.usersService.getAll({ search: term, limit: 5 }).pipe(
          catchError(() => of({ data: { users: [] } }))
        );
      }),
      tap(() => this.isSearching = false)
    ).subscribe((response: any) => {
        if (response && response.data && response.data.users) {
            this.userSearchResults = response.data.users.filter((u: User) =>
                u.id !== this.user?.id && !this.blockedUsernames.includes(u.username)
            );
        } else {
            this.userSearchResults = [];
        }
    });
  }

  loadUserProfile() {
    this.loading = true;
    this.usersService.getProfile().subscribe({
      next: (res) => {
        const user = res.data.user;
        this.user = user;
        const userSettings = (this.user.settings?.settings as any) || {};

        // --- Populate current state from server ---
        this.account = {
          name: user.username || '',
          email: user.email || '',
          bio: user.description || '',
          website: (user as any).website || '',
          location: (user as any).location || '',
          avatar: user.avatar || null,
          firstName: (user as any).firstName || '',
          lastName: (user as any).lastName || '',
          phone: '', // These fields are not part of the backup/save logic for now
          password: '',
          currentPassword: '',
        };

        this.appearance = {
          theme: userSettings.theme || 'default',
          darkMode: userSettings.darkMode || false,
          language: userSettings.language || 'en',
          logo: null,
          favicon: null,
          layout: '1col'
        };

        this.advanced = {
          betaFeatures: userSettings.betaFeatures || false,
          lockComments: userSettings.lockComments || false,
          blockedUsers: userSettings.blockedUsers || '',
          apiToken: '', // Not saved
        };
        
        this.blockedUsernames = this.advanced.blockedUsers
          ? this.advanced.blockedUsers.split(',').map(u => u.trim()).filter(Boolean)
          : [];

        this.avatarPreviewUrl = this.account.avatar instanceof File ? null : this.account.avatar;

        // --- Create the initial backup ---
        this.backupInitialState();
        
        this.loading = false;
        this.applyTheme();
      },
      error: () => {
        this.loading = false;
        this.showSwal('Failed to load user profile.', 'error');
      }
    });
  }

  backupInitialState() {
    this.initialSettings = {
      account: JSON.parse(JSON.stringify(this.account)),
      appearance: JSON.parse(JSON.stringify(this.appearance)),
      advanced: JSON.parse(JSON.stringify(this.advanced))
    };
  }

  hasChanges(): boolean {
    const accountChanged = JSON.stringify(this.account) !== JSON.stringify(this.initialSettings.account);
    const appearanceChanged = JSON.stringify(this.appearance) !== JSON.stringify(this.initialSettings.appearance);
    const advancedChanged = JSON.stringify(this.advanced) !== JSON.stringify(this.initialSettings.advanced);
    const passwordChanged = !!(this.security.newPassword && this.security.newPassword.length > 0);
    
    return accountChanged || appearanceChanged || advancedChanged || passwordChanged;
  }

  cancelChanges() {
    if (!this.hasChanges()) {
      return; // No changes to cancel
    }

    this.account = JSON.parse(JSON.stringify(this.initialSettings.account));
    this.appearance = JSON.parse(JSON.stringify(this.initialSettings.appearance));
    this.advanced = JSON.parse(JSON.stringify(this.initialSettings.advanced));
    
    this.avatarPreviewUrl = this.account.avatar instanceof File ? null : this.account.avatar;
    this.security.currentPassword = '';
    this.security.newPassword = '';
    this.security.confirmPassword = '';
    
    this.applyTheme();
    this.showSwal('Changes have been cancelled.', 'info');
  }

  switchTab(tab: 'appearance' | 'account' | 'advanced' | 'security') {
    if (this.activeTab === tab) return;

    // Discard changes when switching tabs
    this.cancelChanges();
    this.activeTab = tab;
  }

  saveAllSettings() {
    this.loading = true;
    const tasks: Observable<any>[] = [];

    // Nếu không upload avatar, gửi JSON
    const data = {
      username: this.account.name,
      email: this.account.email,
      description: this.account.bio,
      website: this.account.website,
      location: this.account.location,
      avatar: typeof this.account.avatar === 'string' ? this.account.avatar : undefined // chỉ gửi URL/avatar string
    };
    tasks.push(this.usersService.updateProfile(data).pipe(
      map(response => ({ source: 'updateProfile', data: response.data.user })),
      catchError(err => of({ source: 'updateProfile', error: err }))
    ));

    // Task 2: Change Password
    if (this.security.newPassword) {
      if (this.security.newPassword !== this.security.confirmPassword) {
        this.showSwal('New passwords do not match!', 'error');
        this.loading = false;
        return;
      }
      if (!this.security.currentPassword) {
        this.showSwal('Current password is required to set a new one.', 'error');
        this.loading = false;
        return;
      }
      tasks.push(this.usersService.changePassword(this.security.currentPassword, this.security.newPassword).pipe(
        map(() => ({ source: 'changePassword' })),
        catchError(err => of({ source: 'changePassword', error: err }))
      ));
    }

    // Task 3: Save Settings
    const { logo, favicon, ...appearanceSettings } = this.appearance;
    const { apiToken, ...advancedSettings } = this.advanced;
    const currentSettings = { ...appearanceSettings, ...advancedSettings };
    const initialSettings = { ...this.initialSettings.appearance, ...this.initialSettings.advanced };
    if (JSON.stringify(currentSettings) !== JSON.stringify(initialSettings)) {
      tasks.push(this.usersService.saveSettings(currentSettings).pipe(
        map(() => ({ source: 'saveSettings' })),
        catchError(err => of({ source: 'saveSettings', error: err }))
      ));
    }

    if (tasks.length === 0) {
      this.showSwal('No changes to save.', 'info');
      this.loading = false;
      return;
    }

    forkJoin(tasks).subscribe({
      next: (results) => {
        this.loading = false;
        let hasError = false;
        let updatedUser: User | null = null;

        results.forEach(res => {
          if (res.error) {
            hasError = true;
            const message = res.error.error?.message || res.error.message || `Failed to save ${res.source}.`;
            this.showSwal(message, 'error');
          }
          if (res.source === 'updateProfile' && res.data) {
            updatedUser = res.data;
          }
        });

        if (!hasError) {
          this.showSwal('All settings saved successfully!', 'success');
          if (updatedUser) {
            this.authService.updateCurrentUser(updatedUser);
          }
          this.loadUserProfile(); // Reload profile to reset component state
        }
      },
      error: (error) => {
        this.loading = false;
        this.showSwal('An unexpected error occurred while saving settings.', 'error');
      }
    });
  }

  applyTheme() {
    const isDark = this.appearance.theme === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
  }

  setTheme(theme: 'light' | 'dark') {
    this.appearance.theme = theme;
    this.applyTheme();
  }

  // Appearance
  getFileName(file: File | null): string {
    return file ? file.name : '';
  }

  removeLogo() {
    this.appearance.logo = null;
  }

  removeFavicon() {
    this.appearance.favicon = null;
  }

  onLogoChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Validate file size (2MB max for logo)
      if (file.size > 2 * 1024 * 1024) {
        this.showSwal('Logo file size must be less than 2MB.', 'error');
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.showSwal('Please select an image file for logo.', 'error');
        return;
      }
      
      this.appearance.logo = file;
    }
  }

  onFaviconChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Validate file size (1MB max for favicon)
      if (file.size > 1024 * 1024) {
        this.showSwal('Favicon file size must be less than 1MB.', 'error');
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.showSwal('Please select an image file for favicon.', 'error');
        return;
      }
      
      this.appearance.favicon = file;
    }
  }

  showSwal(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') {
    Swal.fire({
      icon: type,
      title: message,
      timer: 2000,
      showConfirmButton: false,
      position: 'top-end',
      toast: true
    });
  }

  // Account
  onAvatarChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Validate file size (1MB max)
      if (file.size > 1024 * 1024) {
        this.showSwal('File size must be less than 1MB.', 'error');
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.showSwal('Please select an image file.', 'error');
        return;
      }
      
      this.account.avatar = file;
      this.selectedAvatarName = file.name;
      
      // Preview avatar
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.avatarPreviewUrl = e.target.result;
      };
      reader.readAsDataURL(file);

      // Tự động upload avatar sau khi chọn file hợp lệ
      this.uploadAvatar();
    }
  }
  get isFileAvatar(): boolean {
    return this.account.avatar instanceof File;
  }
  uploadAvatar() {
    if (!this.account.avatar || !(this.account.avatar instanceof File)) {
      this.showSwal('Please select an image to upload.', 'warning');
      return;
    }

    this.loading = true;
    this.usersService.uploadAvatar(this.account.avatar).subscribe({
      next: (response: any) => {
        this.loading = false;
        if (response.success) {
          this.avatarPreviewUrl = response.data.avatar;
          this.account.avatar = response.data.avatar;
          this.showSwal('Avatar uploaded successfully!', 'success');
        } else {
          this.showSwal(response.message || 'Failed to upload avatar.', 'error');
        }
      },
      error: (error) => {
        this.loading = false;
        this.showSwal(error.error?.message || 'Failed to upload avatar.', 'error');
      }
    });
  }

  deleteAccount() {
    if (!this.security.currentPassword) {
      this.showSwal('Please enter your current password to delete your account.', 'error');
      return;
    }

    this.usersService.deleteAccount(this.security.currentPassword).subscribe({
        next: (response) => {
            Swal.fire('Deleted!', 'Your account has been permanently deleted.', 'success').then(() => {
                // Logout, redirect to introduce page
                this.authService.logout();
                this.router.navigate(['/home/introduce-page']);
            });
        },
        error: (err) => {
            Swal.fire('Error!', err.error?.message || 'Could not delete your account.', 'error');
        }
    });
  }

  // Advanced
  backup() {
    alert('Backup started!');
  }
  restore(event: Event) {
    alert('Restore started!');
  }

  openMediaModal() {
    this.showMediaModal = true;
  }
  onSelectMediaImage(event: any) {
    // Accept either a string (URL) or an object/event with a url property
    const url = typeof event === 'string' ? event : event?.url || '';
    this.avatarPreviewUrl = url;
    this.account.avatar = url;
    this.showMediaModal = false;
  }

  toggleLanguageDropdown() {
    this.showLanguageDropdown = !this.showLanguageDropdown;
  }

  selectLanguage(code: string) {
    this.appearance.language = code;
    this.showLanguageDropdown = false;
  }

  getCountryCode(languageCode: string): string {
    const language = this.languages.find(lang => lang.code === languageCode);
    return language ? language.flag : 'us';
  }

  getLanguageName(languageCode: string): string {
    const language = this.languages.find(lang => lang.code === languageCode);
    return language ? language.name : 'English';
  }

  // Add click outside handler to close dropdown
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.language-selector')) {
      this.showLanguageDropdown = false;
    }
  }

  toggle2FA() {
    // In a real app, this would trigger a flow to set up 2FA (e.g., show QR code)
    this.showSwal(`Two-Factor Authentication ${this.security.twoFactorEnabled ? 'enabled' : 'disabled'}!`, 'info');
  }

  getDeviceIcon(os: string): string {
    if (!os) return 'fa-question-circle';
    const osLower = os.toLowerCase();
    if (osLower.includes('windows')) return 'fa-windows';
    if (osLower.includes('mac')) return 'fa-apple';
    if (osLower.includes('android')) return 'fa-android';
    if (osLower.includes('linux')) return 'fa-linux';
    if (osLower.includes('ios')) return 'fa-mobile-alt';
    if (osLower.includes('mobile')) return 'fa-mobile-alt';
    if (osLower.includes('desktop') || osLower.includes('pc')) return 'fa-desktop';
    if (osLower.includes('laptop')) return 'fa-laptop';
    return 'fa-question-circle';
  }

  logoutDevice(deviceId: number) {
    Swal.fire({
      title: 'Log out from this device?',
      text: "You will be logged out from this session.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, log out'
    }).then((result) => {
      if (result.isConfirmed) {
        // In a real app, you would call a service to terminate the specific session
        this.security.devices = this.security.devices.filter(d => d.id !== deviceId);
        this.showSwal('Successfully logged out from the device.', 'success');
      }
    });
  }

  confirmDeleteAccount() {
    Swal.fire({
      title: 'Are you absolutely sure?',
      
      html: `
        <p class="text-gray-600">This action cannot be undone. This will permanently delete your account and all associated data.</p>
        <p class="text-red-500 font-semibold mt-2">Please type your Password to confirm.</p>
        <div class="mt-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
          <input type="password" id="currentPassword" class="w-full px-2 py-3 border border-gray-300 rounded-md focus:outline-none" placeholder="Enter your current password">
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete my account',
      cancelButtonText: 'Cancel',
      preConfirm: (username) => {
        const currentPassword = (document.getElementById('currentPassword') as HTMLInputElement)?.value;
        
        
        if (!currentPassword) {
          Swal.showValidationMessage('Current password is required.');
          return false;
        }
        this.security.currentPassword = currentPassword;
        return username;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteAccount();
      }
    });
  }

  onSearchChange(term: string): void {
    this.searchSubject.next(term);
  }

  blockUser(user: User) {
    if (!this.blockedUsernames.includes(user.username)) {
      this.blockedUsernames.push(user.username);
      this.advanced.blockedUsers = this.blockedUsernames.join(', ');
      this.searchTerm = '';
      this.userSearchResults = [];
    }
  }

  unblockUser(usernameToUnblock: string) {
    this.blockedUsernames = this.blockedUsernames.filter(username => username !== usernameToUnblock);
    this.advanced.blockedUsers = this.blockedUsernames.join(', ');
  }

  // Lấy danh sách translation của ngôn ngữ
  getTranslations() {
    this.languagesService.getTranslations(this.appearance.language, { page: 1, limit: 10 })
      .subscribe(response => {
        console.log(response.translations);
      });
  }

  // Thêm translation mới
  addTranslation() {
    const newTranslation: CreateTranslationDto = {
      key: 'welcome_message',
      value: 'Chào mừng bạn!',
      language_id: 1
    };
    this.languagesService.addTranslation(this.appearance.language, newTranslation)
      .subscribe(response => {
        console.log(response.message);
      });
  }
}
