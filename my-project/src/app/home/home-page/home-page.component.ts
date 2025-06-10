import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterOutlet } from '@angular/router';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { HeroSectionComponent } from '../../shared/components/hero-section/hero-section.component';
import { BlogPostService } from '../../core/services/blog-post.service';
import { CategoryService } from '../../core/services/category.service';
import { Post } from '../../shared/model/post.model';
import { Category } from '../../shared/model/category.model';
import { PostCardComponent } from '../../shared/components/post-card/post-card.component';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterOutlet,
    RouterLink,
    SharedModule,
    FooterComponent,
    HeroSectionComponent,
    PostCardComponent
  ],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent implements OnInit {
  posts: Post[] = [];
  displayedPosts: Post[] = [];
  popularPosts: Post[] = [];
  categories: Category[] = [];
  currentPage = 1;
  totalPages = 1;
  POSTS_PER_PAGE = 9;
  isLoading = false;
  isLoadingPopular = false;
  isLoadingCategories = false;
  isFading = false;

  constructor(
    private blogPostService: BlogPostService,
    private categoryService: CategoryService
  ) {}

  ngOnInit() {
    this.loadPosts();
    this.loadPopularPosts();
    this.loadCategories();
  }

  loadPosts() {
    this.isLoading = true;
    this.blogPostService.getAll({
      status: 'published'
    }).subscribe({
      next: (response) => {
        if (response.success && response.data && response.data.posts) {
          this.posts = response.data.posts;
          this.totalPages = Math.ceil(this.posts.length / this.POSTS_PER_PAGE);
          this.updateDisplayedPosts();
          console.log('posts:', this.posts);
          console.log('displayedPosts:', this.displayedPosts);
        } else {
          this.posts = [];
          this.displayedPosts = [];
          this.totalPages = 1;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading posts:', error);
        this.isLoading = false;
        this.posts = [];
        this.displayedPosts = [];
        this.totalPages = 1;
      }
    });
  }

  updateDisplayedPosts() {
    const start = (this.currentPage - 1) * this.POSTS_PER_PAGE;
    const end = start + this.POSTS_PER_PAGE;
    this.displayedPosts = this.posts.slice(start, end);
  }

  loadPopularPosts() {
    this.isLoadingPopular = true;
    this.blogPostService.getAll({
      status: 'published',
      sort_by: 'views',
      sort_order: 'desc',
      limit: 4
    }).subscribe({
      next: (response) => {
        if (response.success && response.data && response.data.posts) {
          this.popularPosts = response.data.posts;
        } else {
          this.popularPosts = [];
        }
        this.isLoadingPopular = false;
      },
      error: (error) => {
        console.error('Error loading popular posts:', error);
        this.isLoadingPopular = false;
        this.popularPosts = [];
      }
    });
  }

  loadCategories() {
    this.isLoadingCategories = true;
    this.categoryService.getAll().subscribe({
      next: (response) => {
        this.categories = response.data.categories;
        this.isLoadingCategories = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.isLoadingCategories = false;
      }
    });
  }

  onPageChange(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.isFading = true;
    setTimeout(() => {
      this.currentPage = page;
      this.updateDisplayedPosts();
      this.isFading = false;
      window.scrollTo({ top: 600, behavior: 'smooth' });
    }, 300); // 300ms là thời gian fade out
  }

  getPagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}
