import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterOutlet } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { BlogPostService } from '../../core/services/blog-post.service';
import { Post as ApiPost } from '../../shared/model/post.model';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../core/services/auth.service';
import { CategoryService } from '../../core/services/category.service';
import { UsersService } from '../../core/services/users.service';
import { Subject } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { HeaderDashboardComponent } from '../../shared/components/header-dashboard/header-dashboard.component';
import { SidebarDashboardComponent } from '../../shared/components/sidebar-dashboard/sidebar-dashboard.component';

export interface Author {
  name: string;
  avatarUrl: string;
}

export interface Post {
  id: number;
  title: string;
  tags: string;
  author: Author;
  category: string;
  status: 'Published' | 'Draft' | 'Scheduled' | 'Trash';
  date: string;
  selected?: boolean;
}

// Interface cho màu sắc category
interface CategoryColor {
  name: string;
  bgColor: string;
  textColor: string;
}

@Component({
  selector: 'app-posts',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, HeaderDashboardComponent, SidebarDashboardComponent],
  templateUrl: './posts.component.html',
  styleUrl: './posts.component.css'
})
export class PostsComponent implements OnInit {
  // --- Data Signals ---
  allPosts = signal<Post[]>([]);
  filteredPosts = signal<Post[]>([]);

  // --- Filter Signals ---
  statusOptions = ['All Status', 'Published', 'Draft', 'Scheduled'];
  categoryOptions = signal<string[]>(['All Categories']); // Sẽ cập nhật động từ DB

