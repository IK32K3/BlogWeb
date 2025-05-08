import { CommonModule } from '@angular/common';
import { Component ,Input  } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-post-card',
  imports: [CommonModule,RouterLink],
  standalone: true,
  templateUrl: './post-card.component.html',
  styleUrl: './post-card.component.css'
})
export class PostCardComponent {
  @Input() post: any;
  posts = [
    {
      id: 1,
      title: '5 Effective Ways to Find Focus in Busy Times',
      author: 'David Smith',
      date: 'Feb 10, 2023',
      time: '5 min read',
      category: 'Productivity',
      image: 'image_url',
      content: 'Discover practical strategies...',
    },
    // Thêm các bài viết khác
  ];
}
