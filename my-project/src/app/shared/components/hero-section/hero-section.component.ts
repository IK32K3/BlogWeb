import { CommonModule } from '@angular/common';
import { Component, OnInit, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-hero-section',
  imports: [FormsModule,CommonModule],
  standalone: true,
  templateUrl: './hero-section.component.html',
  styleUrl: './hero-section.component.css'
})
export class HeroSectionComponent implements OnInit {
  currentIndex = 0;
  intervalId: any;

  slides = [
    {
      image: 'https://vcdn1-giaitri.vnecdn.net/2023/04/28/doraemon4-1682675790-8961-1682675801.jpg',
      title: 'Tips for Hosting an Easy Birthday Party',
      author: 'David Smith',
      date: 'February 10, 2024',
      authorImage: 'https://vcdn1-giaitri.vnecdn.net/2023/04/28/doraemon4-1682675790-8961-1682675801.jpg'
    },
    {
      image: 'https://upload.wikimedia.org/wikipedia/en/1/17/Doraemon_character.png',
      title: 'Tips for Hosting an Easy Birthday Party',
      author: 'David Smith',
      date: 'February 10, 2024',
      authorImage: 'https://vcdn1-giaitri.vnecdn.net/2023/04/28/doraemon4-1682675790-8961-1682675801.jpg'
    },
    {
      image: 'https://cdn.tuoitre.vn/thumb_w/730/471584752817336320/2023/5/18/photo-3-16844085569911047870668.jpg',
      title: 'Tips for Hosting an Easy Birthday Party',
      author: 'David Smith',
      date: 'February 10, 2024',
      authorImage: 'https://vcdn1-giaitri.vnecdn.net/2023/04/28/doraemon4-1682675790-8961-1682675801.jpg'
    }
  ];

  ngOnInit() {
    this.startAutoSlide();
  }

  getTransform(): string {
    return `translateX(-${this.currentIndex * 100}%)`;
  }

  nextSlide() {
    this.currentIndex = (this.currentIndex + 1) % this.slides.length;
  }

  prevSlide() {
    this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
  }

  setSlide(index: number) {
    this.currentIndex = index;
  }

  startAutoSlide() {
    this.intervalId = setInterval(() => this.nextSlide(), 3000);
  }

  stopAutoSlide() {
    clearInterval(this.intervalId);
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

