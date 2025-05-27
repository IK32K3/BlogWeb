import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { HomeService } from '../services/home.service';

@Component({
  selector: 'app-introduce-page',
  imports: [CommonModule,RouterLink,RouterOutlet,FormsModule,SharedModule],
  templateUrl: './introduce-page.component.html',
  styleUrl: './introduce-page.component.css'
})
export class IntroducePageComponent implements OnInit {
  posts: any[] = [];

  constructor(private homeService: HomeService) {}

  ngOnInit() {
    this.homeService.getPosts().subscribe((res: any) => {
      this.posts = res.data.posts;
    });
  }
}
