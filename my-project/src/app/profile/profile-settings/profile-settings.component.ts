import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { NavBarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { SharedModule } from 'app/shared/shared.module';
import { HeaderComponent } from 'app/shared/components/header/header.component';

@Component({
  selector: 'app-profile-settings',
  imports: [CommonModule, RouterOutlet, FormsModule, HeaderComponent, FooterComponent],
  templateUrl: './profile-settings.component.html',
  styleUrl: './profile-settings.component.css'
})
export class ProfileSettingsComponent {
  tabs = [
        { key: 'posts', label: 'Posts', icon: 'fas fa-newspaper' },
        { key: 'saved', label: 'Saved', icon: 'fas fa-bookmark' },
        { key: 'likes', label: 'Likes', icon: 'fas fa-heart' }
    ];

    selectedTab = 'posts'; // Default selected tab

    selectTab(tabKey: string, event: Event) {
        event.preventDefault();
        this.selectedTab = tabKey;
    }

posts = [
    {
      category: 'Career',
      date: 'May 28, 2024',
      title: "I'm proud of job hopping between Amazon, Microsoft, and Google",
      description: "Company loyalty is dead. In today's fast-moving tech landscape, strategic career moves can accelerate your growth more than staying put ever could.",
      views: '1.9K',
      comments: 44,
      imageUrl: 'https://images.unsplash.com/photo-1521791055366-0d553872125f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      categoryColor: 'blue'
    },
    {
      category: 'Resources',
      date: '5 days ago',
      title: "Resources that got me into Amazon, Microsoft, and Google",
      description: "After helping dozens of engineers land jobs at top tech companies, I've compiled the most effective resources and strategies that actually work.",
      views: '3.2K',
      comments: 87,
      imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      categoryColor: 'green'
    },
    {
      category: 'Productivity',
      date: '2 weeks ago',
      title: 'The morning routine that doubled my productivity',
      description: "After years of experimenting with different routines, I've found the perfect combination of habits that help me accomplish more before 9am than most people do all day.",
      views: '5.7K',
      comments: 132,
      imageUrl: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      categoryColor: 'purple'
    }
  ];
savedPosts = [
    {
      category: 'Career',
      date: 'May 28, 2024',
      title: 'I\'m proud of job hopping between Amazon, Microsoft, and Google',
      description: 'Company loyalty is dead. In today\'s fast-moving tech landscape...',
      views: '1.9K',
      comments: 44,
      imageUrl: 'https://images.unsplash.com/photo-1521791055366-0d553872125f?auto=format&fit=crop&w=600&q=80',
    },
    {
      category: 'Resources',
      date: '5 days ago',
      title: 'Resources that got me into Amazon, Microsoft, and Google',
      description: 'After helping dozens of engineers land jobs at top tech companies...',
      views: '3.2K',
      comments: 87,
      imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
    }
  ];

  constructor() { }

  ngOnInit(): void { }

  socialLinks = [
    { href: '#', iconClass: 'fab fa-twitter fa-lg', colorClass: 'text-blue-400', hoverClass: 'hover:text-blue-700' },
    { href: '#', iconClass: 'fab fa-linkedin fa-lg', colorClass: 'text-blue-600', hoverClass: 'hover:text-blue-800' },
    { href: '#', iconClass: 'fab fa-github fa-lg', colorClass: 'text-gray-800', hoverClass: 'hover:text-black' },
    { href: '#', iconClass: 'fab fa-youtube fa-lg', colorClass: 'text-red-500', hoverClass: 'hover:text-red-700' }
  ];
  followingList = [
    {
      name: 'MarketWatch, Inc',
      logoUrl: 'https://logo.clearbit.com/marketwatch.com',
      link: '#',
    },
    {
      name: 'Change Your Mind',
      logoUrl: 'https://logo.clearbit.com/medium.com',
      link: '#',
    },
    {
      name: 'Supportive SE',
      logoUrl: 'https://logo.clearbit.com/github.com',
      link: '#',
    },
    {
      name: 'Better Programming',
      logoUrl: 'https://logo.clearbit.com/programming.com',
      link: '#',
    },
    {
      name: 'Edward Huang',
      logoUrl: 'https://logo.clearbit.com/linkedin.com',
      link: '#',
    }
  ];
}
  
