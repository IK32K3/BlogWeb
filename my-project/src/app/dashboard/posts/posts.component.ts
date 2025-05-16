import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { HeaderDashboardComponent } from '../../shared/components/header-dashboard/header-dashboard.component';
import { SidebarDashboardComponent } from '../../shared/components/sidebar-dashboard/sidebar-dashboard.component';

export interface Author {
  name: string;
  avatarUrl: string;
}

export interface Post {
  id: number; // For trackBy and unique identification
  title: string;
  tags: string; // Could be string[] if you prefer
  author: Author;
  category: string;
  status: 'Published' | 'Draft' | 'Scheduled' | 'Trash';
  date: string; // Or Date object
  selected?: boolean; // For the checkbox
}

@Component({
  selector: 'app-posts',
  imports: [CommonModule,FormsModule,RouterOutlet,HeaderDashboardComponent,SidebarDashboardComponent],
  templateUrl: './posts.component.html',
  styleUrl: './posts.component.css'
})
export class PostsComponent implements OnInit {
  // --- Data Signals ---
  allPosts = signal<Post[]>([]);
  filteredPosts = signal<Post[]>([]);

  // --- Filter Signals ---
  statusOptions = ['All Status', 'Published', 'Draft', 'Scheduled', 'Trash'];
  categoryOptions = ['All Categories', 'Technology', 'Programming', 'Design', 'Business', 'Web Design']; // Added Web Design

  selectedStatus = signal<string>(this.statusOptions[0]);
  selectedCategory = signal<string>(this.categoryOptions[0]);
  searchTerm = signal<string>('');

  // --- Selection Signals ---
  allSelected = signal<boolean>(false);

  // --- Pagination Signals ---
  currentPage = signal<number>(1);
  itemsPerPage = signal<number>(4); // Match your example, can be dynamic

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


  constructor() {}

  ngOnInit(): void {
    this.loadInitialPosts();
    this.applyFilters(); // Initial filter application
  }

  loadInitialPosts(): void {
    // Sample data, replace with API call in a real app
    const conanAuthor: Author = {
      name: 'Edogawa Conan',
      avatarUrl: 'https://phunuvietnam.mediacdn.vn/179072216278405120/2022/11/4/edogawa-conan--166754179290680712885.jpg'
    };

    this.allPosts.set([
      { id: 1, title: 'Getting Started with React Hooks', tags: 'react, javascript, webdev', author: conanAuthor, category: 'Programming', status: 'Published', date: 'May 15, 2023', selected: false },
      { id: 2, title: 'CSS Grid vs Flexbox', tags: 'css, webdesign, layout', author: conanAuthor, category: 'Web Design', status: 'Draft', date: 'May 10, 2023', selected: false },
      { id: 3, title: 'JavaScript ES6 Features', tags: 'javascript, es6, programming', author: conanAuthor, category: 'Programming', status: 'Scheduled', date: 'May 20, 2023', selected: false },
      { id: 4, title: 'Old jQuery Tutorial', tags: 'jquery, javascript', author: conanAuthor, category: 'Programming', status: 'Trash', date: 'April 5, 2023', selected: false },
      { id: 5, title: 'Angular Signals Deep Dive', tags: 'angular, signals, performance', author: conanAuthor, category: 'Programming', status: 'Published', date: 'May 18, 2023', selected: false },
      { id: 6, title: 'Tailwind CSS Best Practices', tags: 'tailwind, css, utility-first', author: conanAuthor, category: 'Web Design', status: 'Draft', date: 'May 12, 2023', selected: false },
      { id: 7, title: 'Introduction to Node.js', tags: 'nodejs, backend, javascript', author: conanAuthor, category: 'Programming', status: 'Scheduled', date: 'May 25, 2023', selected: false },
      { id: 8, title: 'Responsive Web Design Principles', tags: 'rwd, webdesign, mobile', author: conanAuthor, category: 'Web Design', status: 'Published', date: 'May 01, 2023', selected: false },
    ]);
  }

  applyFilters(): void {
    let posts = [...this.allPosts()]; // Create a new array reference

    // Status Filter
    if (this.selectedStatus() && this.selectedStatus() !== 'All Status') {
      posts = posts.filter(post => post.status === this.selectedStatus());
    }

    // Category Filter
    if (this.selectedCategory() && this.selectedCategory() !== 'All Categories') {
      posts = posts.filter(post => post.category === this.selectedCategory());
    }

    // Search Term Filter
    if (this.searchTerm()) {
      const term = this.searchTerm().toLowerCase();
      posts = posts.filter(post =>
        post.title.toLowerCase().includes(term) ||
        post.tags.toLowerCase().includes(term) ||
        post.author.name.toLowerCase().includes(term)
      );
    }
    this.filteredPosts.set(posts);
    this.currentPage.set(1); // Reset to first page after filtering
    this.updateAllSelectedState();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  // --- Selection Logic ---
  toggleSelectAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.allSelected.set(checked);
    this.paginatedPosts().forEach(post => post.selected = checked);
    // Also update selection for non-visible (but filtered) posts if desired
    // this.filteredPosts().forEach(post => post.selected = checked);
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

  // --- Action Button Handlers ---
  openGlobalFilter(): void {
    console.log('Open global filter modal/panel');
    // Implement filter modal logic here
  }

  createNewPost(): void {
    console.log('Navigate to new post form');
    // Implement navigation or modal for new post
  }

  viewPost(post: Post): void {
    console.log('View post:', post);
    // Implement view logic
  }

  editPost(post: Post): void {
    console.log('Edit post:', post);
    // Implement edit logic
  }

  deletePost(post: Post): void {
    console.log('Delete post:', post);
    if (confirm(`Are you sure you want to delete "${post.title}"?`)) {
      this.allPosts.update(posts => posts.filter(p => p.id !== post.id));
      this.applyFilters(); // Re-apply filters to update the view
    }
  }

  // --- Pagination Logic ---
  goToPage(pageNumber: number): void {
    if (pageNumber >= 1 && pageNumber <= this.totalPages()) {
      this.currentPage.set(pageNumber);
      this.updateAllSelectedState(); // Update header checkbox based on new page's items
    }
  }

  prevPage(): void {
    this.goToPage(this.currentPage() - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage() + 1);
  }

  // For *ngFor trackBy
  trackByPostId(index: number, post: Post): number {
    return post.id;
  }
}

