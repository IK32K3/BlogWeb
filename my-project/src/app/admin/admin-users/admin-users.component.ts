import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { UsersService, UserQueryParams } from '../../core/services/users.service';
import { User } from '../../shared/model/user.model';
import { Role } from '../../shared/model/role.model';
import { SlidebarAdminComponent } from 'app/shared/components/slidebar-admin/slidebar-admin.component';
import { HeaderAdminComponent } from 'app/shared/components/header-admin/header-admin.component';
import { RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-users',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SlidebarAdminComponent,
    HeaderAdminComponent,
    RouterModule,
    RouterOutlet,
  ],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.css'
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
  roles: Role[] = [
    { id: 1, name: 'Admin' },
    { id: 2, name: 'Blogger' },
    { id: 3, name: 'Viewer' }
  ];
  
  displayedColumns: string[] = ['id', 'username', 'email', 'role', 'status', 'createdAt', 'actions'];
  
  // Pagination
  totalUsers = 0;
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 50];
  currentPage = 0;
  
  // Sorting
  sortColumn = 'createdAt';
  sortDirection: 'asc' | 'desc' = 'desc';
  
  // Search
  searchTerm = '';
  private searchSubject = new Subject<string>();
  
  // Loading states
  loading = false;
  loadingUser = false;
  
  // Dialog states
  showAddDialog = false;
  showEditDialog = false;
  showDeleteDialog = false;
  selectedUser: User | null = null;
  
  // Forms
  userForm: FormGroup;
  
  // Math object for template
  Math = Math;
  
  constructor(
    private usersService: UsersService,
    private fb: FormBuilder
  ) {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      role_id: [3, Validators.required],
      description: [''],
      is_active: [true],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }
  
  ngOnInit(): void {
    this.loadUsers();

    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(() => {
      this.currentPage = 0;
      this.loadUsers();
    });
  }
  
  loadUsers(): void {
    this.loading = true;
    
    const params: UserQueryParams = {
      page: this.currentPage + 1,
      limit: this.pageSize,
      sortBy: this.sortColumn,
      sortOrder: this.sortDirection
    };
    
    if (this.searchTerm.trim()) {
      params.search = this.searchTerm.trim();
    }
    
    this.usersService.getAll(params).subscribe({
      next: (response) => {
        this.users = response.data.users;
        this.totalUsers = response.data.pagination.total;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.showNotification('Lỗi khi tải danh sách người dùng', 'error');
        this.loading = false;
      }
    });
  }
  
  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadUsers();
  }
  
  onSortChange(sort: any): void {
    this.sortColumn = sort.active;
    this.sortDirection = sort.direction as 'asc' | 'desc';
    this.loadUsers();
  }
  
  onSearch(): void {
    this.currentPage = 0;
    this.loadUsers();
  }
  
  onSearchChange(): void {
    this.searchSubject.next(this.searchTerm);
  }
  
  clearSearch(): void {
    this.searchTerm = '';
    this.currentPage = 0;
    this.loadUsers();
  }
  
  openAddDialog(): void {
    this.userForm.reset({
      role_id: 3,
      is_active: true
    });
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.get('password')?.updateValueAndValidity();
    this.showAddDialog = true;
  }
  
  openEditDialog(user: User): void {
    this.selectedUser = user;
    this.userForm.patchValue({
      username: user.username,
      email: user.email,
      role_id: user.role_id,
      description: user.description,
      is_active: user.is_active,
      password: '' // Don't populate password for edit
    });
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    this.showEditDialog = true;
  }
  
  openDeleteDialog(user: User): void {
    this.selectedUser = user;
    this.showDeleteDialog = true;
  }
  
  closeDialogs(): void {
    this.showAddDialog = false;
    this.showEditDialog = false;
    this.showDeleteDialog = false;
    this.selectedUser = null;
    this.userForm.reset();
  }
  
  onSubmit(): void {
    if (this.userForm.valid) {
      this.loadingUser = true;
      const userData = this.userForm.value;
      
      if (this.showAddDialog) {
        // Add a default avatar if it's not provided
        if (!userData.avatar) {
          userData.avatar = ''; 
        }

        this.usersService.create(userData).subscribe({
          next: (response) => {
            this.showNotification('Thêm người dùng thành công', 'success');
            this.closeDialogs();
            this.loadUsers();
            this.loadingUser = false;
          },
          error: (error) => {
            console.error('Error creating user:', error);
            this.showNotification('Lỗi khi thêm người dùng', 'error');
            this.loadingUser = false;
          }
        });
      } else if (this.showEditDialog && this.selectedUser) {
        // Remove password if empty for edit
        if (!userData.password) {
          delete userData.password;
        }
        
        this.usersService.update(this.selectedUser.id, userData).subscribe({
          next: (response) => {
            this.showNotification('Cập nhật người dùng thành công', 'success');
            this.closeDialogs();
            this.loadUsers();
            this.loadingUser = false;
          },
          error: (error) => {
            console.error('Error updating user:', error);
            this.showNotification('Lỗi khi cập nhật người dùng', 'error');
            this.loadingUser = false;
          }
        });
      }
    }
  }
  
  deleteUser(): void {
    if (this.selectedUser) {
      this.loadingUser = true;
      this.usersService.delete(this.selectedUser.id).subscribe({
        next: (response) => {
          this.showNotification('Xóa người dùng thành công', 'success');
          this.closeDialogs();
          this.loadUsers();
          this.loadingUser = false;
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          this.showNotification('Lỗi khi xóa người dùng', 'error');
          this.loadingUser = false;
        }
      });
    }
  }
  
  getRoleName(roleId: number): string {
    const role = this.roles.find(r => r.id === roleId);
    return role ? role.name : 'Unknown';
  }
  
  getRoleColor(roleId: number): string {
    switch (roleId) {
      case 1: return 'warn'; // admin
      case 2: return 'accent'; // moderator
      case 3: return 'primary'; // author
      default: return ''; // user
    }
  }
  
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('vi-VN');
  }
  
  showNotification(message: string, type: 'success' | 'error'): void {
    Swal.fire({
      icon: type,
      title: message,
      confirmButtonText: 'OK',
    });
  }
}
