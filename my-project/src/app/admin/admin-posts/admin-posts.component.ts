import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { BlogPostService } from '../../core/services/blog-post.service';
import { Post, Category, User } from '../../shared/model/post.model';
import { ToastrService } from 'ngx-toastr';
import { HeaderAdminComponent } from '../../shared/components/header-admin/header-admin.component';
import { SlidebarAdminComponent } from '../../shared/components/slidebar-admin/slidebar-admin.component';
import { CategoryService } from '../../core/services/category.service';
import { UsersService } from '../../core/services/users.service';

@Component({
  selector: 'app-admin-posts',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    HeaderAdminComponent,
    SlidebarAdminComponent
  ],
  templateUrl: './admin-posts.component.html',
  styleUrl: './admin-posts.component.css'
})
export class AdminPostsComponent implements OnInit, OnDestroy {
  posts: Post[] = [];
  filteredPosts: Post[] = [];
  loading = false;
  currentPage = 1;
  totalPages = 1;
  totalPosts = 0;
  itemsPerPage = 10;
  
  // Search and filter
  searchTerm = '';
  selectedStatus = 'all';
  selectedCategory = 'all';
  selectedAuthor = 'all';
  
  // Status options
  statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'published', label: 'Published' },
    { value: 'draft', label: 'Draft' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'archived', label: 'Archived' }
  ];
  
  // Categories and authors for filters
  categories: Category[] = [];
  authors: User[] = [];
  
  // Bulk actions
  selectedPosts: number[] = [];
  selectAll = false;
  
  // Confirmation dialogs
  showDeleteConfirm = false;
  postToDelete: Post | null = null;
  
  // Search debounce
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  // Math object for template
  Math = Math;

  constructor(
    private blogPostService: BlogPostService,
    private toastr: ToastrService,
    private categoryService: CategoryService,
    private usersService: UsersService
  ) {
    // Setup search debounce
    this.searchSubject
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(term => {
        this.searchTerm = term;
        this.loadPosts();
      });
  }

  ngOnInit(): void {
    this.loadPosts();
    this.loadCategories();
    this.loadAuthors();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Computed properties for template
  get publishedPostsCount(): number {
    return this.posts.filter(p => p.status === 'published').length;
  }

  get draftPostsCount(): number {
    return this.posts.filter(p => p.status === 'draft').length;
  }

  get totalViews(): number {
    return this.posts.reduce((sum, post) => sum + (post.views || 0), 0);
  }

  // Load posts with filters
  loadPosts(): void {
    this.loading = true;
    const params: any = {
      page: this.currentPage,
      limit: this.itemsPerPage,
      include: ['category', 'author']
    };

    if (this.searchTerm) {
      params.search = this.searchTerm;
    }

    if (this.selectedStatus !== 'all') {
      params.status = this.selectedStatus;
    }

    if (this.selectedCategory !== 'all') {
      params.categoryId = this.selectedCategory;
    }

    if (this.selectedAuthor !== 'all') {
      params.userId = this.selectedAuthor;
    }

    this.blogPostService.getAll(params).subscribe({
      next: (response) => {
        this.posts = response.data.posts;
        this.filteredPosts = [...this.posts];
        this.totalPosts = response.data.pagination.total;
        this.totalPages = response.data.pagination.totalPages;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading posts:', error);
        this.toastr.error('Failed to load posts', 'Error');
        this.loading = false;
      }
    });
  }

  // Load categories for filter
  loadCategories(): void {
    this.categoryService.getAll({}).subscribe({ // Fetch all categories
      next: (response) => {
        if (response.success && response.data?.categories) {
          this.categories = response.data.categories;
        } else {
          this.toastr.error('Failed to load categories', 'Error');
        }
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.toastr.error('Failed to load categories', 'Error');
      }
    });
  }

  // Load authors for filter
  loadAuthors(): void {
    this.usersService.getAll({ limit: 100 }).subscribe({ // Fetch a large number to get all users
      next: (response) => {
        if (response.success && response.data?.users) {
          this.authors = response.data.users;
        } else {
          this.toastr.error('Failed to load authors', 'Error');
        }
      },
      error: (error) => {
        console.error('Error loading authors:', error);
        this.toastr.error('Failed to load authors', 'Error');
      }
    });
  }

  // Search functionality
  onSearch(event: any): void {
    this.searchSubject.next(event.target.value);
  }

  // Filter changes
  onStatusChange(): void {
    this.currentPage = 1;
    this.loadPosts();
  }

  onCategoryChange(): void {
    this.currentPage = 1;
    this.loadPosts();
  }

  onAuthorChange(): void {
    this.currentPage = 1;
    this.loadPosts();
  }

  // Pagination
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadPosts();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    let end = Math.min(this.totalPages, start + maxPages - 1);
    
    if (end - start + 1 < maxPages) {
      start = Math.max(1, end - maxPages + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  // Bulk selection
  toggleSelectAll(): void {
    if (this.selectAll) {
      this.selectedPosts = this.posts.map(post => post.id);
    } else {
      this.selectedPosts = [];
    }
  }

  togglePostSelection(postId: number): void {
    const index = this.selectedPosts.indexOf(postId);
    if (index > -1) {
      this.selectedPosts.splice(index, 1);
    } else {
      this.selectedPosts.push(postId);
    }
    this.updateSelectAllState();
  }

  updateSelectAllState(): void {
    this.selectAll = this.selectedPosts.length === this.posts.length && this.posts.length > 0;
  }

  // Status management
  updatePostStatus(postId: number, status: string): void {
    this.blogPostService.updateStatus(postId, status).subscribe({
      next: () => {
        this.toastr.success(`Post status updated to ${status}`, 'Success');
        this.loadPosts();
      },
      error: (error) => {
        console.error('Error updating post status:', error);
        this.toastr.error('Failed to update post status', 'Error');
      }
    });
  }

  // Delete functionality
  confirmDelete(post: Post): void {
    this.postToDelete = post;
    this.showDeleteConfirm = true;
  }

  deletePost(): void {
    if (!this.postToDelete) return;

    this.blogPostService.delete(this.postToDelete.id).subscribe({
      next: () => {
        this.toastr.success('Post deleted successfully', 'Success');
        this.showDeleteConfirm = false;
        this.postToDelete = null;
        this.loadPosts();
      },
      error: (error) => {
        console.error('Error deleting post:', error);
        this.toastr.error('Failed to delete post', 'Error');
        this.showDeleteConfirm = false;
        this.postToDelete = null;
      }
    });
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.postToDelete = null;
  }

  // Bulk delete
  deleteSelectedPosts(): void {
    if (this.selectedPosts.length === 0) {
      this.toastr.warning('Please select posts to delete', 'Warning');
      return;
    }

    if (confirm(`Are you sure you want to delete ${this.selectedPosts.length} selected posts?`)) {
      // Implement bulk delete logic here
      this.toastr.info('Bulk delete functionality will be implemented', 'Info');
    }
  }

  // Utility methods
  getStatusClass(status: string): string {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'published':
        return 'M5 13l4 4L19 7';
      case 'draft':
        return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z';
      case 'scheduled':
        return 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z';
      case 'archived':
        return 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4';
      default:
        return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z';
    }
  }

  truncateText(text: string, maxLength: number = 100): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  formatDate(date: string | Date): string {
    if (!date) return 'N/A';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
    return dateObj.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
