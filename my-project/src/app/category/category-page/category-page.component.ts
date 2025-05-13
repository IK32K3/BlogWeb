import { Component ,OnInit  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { NavBarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { FilterMovieComponent } from '../../shared/components/filter-movie/filter-movie.component';

@Component({
  selector: 'app-category-page',
  imports: [CommonModule,FormsModule,RouterOutlet,NavBarComponent,FooterComponent,FilterMovieComponent],
  templateUrl: './category-page.component.html',
  styleUrl: './category-page.component.css'
})
export class CategoryPageComponent implements OnInit {
posts = [
    {
      title: 'Tiêu đề bài viết hấp dẫn về phong cách sống',
      category: 'Lifestyle',
      categoryColor: 'blue',
      views: '1.2K',
      comments: 45,
      description: 'Khám phá những bí quyết giúp bạn có một lối sống lành mạnh và cân bằng giữa công việc và cuộc sống cá nhân...',
      author: 'Nguyễn Thị A',
      date: '20/03/2025',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      image: 'https://vcdn1-giaitri.vnecdn.net/2023/04/28/doraemon4-1682675790-8961-1682675801.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=EAxUAFcakJsi4GQW0mYsCQ'
    },
    {
      title: '10 điểm đến không thể bỏ qua tại Đà Lạt',
      category: 'Du lịch',
      categoryColor: 'green',
      views: '2.4K',
      comments: 78,
      description: 'Khám phá những địa điểm tuyệt vời nhất ở thành phố ngàn hoa, từ những đồi thông bạt ngàn đến những quán café độc đáo...',
      author: 'Trần Văn B',
      date: '18/03/2025',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      image: 'https://vcdn1-giaitri.vnecdn.net/2023/04/28/doraemon4-1682675790-8961-1682675801.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=EAxUAFcakJsi4GQW0mYsCQ'
    },
    {
      title: 'Cách làm bánh flan caramel hoàn hảo',
      category: 'Ẩm thực',
      categoryColor: 'red',
      views: '3.1K',
      comments: 112,
      description: 'Bí quyết để có món bánh flan mềm mịn, thơm ngon với lớp caramel vàng óng đúng chuẩn phong cách Pháp...',
      author: 'Lê Thị C',
      date: '15/03/2025',
      avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
      image: 'https://vcdn1-giaitri.vnecdn.net/2023/04/28/doraemon4-1682675790-8961-1682675801.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=EAxUAFcakJsi4GQW0mYsCQ'
    }
  ];
currentPage: number = 2; // Trang hiện tại, ví dụ: trang 2
  totalPages: number = 10; // Tổng số trang
  pages: number[] = [];

  constructor() {
    this.calculatePages();
  }

  calculatePages(): void {
    this.pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      this.pages.push(i);
    }
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }
newposts = [
    { title: '5 điều tôi ước biết trước khi đi du lịch Nhật Bản', date: '15/01/2025', url: '#' },
    { title: 'Tất cả những gì bạn cần biết khi thăm Bali', date: '12/01/2025', url: '#' },
    { title: 'Cách có một kỳ nghỉ thú vị với ngân sách hạn chế', date: '10/01/2025', url: '#' },
    { title: '10 địa điểm đẹp nhất để chụp ảnh tại Đà Lạt', date: '08/01/2025', url: '#' }
  ];

  followSuggestions = [
    { name: 'Letters from Rosie', bio: 'Tôi yêu sự cô độc nhưng tôi sinh ra để yêu thương 🌿...', profileImg: 'https://randomuser.me/api/portraits/women/44.jpg' },
    { name: 'Android Developers', bio: 'Bài viết về công cụ và tài nguyên hiện đại giúp bạn xây dựng...', profileImg: 'https://randomuser.me/api/portraits/men/32.jpg' }
  ];

  tags = [
    { name: 'du lịch', url: '#' },
    { name: 'ẩm thực', url: '#' },
    { name: 'công nghệ', url: '#' },
    { name: 'sức khỏe', url: '#' },
    { name: 'thể thao', url: '#' },
    { name: 'giáo dục', url: '#' }
  ];


  ngOnInit(): void { }
}
