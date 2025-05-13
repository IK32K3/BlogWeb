import { Component } from '@angular/core';
import { HeaderDashboardComponent } from '../../shared/components/header-dashboard/header-dashboard.component';
import { SidebarDashboardComponent } from '../../shared/components/sidebar-dashboard/sidebar-dashboard.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router'; // Import RouterOutlet if you need routing in your shared module

@Component({
  selector: 'app-dashboard-main',
  imports: [CommonModule,FormsModule,RouterOutlet,HeaderDashboardComponent, SidebarDashboardComponent],
  templateUrl: './dashboard-main.component.html',
  styleUrl: './dashboard-main.component.css'
})
export class DashboardMainComponent {

}
