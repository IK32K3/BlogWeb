import { Component, ViewChild, ElementRef, AfterViewInit, OnInit } from '@angular/core';
import { HeaderDashboardComponent } from '../../shared/components/header-dashboard/header-dashboard.component';
import { SidebarDashboardComponent } from '../../shared/components/sidebar-dashboard/sidebar-dashboard.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet, Router } from '@angular/router';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { SharedModule } from 'app/shared/shared.module';
import { HttpClientModule } from '@angular/common/http';
import { BlogPostService } from 'app/core/services/blog-post.service';
import { Post } from 'app/shared/model/post.model';

// Đăng ký các thành phần cần thiết cho biểu đồ line
Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Tooltip,
  Legend,
  Filler
);

@Component({
  selector: 'app-dashboard-main',
  imports: [CommonModule,FormsModule,RouterOutlet,HttpClientModule,HeaderDashboardComponent,SidebarDashboardComponent],
  templateUrl: './dashboard-main.component.html',
  styleUrl: './dashboard-main.component.css'
})
export class DashboardMainComponent implements AfterViewInit, OnInit {
  username = 'Conan';
  stats: any[] = [];
  topPosts: Post[] = [];
  posts: Post[] = [];
  loading = true;
  error: string | null = null;
  @ViewChild('trafficChart', { static: true }) trafficChartRef!: ElementRef<HTMLCanvasElement>;
  trafficChart: any;
  subscribeEmail: string = '';
  subscribeSuccess: boolean = false;
  subscribeCount: number = 0;
  isOverviewRoute = false;

  constructor(private blogPostService: BlogPostService, private router: Router) { }

  ngOnInit(): void {
    this.loadUserPosts();
    this.router.events.subscribe(() => {
      // Check if the current route is exactly /dashboard/dashboard-blogger
      this.isOverviewRoute = this.router.url === '/dashboard/dashboard-blogger';
    });
  }

  loadUserPosts() {
    this.loading = true;
    this.blogPostService.getMyPosts().subscribe({
      next: (res) => {
        this.posts = res.data.posts || [];
        this.updateStatsAndTopPosts();
        this.createChart(30);
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load posts. Please try again later.';
        this.loading = false;
        console.error('Error loading posts:', error);
      }
    });
  }

  updateStatsAndTopPosts() {
    // Total Views
    const totalViews = this.posts.reduce((sum, post) => sum + (post.views || 0), 0);
    // Top 4 posts by views
    this.topPosts = [...this.posts].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 4);
    // Update stats
    this.stats = [
      {
        title: 'Total Views',
        value: totalViews.toLocaleString(),
        change: '+0%',
        icon: 'fa-eye',
        progress: 100,
        goalText: '',
        color: 'indigo'
      },
      // Các stats khác giữ nguyên hoặc cập nhật nếu có dữ liệu
    ];
  }

  ngAfterViewInit() {
    // createChart sẽ được gọi lại sau khi loadUserPosts xong
  }

  updateChart(event: Event) {
    const selectedDays = parseInt((event.target as HTMLSelectElement).value, 10);
    this.createChart(selectedDays);
  }

  createChart(days: number) {
    // Tạo labels cho biểu đồ
    const labels = Array.from({ length: days }, (_, i) => `Day ${i + 1}`);
    // Giả lập dữ liệu views mỗi ngày từ các bài viết (nếu có trường viewsByDay thì dùng, nếu không thì chia đều)
    let pageViews = new Array(days).fill(0);
    this.posts.forEach(post => {
      // Nếu có trường viewsByDay thì cộng dồn, nếu không thì chia đều tổng views
      if ((post as any).viewsByDay && Array.isArray((post as any).viewsByDay)) {
        (post as any).viewsByDay.slice(0, days).forEach((v: number, idx: number) => {
          pageViews[idx] += v;
        });
      } else {
        const avg = Math.floor((post.views || 0) / days);
        for (let i = 0; i < days; i++) pageViews[i] += avg;
      }
    });
    // Unique visitors: giả lập bằng 60% pageViews
    const uniqueVisitors = pageViews.map(v => Math.floor(v * 0.6));
    if (this.trafficChart) {
      this.trafficChart.destroy();
    }
    this.trafficChart = new Chart(this.trafficChartRef.nativeElement.getContext('2d')!, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Page Views',
            data: pageViews,
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            tension: 0.3,
            fill: true,
            borderWidth: 2,
          },
          {
            label: 'Unique Visitors',
            data: uniqueVisitors,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.3,
            fill: true,
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 20,
            },
          },
          tooltip: {
            mode: 'index',
            intersect: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: '#e5e7eb',
            },
          },
          x: {
            grid: {
              display: false,
            },
          },
        },
      },
    });
  }

  recentActivities = [
    {
      title: 'New comment on "React Hooks Guide"',
      description: '"Great article! Helped me understand useEffect better." - John Doe',
      timeAgo: '2 hours ago',
      icon: 'fa-comment',
      iconClass: 'bg-indigo-100 text-indigo-600'
    },
    {
      title: '25 new subscribers',
      description: 'From your latest newsletter "CSS Tips and Tricks"',
      timeAgo: '5 hours ago',
      icon: 'fa-user-plus',
      iconClass: 'bg-green-100 text-green-600'
    },
    {
      title: 'Post liked by 42 users',
      description: '"JavaScript Performance Optimization" received 42 likes',
      timeAgo: '1 day ago',
      icon: 'fa-thumbs-up',
      iconClass: 'bg-blue-100 text-blue-600'
    },
  ];

  quickActions = [
    {
      label: 'New Post',
      icon: 'fa-plus',
      iconBackground: 'bg-indigo-100 text-indigo-600'
    },
    {
      label: 'Add Media',
      icon: 'fa-image',
      iconBackground: 'bg-green-100 text-green-600'
    },
    {
      label: 'Newsletter',
      icon: 'fa-envelope',
      iconBackground: 'bg-blue-100 text-blue-600'
    },
    {
      label: 'Analytics',
      icon: 'fa-chart-line',
      iconBackground: 'bg-purple-100 text-purple-600'
    }
  ];

  blogPerformance = [
    {
      title: 'Content Quality',
      status: 'Excellent',
      progress: 92,
      progressClass: 'bg-green-500'
    },
    {
      title: 'Engagement',
      status: 'Good',
      progress: 78,
      progressClass: 'bg-blue-500'
    },
    {
      title: 'Publishing Frequency',
      status: 'Average',
      progress: 65,
      progressClass: 'bg-yellow-500'
    }
  ];

  getPostIconClass(post: Post): string {
    const colors = ['indigo', 'green', 'blue', 'purple'];
    const color = colors[post.id % colors.length];
    return `bg-${color}-100 text-${color}-600`;
  }

  onSubscribe() {
    // Xử lý subscribe (giả lập)
    this.subscribeSuccess = true;
    this.subscribeCount++;
    setTimeout(() => {
      this.subscribeSuccess = false;
      this.subscribeEmail = '';
    }, 2000);
  }
}

