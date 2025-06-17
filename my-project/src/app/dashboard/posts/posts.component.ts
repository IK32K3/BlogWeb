import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterOutlet } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { BlogPostService } from '../../core/services/blog-post.service';
import { Post as ApiPost } from '../../shared/model/post.model';
import { ToastrService } from 'ngx-toastr';

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
  imports: [CommonModule, FormsModule, RouterOutlet, SharedModule],
  templateUrl: './posts.component.html',
  styleUrl: './posts.component.css'
})
export class PostsComponent implements OnInit {
  // --- Data Signals ---
  allPosts = signal<Post[]>([]);
  filteredPosts = signal<Post[]>([]);

  // --- Filter Signals ---
  statusOptions = ['All Status', 'Published', 'Draft', 'Scheduled', 'Trash'];
  categoryOptions = ['All Categories', 'Technology', 'Programming', 'Design', 'Business', 'Web Design'];

  // Định nghĩa màu sắc cho từng category
  categoryColors: CategoryColor[] = [
    { name: 'Technology', bgColor: 'bg-blue-100', textColor: 'text-blue-800' },
    { name: 'Programming', bgColor: 'bg-purple-100', textColor: 'text-purple-800' },
    { name: 'Design', bgColor: 'bg-pink-100', textColor: 'text-pink-800' },
    { name: 'Business', bgColor: 'bg-green-100', textColor: 'text-green-800' },
    { name: 'Web Design', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' }
  ];

  selectedStatus = signal<string>(this.statusOptions[0]);
  selectedCategory = signal<string>(this.categoryOptions[0]);
  searchTerm = signal<string>('');

  // --- Selection Signals ---
  allSelected = signal<boolean>(false);

  // --- Pagination Signals ---
  currentPage = signal<number>(1);
  itemsPerPage = signal<number>(10);

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

  constructor(
    private router: Router,
    private blogPostService: BlogPostService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadInitialPosts();
  }

  loadInitialPosts(): void {
    this.blogPostService.getMyPosts({
      page: this.currentPage(),
      limit: this.itemsPerPage(),
      status: this.selectedStatus() !== 'All Status' ? this.selectedStatus() : undefined,
      search: this.searchTerm() || undefined
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
        name: apiPost.author?.name || 'Unknown',
        avatarUrl: apiPost.author?.avatar || 'assets/images/default-avatar.png'
      },
      category: apiPost.category?.name || 'Uncategorized',
      status: apiPost.status as 'Published' | 'Draft' | 'Scheduled' | 'Trash',
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
    this.loadInitialPosts();
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
    this.router.navigate(['/dashboard/posts/create']);
  }

  viewPost(post: Post): void {
    this.router.navigate(['/blog/post', post.id]);
  }

  editPost(post: Post): void {
    this.toastr.info('Redirecting to edit post...', 'Info');
    this.router.navigate(['/dashboard/posts/edit', post.id]);
  }

  deletePost(post: Post): void {
    this.toastr.warning('Are you sure you want to delete this post?', 'Warning', {
      closeButton: true,
      timeOut: 5000,
      positionClass: 'toast-top-center',
      tapToDismiss: true,
      onActivateTick: true,
      enableHtml: true,
      extendedTimeOut: 2000,
      progressBar: true,
      progressAnimation: 'decreasing'
    }).onTap.subscribe(() => {
      this.blogPostService.delete(post.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.toastr.success('Post deleted successfully', 'Success', {
              timeOut: 3000,
              positionClass: 'toast-top-right'
            });
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
    });
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
}

