import { CommonModule } from '@angular/common';
import { Component ,HostListener  } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sidebar-dashboard',
  imports: [CommonModule,FormsModule],
  standalone: true,
  templateUrl: './sidebar-dashboard.component.html',
  styleUrl: './sidebar-dashboard.component.css'
})
export class SidebarDashboardComponent {
  sidebarOpen = true;

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }
// Optional: Đóng sidebar khi click ngoài
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('aside') && !target.closest('button')) {
      this.sidebarOpen = false;
    }
  }
}
