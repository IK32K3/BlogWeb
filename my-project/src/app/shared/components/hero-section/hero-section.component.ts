import { CommonModule } from '@angular/common';
import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BlogPostService } from '../../../core/services/blog-post.service';
import { Post } from '../../model/post.model';
import { DEFAULT_POST_IMAGE, DEFAULT_AUTHOR_IMAGE } from '../../../core/constants/app-constants';

interface Slide {
  image: string;
  title: string;
  author: string;
  date: string;
  authorImage: string;
  category: string;
  slug?: string;
}

@Component({
  selector: 'app-hero-section',
  imports: [FormsModule, CommonModule],
  standalone: true,
  templateUrl: './hero-section.component.html',
  styleUrl: './hero-section.component.css'
})
export class HeroSectionComponent implements OnInit, OnDestroy {
  currentIndex = 0;
  intervalId: any;
  slides: Slide[] = [];

  // Ảnh fallback
  public readonly DEFAULT_POST_IMAGE = DEFAULT_POST_IMAGE;
  private readonly DEFAULT_AUTHOR_IMAGE = DEFAULT_AUTHOR_IMAGE;

  constructor(private blogPostService: BlogPostService) {}

  ngOnInit() {
    // Lấy 4 bài viết đã published mới nhất cho hero section
    this.blogPostService.getAll({
      status: 'published',
      limit: 4,
      sortBy: 'created_at',
      order: 'desc'
    }).subscribe({
      next: (res) => {
        const posts: Post[] = res?.data?.posts || [];
        this.slides = posts.map((post: Post): Slide => {
          console.log('created_at:', post.created_at);
          
          let imageUrl = this.DEFAULT_POST_IMAGE;
          if (post.thumbnail) {
            imageUrl = post.thumbnail;
          }
          
          return {
            image: imageUrl,
            title: post.title || 'No Title',
            author: post.author?.username || 'Unknown Author',
            date: post.created_at ? new Date(post.created_at).toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            }) : 'N/A',
            authorImage: post.author?.avatar || this.DEFAULT_AUTHOR_IMAGE,
            category: post.category?.name || 'Uncategorized',
            slug: post.slug
          };
        });

        if (this.slides.length > 0) {
          this.startAutoSlide();
        }
      },
      error: (err) => {
        console.error('Error fetching posts for hero section:', err);
      }
    });
  }

  ngOnDestroy() {
    this.stopAutoSlide();
  }

  getTransform(): string {
    return `translateX(-${this.currentIndex * 100}%)`;
  }

  nextSlide() {
    if (this.slides.length === 0) return;
    this.currentIndex = (this.currentIndex + 1) % this.slides.length;
  }

  prevSlide() {
    if (this.slides.length === 0) return;
    this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
  }

  setSlide(index: number) {
    if (this.slides.length === 0) return;
    this.currentIndex = index;
  }

  startAutoSlide() {
    if (this.slides.length > 1) {
      this.stopAutoSlide();
      this.intervalId = setInterval(() => this.nextSlide(), 5000);
    }
  }

  stopAutoSlide() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  @HostListener('mouseenter')
  onMouseEnter() {
    this.stopAutoSlide();
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.startAutoSlide();
  }
}