import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { NavBarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
  selector: 'app-profile-user',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FormsModule, NavBarComponent, FooterComponent],
  templateUrl: './profile-user.component.html',
  styleUrls: ['./profile-user.component.css']
})
export class ProfileUserComponent {
  selectedTab: string = 'comments';

  tabs = [
    { id: '1', key: 'comments', label: 'Comments', icon: 'fas fa-comment-alt' },
    { id: '2', key: 'stories', label: 'Stories', icon: 'fas fa-book-open' },
    { id: '3', key: 'lists', label: 'Lists', icon: 'fas fa-list-ul' },
    { id: '4', key: 'about', label: 'About', icon: 'fas fa-user' }
  ];

  selectTab(tabKey: string, event: Event): void {
    event.preventDefault();
    this.selectedTab = tabKey;
  }
  editProfile(): void {
    alert('Edit profile functionality would open a modal or form here.');
  }

  comments = [
    {
      id :1,
      author: 'John Doe',
      avatar: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
      postTitle: 'The Future of Web Development',
      date: 'Apr 22, 2025',
      content: `This article resonates deeply with me. The predictions about WebAssembly are spot on. I've been using it in my recent projects and the performance gains are substantial. Great insights about the future of web development!`,
      likes: 24,
    },
    {
      id :2,
      author: 'John Doe',
      avatar: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
      postTitle: 'React 19 Features Preview',
      date: 'Mar 15, 2025',
      content: `The new compiler improvements look promising! I've been following the RFCs closely and the performance benchmarks are impressive. The simplified state management API will be a game-changer for large applications.`,
      likes: 42,
    }
  ];

  likeComment(comment: any) {
    comment.likes += 1;
  }

  editComment(comment: any) {
    console.log('Edit clicked:', comment);
  }

  deleteComment(comment: any) {
    console.log('Delete clicked:', comment);
  }
}
