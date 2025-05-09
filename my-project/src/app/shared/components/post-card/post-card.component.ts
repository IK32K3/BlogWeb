import { CommonModule } from '@angular/common';
import { Component ,Input  } from '@angular/core';
// import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-post-card',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './post-card.component.html',
  styleUrl: './post-card.component.css'
})
export class PostCardComponent {
  posts = [
    {
      id: 1,
      title: '5 Effective Ways to Find Focus in Busy Times',
      description: 'Discover practical strategies to maintain focus and productivity during hectic periods of your life.',
      imageUrl: 'https://yt3.googleusercontent.com/qGrcViAdsmfdL8NhR03s6jZVi2AP4A03XeBFShu2M4Jd88k1fNXDnpMEmHU6CvNJuMyA2z1maA0=s900-c-k-c0x00ffffff-no-rj',
      category: 'Productivity',
      author: 'David Smith',
      date: 'Feb 10, 2023',
      readTime: '5 min read'
    },
    {
      id: 2,
      title: 'Get the Most Out of Iceland: 10 Essential Tips',
      description: 'Expert advice for making your Icelandic adventure unforgettable, from hidden gems to practical advice.',
      imageUrl: 'https://yt3.googleusercontent.com/qGrcViAdsmfdL8NhR03s6jZVi2AP4A03XeBFShu2M4Jd88k1fNXDnpMEmHU6CvNJuMyA2z1maA0=s900-c-k-c0x00ffffff-no-rj',
      category: 'Travel',
      author: 'Sarah Johnson',
      date: 'Jan 28, 2023',
      readTime: '7 min read'
    },
    {
      id: 3,
      title: '7 Inspiring Holiday Decor Ideas for Your Home',
      description: 'Creative and festive decoration ideas to transform your living space into a winter wonderland.',
      imageUrl: 'https://yt3.googleusercontent.com/qGrcViAdsmfdL8NhR03s6jZVi2AP4A03XeBFShu2M4Jd88k1fNXDnpMEmHU6CvNJuMyA2z1maA0=s900-c-k-c0x00ffffff-no-rj',
      category: 'Lifestyle',
      author: 'Michael Brown',
      date: 'Dec 15, 2022',
      readTime: '4 min read'
    }
  ];
}
