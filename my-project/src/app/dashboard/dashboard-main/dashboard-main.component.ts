import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { HeaderDashboardComponent } from '../../shared/components/header-dashboard/header-dashboard.component';
import { SidebarDashboardComponent } from '../../shared/components/sidebar-dashboard/sidebar-dashboard.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router'; // Import RouterOutlet if you need routing in your shared module
import { Chart } from 'chart.js';


@Component({
  selector: 'app-dashboard-main',
  imports: [CommonModule,FormsModule,RouterOutlet,HeaderDashboardComponent, SidebarDashboardComponent],
  templateUrl: './dashboard-main.component.html',
  styleUrl: './dashboard-main.component.css'
})
export class DashboardMainComponent implements AfterViewInit {
  username = 'Conan';
  stats = [
    {
      title: 'Total Views',
      value: '12,458',
      change: '24.3%',
      icon: 'fa-eye',
      progress: 75,
      goalText: '75% of monthly goal',
      color: 'indigo'
    },
    {
      title: 'Engagement Rate',
      value: '42.6%',
      change: '8.2%',
      icon: 'fa-heart',
      progress: 42,
      goalText: 'Industry avg: 38%',
      color: 'green'
    },
    {
      title: 'New Subscribers',
      value: '1,243',
      change: '15.7%',
      icon: 'fa-users',
      progress: 62,
      goalText: '62% of monthly goal',
      color: 'blue'
    },
    {
      title: 'Estimated Revenue',
      value: '$3,245',
      change: '32.1%',
      icon: 'fa-dollar-sign',
      progress: 54,
      goalText: '54% of monthly goal',
      color: 'purple'
    }
  ];

  topPosts = [
    { title: 'Getting Started with React Hooks', views: 2456, comments: 84, color: 'indigo' },
    { title: 'CSS Grid vs Flexbox', views: 1987, comments: 56, color: 'green' },
    { title: 'JavaScript ES6 Features', views: 1753, comments: 42, color: 'blue' },
    { title: 'TypeScript Best Practices', views: 1542, comments: 37, color: 'purple' }
  ];

  @ViewChild('trafficChart', { static: true }) trafficChartRef!: ElementRef<HTMLCanvasElement>;
  trafficChart: any;

  posts = [
    {
      title: 'Getting Started with React Hooks',
      views: '2,456',
      comments: '84',
      iconClass: 'bg-indigo-100 text-indigo-600'
    },
    {
      title: 'CSS Grid vs Flexbox',
      views: '1,987',
      comments: '56',
      iconClass: 'bg-green-100 text-green-600'
    },
    {
      title: 'JavaScript ES6 Features',
      views: '1,753',
      comments: '42',
      iconClass: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'TypeScript Best Practices',
      views: '1,542',
      comments: '37',
      iconClass: 'bg-purple-100 text-purple-600'
    }
  ];

  ngAfterViewInit() {
    this.createChart(30); // Mặc định là 30 ngày
  }

  updateChart(event: Event) {
    const selectedDays = parseInt((event.target as HTMLSelectElement).value, 10);
    this.createChart(selectedDays);
  }

  createChart(days: number) {
    const labels =
      days === 7
        ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        : Array.from({ length: days }, (_, i) => (days === 30 ? `Day ${i + 1}` : `Week ${i + 1}`));

    const pageViews = Array.from({ length: days }, () =>
      Math.floor(Math.random() * (days === 7 ? 500 : days === 30 ? 1000 : 3000)) + (days === 7 ? 300 : days === 30 ? 500 : 1000)
    );

    const uniqueVisitors = Array.from({ length: days }, () =>
      Math.floor(Math.random() * (days === 7 ? 400 : days === 30 ? 800 : 2500)) + (days === 7 ? 200 : days === 30 ? 300 : 800)
    );

    if (this.trafficChart) {
      this.trafficChart.destroy(); // Xoá biểu đồ cũ nếu có
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
              color: '#e5e7eb', // Chỉnh borderColor hợp lệ
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
    {
      title: 'Post shared 18 times',
      description: '"Getting Started with Next.js" was shared across platforms',
      timeAgo: '2 days ago',
      icon: 'fa-share-alt',
      iconClass: 'bg-purple-100 text-purple-600'
    }
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

  constructor() { }

  ngOnInit(): void {
  }
}