  // Định nghĩa màu sắc cho từng category (sẽ cập nhật động từ DB)
  categoryColors: CategoryColor[] = [
    { name: 'Technology', bgColor: 'bg-blue-100', textColor: 'text-blue-800' },
    { name: 'Programming', bgColor: 'bg-purple-100', textColor: 'text-purple-800' },
    { name: 'Design', bgColor: 'bg-pink-100', textColor: 'text-pink-800' },
    { name: 'Business', bgColor: 'bg-green-100', textColor: 'text-green-800' },
    { name: 'Web Design', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' },
    { name: 'Education', bgColor: 'bg-indigo-100', textColor: 'text-indigo-800' },
    { name: 'Health', bgColor: 'bg-teal-100', textColor: 'text-teal-800' },
    { name: 'Lifestyle', bgColor: 'bg-orange-100', textColor: 'text-orange-800' },
    { name: 'Travel', bgColor: 'bg-cyan-100', textColor: 'text-cyan-800' }
  ];

  selectedStatus: string = this.statusOptions[0];
  selectedCategory: string = 'All Categories';
  searchTerm: string = '';

  // --- Selection Signals ---
  allSelected = signal<boolean>(false);

  // --- Pagination Signals ---
  currentPage = signal<number>(1);
  itemsPerPage = signal<number>(10);

  // --- Delete Modal Signals ---
  showDeleteModal = signal<boolean>(false);
  postToDelete = signal<Post | null>(null);

  // --- Computed Signals ---
  paginatedPosts = computed(() => {
    const posts = this.filteredPosts();
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    const end = start + this.itemsPerPage();
    return posts.slice(start, end);
  });

  totalPages = computed(() => {
    return Math.ceil(this.filteredPosts().length / this.itemsPerPage());
  });

  paginationNumbers = computed(() => {
    const pages = [];
    for (let i = 1; i <= this.totalPages(); i++) {
      pages.push(i);
    }
    return pages;
  });

  showingStart = computed(() => {
    if (this.filteredPosts().length === 0) return 0;
    return (this.currentPage() - 1) * this.itemsPerPage() + 1;
  });

  showingEnd = computed(() => {
    const end = this.currentPage() * this.itemsPerPage();
    return Math.min(end, this.filteredPosts().length);
  });

  totalFilteredItems = computed(() => this.filteredPosts().length);

  searchInput$ = new Subject<string>();
  autocompleteResults: any[] = [];
  showAutocomplete = false;

  constructor(
    private router: Router,
    private blogPostService: BlogPostService,
    private toastr: ToastrService,
    private authService: AuthService,
    private categoryService: CategoryService,
    private usersService: UsersService
  ) {}

  ngOnInit(): void {
    this.loadInitialPosts();
    this.loadCategoriesFromDB();

    // Lấy user hiện tại nếu cần
    this.usersService.getProfile().subscribe({
      next: (response) => {
        if (response.success && response.data?.user) {
          // Handle user data if needed
          console.log('Current user:', response.data.user);
        }
      },
      error: (error) => {
        console.error('Error getting user profile:', error);
      }
    });

    this.searchInput$.pipe(
      debounceTime(300),
      switchMap(term => this.blogPostService.getAll({ search: term, autocomplete: true }))
    ).subscribe({
      next: (res) => {
        this.autocompleteResults = res.data.posts;
        this.showAutocomplete = !!this.searchTerm && this.autocompleteResults.length > 0;
      }
    });
  }

  loadInitialPosts(): void {
    this.blogPostService.getMyPosts({
      page: this.currentPage(),
      limit: this.itemsPerPage(),
      status: this.selectedStatus !== 'All Status' ? this.selectedStatus : undefined,
      search: this.searchTerm || undefined,
      category: this.selectedCategory !== 'All Categories' ? this.selectedCategory : undefined
    }).subscribe({
      next: (response) => {
        if (response.success) {
          const posts = response.data.posts.map(apiPost => this.transformApiPost(apiPost));
          this.allPosts.set(posts);
          this.filteredPosts.set(posts);
          
          if (response.data.pagination) {
            this.itemsPerPage.set(response.data.pagination.limit || 10);
            this.currentPage.set(response.data.pagination.page || 1);
          }
        }
      },
      error: (error) => {
        console.error('Error loading posts:', error);
        this.toastr.error('Failed to load posts', 'Error');
      }
    });
  }

  private transformApiPost(apiPost: ApiPost): Post {
    return {
      id: apiPost.id,
      title: apiPost.title,
      tags: apiPost.tags?.join(', ') || '',
      author: {
        name: apiPost.author?.username || 'Unknown',
        avatarUrl: apiPost.author?.avatar || 'assets/images/default-avatar.png'
      },
      category: apiPost.category?.name || 'Uncategorized',
      status: this.capitalizeFirstLetter(apiPost.status) as 'Published' | 'Draft' | 'Scheduled' | 'Trash',
      date: apiPost.createdAt ? new Date(apiPost.createdAt).toLocaleDateString() : 'Unknown date',
      selected: false
    };
  }

  // Lấy màu sắc cho category
  getCategoryColor(categoryName: string): CategoryColor {
    const color = this.categoryColors.find(c => c.name === categoryName);
    return color || { name: categoryName, bgColor: 'bg-gray-100', textColor: 'text-gray-800' };
  }

  applyFilters(): void {
    let posts = this.allPosts();

    // Lọc theo category
    if (this.selectedCategory !== 'All Categories') {
      posts = posts.filter(post => post.category === this.selectedCategory);
    }

    // Lọc theo status
    if (this.selectedStatus !== 'All Status') {
      posts = posts.filter(post => post.status === this.selectedStatus);
    }

    this.filteredPosts.set(posts);
  }

  onFilterChange(): void {
    this.currentPage.set(1);
    this.applyFilters();
  }

  toggleSelectAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.allSelected.set(checked);
    this.paginatedPosts().forEach(post => post.selected = checked);
  }

  onPostSelectedChange(): void {
    this.updateAllSelectedState();
  }

  private updateAllSelectedState(): void {
    const currentPaginatedPosts = this.paginatedPosts();
    if (currentPaginatedPosts.length === 0) {
      this.allSelected.set(false);
      return;
    }
    this.allSelected.set(currentPaginatedPosts.every(p => p.selected));
  }

  openGlobalFilter(): void {
    console.log('Open global filter modal/panel');
  }

  createNewPost(): void {
    this.router.navigate(['/blog/write-post']);
  }

  viewPost(post: Post): void {
    this.router.navigate(['/blog/post-detail', post.id]);
  }

