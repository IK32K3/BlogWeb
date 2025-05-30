import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet, ActivatedRoute } from '@angular/router';
import { NavBarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { FilterMovieComponent } from '../../shared/components/filter-movie/filter-movie.component';
import { TranslateModule } from '@ngx-translate/core';
import { BlogPostService } from '../../core/services/blog-post.service';
import { Post } from '../../shared/model/post.model';
import { UsersService } from '../../core/services/users.service';
import { User } from '../../shared/model/user.model';

@Component({
  selector: 'app-category-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterOutlet,
    NavBarComponent,
    FooterComponent,
    FilterMovieComponent,
    TranslateModule
  ],
  templateUrl: './category-page.component.html',
  styleUrl: './category-page.component.css'
})
export class CategoryPageComponent implements OnInit {
  posts: Post[] = [];
  isLoading = false;
  error: any = null;

  currentPage: number = 1;
  itemsPerPage: number = 9;
  totalItems: number = 0;
  totalPages: number = 0;
  pages: number[] = [];

  currentFilters: any = {};

  latestPosts: Post[] = [];
  suggestedUsers: User[] = [];

  constructor(
    private blogPostService: BlogPostService,
    private route: ActivatedRoute,
    private usersService: UsersService
  ) {}

  ngOnInit(): void {
    this.loadPosts(this.currentFilters);
    this.loadLatestPosts();
    this.loadSuggestedUsers();
  }

  loadPosts(filters: any): void {
    this.isLoading = true;
    this.error = null;
    this.currentFilters = filters;

    const params: any = {
      ...filters,
      page: this.currentPage,
      limit: this.itemsPerPage,
    };

    Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

    // Determine which service method to call based on filters presence
    let postsObservable;
    // Check if any filters are present other than pagination
    const filterKeys = Object.keys(this.currentFilters).filter(key => key !== 'page' && key !== 'limit');

    // If filters are present, use the search endpoint and map parameters
    if (filterKeys.length > 0 && (this.currentFilters.search || this.currentFilters.categories?.length > 0 || this.currentFilters.year || this.currentFilters.sort_by || this.currentFilters.status)) {
       const searchParams = {
         query: params.search, // Map frontend 'search' to backend 'query'
         page: params.page,
         limit: params.limit,
         // Map frontend 'categories' array to backend 'category_id' (service expects single for search)
         // This is still a mismatch. The backend search endpoint expects a single category_id.
         // To support multiple categories on search, backend searchService would need update.
         // For now, let's pass the first category ID if multiple are selected, or the single one.
         category_id: Array.isArray(params.categories) && params.categories.length > 0 ? params.categories[0] : (params.categories ? params.categories : null), // Pass first category ID or null
         status: params.status,
         // Map frontend sort_by to backend sort.
         sort: params.sort_by, 
         // Convert frontend year to backend date_from/date_to strings
         date_from: params.year ? `${params.year}-01-01T00:00:00.000Z` : undefined,
         date_to: params.year ? `${params.year}-12-31T23:59:59.999Z` : undefined,
       };
        Object.keys(searchParams).forEach(key => (searchParams[key as keyof typeof searchParams] === undefined || searchParams[key as keyof typeof searchParams] === null) && delete searchParams[key as keyof typeof searchParams]);

      // Note: blogPostService.search() expects parameters matching the /posts/search endpoint.
      // Based on backend searchPosts, it expects: query, page, limit, category_id, user_id, status, sort, date_from, date_to

       postsObservable = this.blogPostService.search(searchParams);
    } else {
      // If no significant filters, use the default getAll endpoint
      // Note: blogPostService.getAll() expects parameters matching the /posts endpoint.
      // Based on backend getAllPosts, it expects: page, limit, categoryId, search, userId, sort, status
      const getAllParams = {
          page: params.page,
          limit: params.limit,
          search: params.search, // Pass search term if present even without other filters
          status: params.status,
          // Map frontend categories array to service categoryId (single)
          categoryId: Array.isArray(params.categories) && params.categories.length > 0 ? params.categories[0] : (params.categories ? params.categories : null), 
          sort: params.sort_by, // Map sort_by to sort for getAllPosts service
          // getAllPosts service does not support date range.
      };
       Object.keys(getAllParams).forEach(key => (getAllParams[key as keyof typeof getAllParams] === undefined || getAllParams[key as keyof typeof getAllParams] === null) && delete getAllParams[key as keyof typeof getAllParams]);

       postsObservable = this.blogPostService.getAll(getAllParams);
    }

    postsObservable.subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Note: The response structure might differ between getAll and search endpoints.
          // Adjust based on actual backend response.
          // Assuming search returns results in 'results' key and pagination in 'pagination' key, similar to getAll.
          this.posts = response.data.posts || response.results || []; // Handle potential different response keys
          this.totalItems = response.data.pagination?.totalItems || response.pagination?.total || 0; // Handle potential different response keys
          this.totalPages = response.data.pagination?.totalPages || response.pagination?.totalPages || 0; // Handle potential different response keys
          this.calculatePages();
        } else {
          this.posts = [];
          this.totalItems = 0;
          this.totalPages = 0;
          this.pages = [];
          this.error = response.message || 'Failed to load posts';
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading posts:', err);
        this.isLoading = false;
        this.posts = [];
        this.totalItems = 0;
        this.totalPages = 0;
        this.pages = [];
        this.error = 'An error occurred while fetching posts.';
      }
    });
  }

  onFilterChange(filters: any): void {
    this.currentPage = 1;
    this.loadPosts(filters);
  }

  calculatePages(): void {
    this.pages = [];
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(this.totalPages, this.currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      this.pages.push(i);
    }
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadPosts(this.currentFilters);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  nextPage(): void {
    this.onPageChange(this.currentPage + 1);
  }

  previousPage(): void {
    this.onPageChange(this.currentPage - 1);
  }

  loadLatestPosts(): void {
    const params = {
      sortBy: 'created_at:desc',
      limit: 4
    };
    this.blogPostService.getAll(params).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.latestPosts = response.data.posts || [];
        } else {
          this.latestPosts = [];
        }
      },
      error: (err) => {
        console.error('Error loading latest posts:', err);
        this.latestPosts = [];
      }
    });
  }

  loadSuggestedUsers(): void {
    this.usersService.getAll({ limit: 2 /*, role: 'blogger'*/ }).subscribe({ // Temporarily remove role filter
      next: (response) => {
        if (response.users) {
          this.suggestedUsers = response.users || [];
        } else {
          this.suggestedUsers = [];
        }
      },
      error: (err) => {
        console.error('Error loading suggested users:', err);
        this.suggestedUsers = [];
      }
    });
  }

  tags = [
    { name: 'du lịch', url: '#' },
    { name: 'ẩm thực', url: '#' },
    { name: 'công nghệ', url: '#' },
    { name: 'sức khỏe', url: '#' },
    { name: 'thể thao', url: '#' },
    { name: 'giáo dục', url: '#' }
  ];

  getPostImageUrl(post: Post): string {
    const featuredMedia = post.postMedia?.find(media => media.is_featured);
    return featuredMedia?.media?.url || 'placeholder.jpg';
  }
}
