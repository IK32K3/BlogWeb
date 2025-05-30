import { CommonModule } from '@angular/common';
import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BlogPostService } from '../../../core/services/blog-post.service';
import { Post } from '../../model/post.model';

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
  public readonly DEFAULT_POST_IMAGE = 'https://pixahive.com/wp-content/uploads/2021/04/Doraemon-Cartoon-Illustration-410092-pixahive.jpg';
  private readonly DEFAULT_AUTHOR_IMAGE = 'https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg';

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
        const posts: Post[] = res?.data?.posts || res?.data || res?.posts || [];
        this.slides = posts.map((post: Post): Slide => {
          let imageUrl = this.DEFAULT_POST_IMAGE;
          if (post.postMedia && post.postMedia.length > 0) {
            // Ưu tiên ảnh featured và là image
            const featured = post.postMedia.find(pm =>
              pm.is_featured && (pm as any).media?.type === 'image'
            );
            if (featured && (featured as any).media?.url) {
              imageUrl = (featured as any).media.url;
            } else {
              // Nếu không có, lấy ảnh đầu tiên là image
              const firstImage = post.postMedia.find(pm => (pm as any).media?.type === 'image');
              if (firstImage && (firstImage as any).media?.url) {
                imageUrl = (firstImage as any).media.url;
              }
            }
          }
          return {
            image: imageUrl,
            title: post.title || 'No Title',
            author: post.user?.username || 'Unknown Author',
            date: new Date(post.created_at).toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            }),
            authorImage: this.DEFAULT_AUTHOR_IMAGE,
            category: post.categories?.name || 'Uncategorized',
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