  editPost(post: Post): void {
    this.toastr.info('Redirecting to edit post...', 'Info');
    this.router.navigate(['/blog/update-post', post.id]);
  }

  // Hiển thị modal xác nhận delete
  showDeleteConfirmation(post: Post): void {
    this.postToDelete.set(post);
    this.showDeleteModal.set(true);
  }

  // Đóng modal xác nhận delete
  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.postToDelete.set(null);
  }

  // Xác nhận delete post
  confirmDelete(): void {
    const post = this.postToDelete();
    if (!post) return;

    this.blogPostService.delete(post.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastr.success('Post deleted successfully', 'Success', {
            timeOut: 3000,
            positionClass: 'toast-top-right'
          });
          this.closeDeleteModal();
          this.loadInitialPosts();
        } else {
          this.toastr.error(response.message || 'Failed to delete post', 'Error', {
            timeOut: 3000,
            positionClass: 'toast-top-right'
          });
        }
      },
      error: (error) => {
        console.error('Error deleting post:', error);
        this.toastr.error(error.error?.message || 'Failed to delete post', 'Error', {
          timeOut: 3000,
          positionClass: 'toast-top-right'
        });
      }
    });
  }

  // Phương thức cũ để tương thích (có thể xóa sau)
  deletePost(post: Post): void {
    this.showDeleteConfirmation(post);
  }

  goToPage(pageNumber: number): void {
    if (pageNumber >= 1 && pageNumber <= this.totalPages()) {
      this.currentPage.set(pageNumber);
      this.loadInitialPosts();
      this.updateAllSelectedState();
    }
  }

  prevPage(): void {
    this.goToPage(this.currentPage() - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage() + 1);
  }

  trackByPostId(index: number, post: Post): number {
    return post.id;
  }

  private capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  // Lấy danh sách category từ database và cập nhật categoryOptions, categoryColors
  loadCategoriesFromDB(): void {
    this.categoryService.getAll().subscribe({
      next: (response) => {
        if (response.success && response.data?.categories) {
          const dbCategories = response.data.categories.map((cat: any) => cat.name);
          this.categoryOptions.set(['All Categories', ...dbCategories]);

          // Thêm màu cho category mới nếu chưa có
          response.data.categories.forEach((cat: any, idx: number) => {
            if (!this.categoryColors.find(c => c.name === cat.name)) {
              // Sinh màu tự động dựa trên index (hoặc dùng màu mặc định)
              const colorList = [
                { bg: 'bg-blue-100', text: 'text-blue-800' },
                { bg: 'bg-purple-100', text: 'text-purple-800' },
                { bg: 'bg-pink-100', text: 'text-pink-800' },
                { bg: 'bg-green-100', text: 'text-green-800' },
                { bg: 'bg-yellow-100', text: 'text-yellow-800' },
                { bg: 'bg-indigo-100', text: 'text-indigo-800' },
                { bg: 'bg-teal-100', text: 'text-teal-800' },
                { bg: 'bg-orange-100', text: 'text-orange-800' },
                { bg: 'bg-cyan-100', text: 'text-cyan-800' }
              ];
              const color = colorList[idx % colorList.length];
              this.categoryColors.push({ name: cat.name, bgColor: color.bg, textColor: color.text });
            }
          });
        }
      },
      error: (err) => {
        // fallback giữ nguyên categoryOptions mặc định
      }
    });
  }

  onStatusChange(post: Post, newStatus: 'Published' | 'Draft') {
    // Gọi API cập nhật status nếu có
    this.blogPostService.updateStatus(post.id, newStatus).subscribe({
      next: (res) => {
        post.status = newStatus;
        this.toastr.success('Status updated!');
        this.applyFilters(); // Nếu muốn filter lại
      },
      error: () => {
        this.toastr.error('Failed to update status');
      }
    });
  }

  onSearchInput(term: string) {
    this.searchTerm = term;
    if (!term || !term.trim() || term.trim().length < 1) {
      this.showAutocomplete = false;
      this.autocompleteResults = [];
      return;
    }
    this.searchInput$.next(term);
  }
}

