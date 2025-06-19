import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet, ActivatedRoute, RouterModule } from '@angular/router';
import { NavBarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { FilterMovieComponent } from '../../shared/components/filter-movie/filter-movie.component';
import { TranslateModule } from '@ngx-translate/core';
import { BlogPostService } from '../../core/services/blog-post.service';
import { Post } from '../../shared/model/post.model';
import { UsersService } from '../../core/services/users.service';
import { User } from '../../shared/model/user.model';
import { DEFAULT_POST_IMAGE, DEFAULT_AUTHOR_IMAGE } from '../../core/constants/app-constants';
import { CategoryService } from '../../core/services/category.service';
import { Category } from '../../shared/model/category.model';
import { Observable } from 'rxjs';
import { SharedModule } from 'app/shared/shared.module';

interface Tag {
  name: string;
  url: string;
}

@Component({
  selector: 'app-category-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterOutlet,
    RouterModule,
    SharedModule,
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
  showSuggestedUsers = false;

  currentPage: number = 1;
  itemsPerPage: number = 9;
  totalItems: number = 0;
  totalPages: number = 0;
  pages: number[] = [];

  currentFilters: any = {};

  latestPosts: Post[] = [];
  suggestedUsers: User[] = [];
  categories: Category[] = [];
  readonly DEFAULT_AUTHOR_IMAGE = DEFAULT_AUTHOR_IMAGE;
  readonly DEFAULT_POST_IMAGE = DEFAULT_POST_IMAGE;

  tags: Tag[] = [];

  constructor(
    private blogPostService: BlogPostService,
    private route: ActivatedRoute,
    private usersService: UsersService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.loadPosts(this.currentFilters);
    this.loadLatestPosts();
    this.loadSuggestedUsers();
    this.loadCategories();
  }

  loadPosts(filters: any): void {
    console.log('loadPosts - Initial filters:', filters);
    this.isLoading = true;
    this.error = null;
    this.currentFilters = filters;

    const params: any = {
      ...filters,
      page: this.currentPage,
      limit: this.itemsPerPage,
    };

    // Set default status to 'published' if not explicitly set by user
    if (params.status === undefined || params.status === null) {
      params.status = 'published';
    }

    console.log('loadPosts - Derived params before cleaning:', params);
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);
    console.log('loadPosts - Params after cleaning:', params);

    let postsObservable: Observable<any>; // Declare outside to handle all paths

    const hasCategoryFilter = Array.isArray(params.categories) && params.categories.length > 0;
    const categoryId = hasCategoryFilter ? Number(params.categories[0]) : undefined;

    // Determine if there are *any* "complex" filters that require the search endpoint
    // "Complex" means: a search query, a year, a sort_by, or a status other than 'published'
    // Explicitly check for a non-empty string for params.search
    const isComplexFilterActive = (typeof params.search === 'string' && params.search.trim().length > 0) || // Refined check with trim()
                                  !!params.year ||
                                  !!params.sort_by ||
                                  (params.status && params.status !== 'published');

    console.log('loadPosts - hasCategoryFilter:', hasCategoryFilter, 'isComplexFilterActive:', isComplexFilterActive);

    if (isComplexFilterActive) {
      // Case 1: Complex filters are active (e.g., search term, year, sort, or non-default status)
      // Use search endpoint, even if a category is also selected
      const searchParams = {
        ...(typeof params.search === 'string' && params.search.trim().length > 0 && { query: params.search.trim() }), // Refined check with trim()
        page: params.page,
        limit: params.limit,
        category_id: categoryId, // Pass numeric category_id if present
        status: params.status,
        sort: params.sort_by,
        date_from: params.year ? `${params.year}-01-01T00:00:00.000Z` : undefined,
        date_to: params.year ? `${params.year}-12-31T23:59:59.999Z` : undefined,
        // Thêm parameters để ưu tiên kết quả tìm kiếm
        search_priority: (typeof params.search === 'string' && params.search.trim().length > 0) ? 'relevance' : undefined,
        relevance_sort: (typeof params.search === 'string' && params.search.trim().length > 0) ? true : undefined,
      };
      // Clean up undefined/null values for searchParams
      Object.keys(searchParams).forEach(key => (searchParams[key as keyof typeof searchParams] === undefined || searchParams[key as keyof typeof searchParams] === null) && delete searchParams[key as keyof typeof searchParams]);
      postsObservable = this.blogPostService.search(searchParams);
      console.log('Calling blogPostService.search with params:', searchParams);
    } else if (hasCategoryFilter) {
      // Case 2: Only category filter (and default 'published' status), no other complex filters
      postsObservable = this.blogPostService.getByCategory(categoryId!, {
        page: params.page,
        limit: params.limit,
        status: params.status // Will be 'published' here
      });
      console.log('Calling blogPostService.getByCategory with categoryId:', categoryId, 'and params:', { page: params.page, limit: params.limit, status: params.status });
    } else {
      // Case 3: No significant filters (just default pagination and 'published' status)
      const getAllParams = {
        page: params.page,
        limit: params.itemsPerPage,
        status: params.status,
      };
      // Clean up undefined/null values for getAllParams
      Object.keys(getAllParams).forEach(key => (getAllParams[key as keyof typeof getAllParams] === undefined || getAllParams[key as keyof typeof getAllParams] === null) && delete getAllParams[key as keyof typeof getAllParams]);
      postsObservable = this.blogPostService.getAll(getAllParams);
      console.log('Calling blogPostService.getAll with params:', getAllParams);
    }

    postsObservable.subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Note: The response structure might differ between getAll and search endpoints.
          // Adjust based on actual backend response.
          // Assuming search returns results in 'results' key and pagination in 'pagination' key, similar to getAll.
          this.posts = response.data.posts || []; // Handle potential different response keys
          this.totalItems = response.data.pagination?.total || 0; // Handle potential different response keys
          this.totalPages = response.data.pagination?.totalPages || 0; // Handle potential different response keys
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
    // Reset to first page when filters change
    this.currentPage = 1;
    this.loadPosts(filters);
  }

  // Thêm method riêng cho search để xử lý tốt hơn
  onSearch(searchTerm: string): void {
    this.currentPage = 1;
    const searchFilters = {
      ...this.currentFilters,
      search: searchTerm
    };
    this.loadPosts(searchFilters);
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
    this.showSuggestedUsers = false;
    this.usersService.getAll({ limit: 2 }).subscribe({
      next: (response) => {
        if (response.data?.users) {
          this.suggestedUsers = response.data.users || [];
          this.showSuggestedUsers = true;
        } else {
          this.suggestedUsers = [];
        }
      },
      error: (err) => {
        console.error('Error loading suggested users:', err);
        this.suggestedUsers = [];
        // Don't show error to user, just keep the section hidden
      }
    });
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.categories = response.data.categories || [];
          // Populate tags from fetched categories
          this.tags = this.categories.map(cat => ({ name: cat.name, url: `/category/${cat.slug || cat.id}` }));
        } else {
          this.categories = [];
          this.tags = [];
        }
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        this.categories = [];
        this.tags = [];
      }
    });
  }

  getPostImageUrl(post: Post): string {
    // Ưu tiên sử dụng thumbnail nếu có
    if (post.thumbnail) {
      return post.thumbnail;
    }
    // Nếu không có thumbnail, tìm ảnh featured từ postUploads
    const featuredMedia = post.postUploads?.find(media => media.is_featured);
    if (featuredMedia?.file?.url) {
      return featuredMedia.file.url;
    }
    // Nếu không có ảnh nào, sử dụng ảnh mặc định
    return this.DEFAULT_POST_IMAGE;
  }

  getAuthorImageUrl(author: any): string {
    if (author?.avatar) {
      return author.avatar;
    }
    return this.DEFAULT_AUTHOR_IMAGE;
  }
}
