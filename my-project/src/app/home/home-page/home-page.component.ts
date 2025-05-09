import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NavBarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { HeroSectionComponent } from '../../shared/components/hero-section/hero-section.component';

@Component({
  selector: 'app-home-page',
  imports: [CommonModule,FormsModule,RouterOutlet,NavBarComponent,FooterComponent,HeroSectionComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent {
 posts = [
  { 
    id: 1, 
    title: "What Are Your Tips for Hosting an Easy Birthday Party?", 
    description: "Learn how to throw a memorable party without the stress. Perfect for busy people who still want to celebrate.", 
    category: "Lifestyle", 
    date: "May 15, 2023", 
    imageUrl: "https://yt3.googleusercontent.com/qGrcViAdsmfdL8NhR03s6jZVi2AP4A03XeBFShu2M4Jd88k1fNXDnpMEmHU6CvNJuMyA2z1maA0=s900-c-k-c0x00ffffff-no-rj", 
    link: "/path-to-article-1"
  },
  { 
    id: 2, 
    title: "Exploring the Beauty of Nature in Vietnam", 
    description: "Discover hidden gems and breathtaking landscapes in Vietnam's countryside and national parks.", 
    category: "Travel", 
    date: "May 15, 2023", 
    imageUrl: "https://yt3.googleusercontent.com/qGrcViAdsmfdL8NhR03s6jZVi2AP4A03XeBFShu2M4Jd88k1fNXDnpMEmHU6CvNJuMyA2z1maA0=s900-c-k-c0x00ffffff-no-rj", 
    link: "/path-to-article-2"
  },
  { 
    id: 3, 
    title: "Creating a Cozy Home Environment", 
    description: "Simple tips to transform your living space into a warm and inviting sanctuary.", 
    category: "Home", 
    date: "May 10, 2023", 
    imageUrl: "https://yt3.googleusercontent.com/qGrcViAdsmfdL8NhR03s6jZVi2AP4A03XeBFShu2M4Jd88k1fNXDnpMEmHU6CvNJuMyA2z1maA0=s900-c-k-c0x00ffffff-no-rj", 
    link: "/path-to-article-3"
  },
  { 
    id: 4, 
    title: "What Are Your Tips for Hosting an Easy Birthday Party?", 
    description: "Learn how to throw a memorable party without the stress. Perfect for busy people who still want to celebrate.", 
    category: "Lifestyle", 
    date: "May 15, 2023", 
    imageUrl: "https://yt3.googleusercontent.com/qGrcViAdsmfdL8NhR03s6jZVi2AP4A03XeBFShu2M4Jd88k1fNXDnpMEmHU6CvNJuMyA2z1maA0=s900-c-k-c0x00ffffff-no-rj", 
    link: "/path-to-article-1"
  },
  { 
    id: 5, 
    title: "What Are Your Tips for Hosting an Easy Birthday Party?", 
    description: "Learn how to throw a memorable party without the stress. Perfect for busy people who still want to celebrate.", 
    category: "Lifestyle", 
    date: "May 15, 2023", 
    imageUrl: "https://yt3.googleusercontent.com/qGrcViAdsmfdL8NhR03s6jZVi2AP4A03XeBFShu2M4Jd88k1fNXDnpMEmHU6CvNJuMyA2z1maA0=s900-c-k-c0x00ffffff-no-rj", 
    link: "/path-to-article-1"
  },
  { 
    id: 6, 
    title: "What Are Your Tips for Hosting an Easy Birthday Party?", 
    description: "Learn how to throw a memorable party without the stress. Perfect for busy people who still want to celebrate.", 
    category: "Lifestyle", 
    date: "May 15, 2023", 
    imageUrl: "https://yt3.googleusercontent.com/qGrcViAdsmfdL8NhR03s6jZVi2AP4A03XeBFShu2M4Jd88k1fNXDnpMEmHU6CvNJuMyA2z1maA0=s900-c-k-c0x00ffffff-no-rj", 
    link: "/path-to-article-1"
  },
  // Thêm bài viết khác nếu cần
];

    popularPosts = [
    { rank: 1, title: "How to Learn Programming Faster", date: "May 1, 2023" },
    { rank: 2, title: "Best Travel Destinations for 2023", date: "April 28, 2023" },
    { rank: 3, title: "Minimalist Living: Less is More", date: "April 25, 2023" },
    { rank: 4, title: "The Future of Remote Work", date: "April 22, 2023" },
  ];

  categories = [
    { name: "Technology", link: "#" },
    { name: "Lifestyle", link: "#" },
    { name: "Travel", link: "#" },
    { name: "Health", link: "#" },
    { name: "Food", link: "#" },
    { name: "Home", link: "#" },
  ];
}
