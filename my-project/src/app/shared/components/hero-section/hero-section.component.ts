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
      image: 'https://cdn2.tuoitre.vn/zoom/700_700/471584752817336320/2024/6/3/doraemon-3-17173722166781704981911-30-9-657-1207-crop-1717372336444425413969.jpeg',
      title: 'Tips for Hosting an Easy Birthday Party',
      author: 'David Smith',
      date: 'February 10, 2024',
      authorImage: 'https://cdn2.tuoitre.vn/zoom/700_700/471584752817336320/2024/6/3/doraemon-3-17173722166781704981911-30-9-657-1207-crop-1717372336444425413969.jpeg'
    },
    {
      image: 'https://cdn2.tuoitre.vn/zoom/700_700/471584752817336320/2024/6/3/doraemon-3-17173722166781704981911-30-9-657-1207-crop-1717372336444425413969.jpeg',
      title: 'Tips for Hosting an Easy Birthday Party',
      author: 'David Smith',
      date: 'February 10, 2024',
      authorImage: 'https://cdn2.tuoitre.vn/zoom/700_700/471584752817336320/2024/6/3/doraemon-3-17173722166781704981911-30-9-657-1207-crop-1717372336444425413969.jpeg'
    },
    {
      image: 'https://cdn2.tuoitre.vn/zoom/700_700/471584752817336320/2024/6/3/doraemon-3-17173722166781704981911-30-9-657-1207-crop-1717372336444425413969.jpeg',
      title: 'Tips for Hosting an Easy Birthday Party',
      author: 'David Smith',
      date: 'February 10, 2024',
      authorImage: 'https://cdn2.tuoitre.vn/zoom/700_700/471584752817336320/2024/6/3/doraemon-3-17173722166781704981911-30-9-657-1207-crop-1717372336444425413969.jpeg'
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

