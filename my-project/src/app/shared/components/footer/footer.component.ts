import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements AfterViewInit {
  email: string = '';

  // Hàm đăng ký nhận thông báo
  subscribe() {
    if (this.email) {
      console.log('Subscribed email:', this.email);
      // TODO: Gửi request API ở đây
    }
  }

  // Sau khi view được khởi tạo
  ngAfterViewInit(): void {
    window.addEventListener('scroll', () => this.toggleBackToTopButton());
  }

  // Hiển thị hoặc ẩn nút Back to Top
  toggleBackToTopButton(): void {
    const backToTopButton = document.getElementById('back-to-top');
    if (window.scrollY > 200) {
      if (backToTopButton) {
        backToTopButton.classList.remove('hidden');
      }
    } else {
      if (backToTopButton) {
        backToTopButton.classList.add('hidden');
      }
    }
  }

}
