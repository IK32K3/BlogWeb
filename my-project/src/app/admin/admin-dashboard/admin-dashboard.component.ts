import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderAdminComponent } from 'app/shared/components/header-admin/header-admin.component';
import { SlidebarAdminComponent } from 'app/shared/components/slidebar-admin/slidebar-admin.component';
import { RouterOutlet } from '@angular/router';
import { DashboardService, DashboardStats } from 'app/core/services/dashboard.service';
import { Post } from 'app/shared/model/post.model';
import { UsersService } from 'app/core/services/users.service';
import { BlogPostService } from 'app/core/services/blog-post.service';
import { User } from 'app/shared/model/user.model';
import { CommentsService } from 'app/core/services/comments.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, HeaderAdminComponent, SlidebarAdminComponent, RouterModule,RouterOutlet],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  
  stats: DashboardStats = {
    totalPosts: 0,
    totalUsers: 0,
    totalComments: 0,
    totalViews: 0
  };

  recentPosts: Post[] = [];
  allPosts: Post[] = [];
  allUsers: User[] = [];

  // Recent activities
  recentActivities = [
    {
      user: 'John Doe',
      action: 'published a new post',
      time: '2 minutes ago',
      color: 'green'
    },
    {
      user: 'Jane Smith',
      action: 'commented on a post',
      time: '15 minutes ago',
      color: 'blue'
    },
    {
      user: 'Mike Johnson',
      action: 'updated their profile',
      time: '1 hour ago',
      color: 'yellow'
    },
    {
      user: 'Sarah Wilson',
      action: 'created a new category',
      time: '2 hours ago',
      color: 'purple'
    },
    {
      user: 'Admin',
      action: 'deleted a spam comment',
      time: '3 hours ago',
      color: 'red'
    }
  ];

  constructor(
    private dashboardService: DashboardService,
    private usersService: UsersService,
    private blogPostService: BlogPostService,
    private commentsService: CommentsService
    ) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.dashboardService.getDashboardStats().subscribe(stats => {
      this.stats = stats;
    });

    this.dashboardService.getRecentPosts().subscribe(posts => {
      this.recentPosts = posts;
    });

    this.blogPostService.getAll().subscribe(res => {
      if (res.success) {
        this.allPosts = res.data.posts;
        this.stats.totalPosts = res.data.pagination.total;
        this.stats.totalViews = this.allPosts.reduce((sum, post) => sum + (post.views || 0), 0);
      }
    });

    this.usersService.getAll().subscribe(res => {
      if (res.success) {
        this.allUsers = res.data.users;
        this.stats.totalUsers = res.data.pagination.total;
      }
    });
    this.commentsService.getAllComments().subscribe(res => {
      if (res.success) {
        this.stats.totalComments = res.data.pagination.total;
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Published':
        return 'bg-green-100 text-green-800';
      case 'Draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'Pending':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getActivityColor(color: string): string {
    const colorMap: { [key: string]: string } = {
      green: 'bg-green-400',
      blue: 'bg-blue-400',
      yellow: 'bg-yellow-400',
      purple: 'bg-purple-400',
      red: 'bg-red-400'
    };
    return colorMap[color] || 'bg-gray-400';
  }
}
