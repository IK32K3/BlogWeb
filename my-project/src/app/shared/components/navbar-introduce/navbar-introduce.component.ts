import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'navbar-introduce',
  standalone: true,
  imports: [RouterLink,CommonModule], // Nếu bạn cần sử dụng các module khác, hãy thêm vào đây
  // ví dụ: CommonModule, FormsModule, RouterModule, v.v.
  templateUrl: './navbar-introduce.component.html',
  styleUrl: './navbar-introduce.component.css'
})
export class NavbarIntroduceComponent {

}
