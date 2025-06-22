import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { UsersService } from '../../core/services/users.service';
import { BlogPostService } from '../../core/services/blog-post.service';
import { User } from '../../shared/model/user.model';
import { Post } from '../../shared/model/post.model';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { SharedModule } from '../../shared/shared.module';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { AuthService } from '../../core/services/auth.service';
import { HeaderComponent } from 'app/shared/components/header/header.component';

@Component({
  selector: 'app-profile-user',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FormsModule, HeaderComponent, FooterComponent, RouterModule],
  templateUrl: './profile-user.component.html',
  styleUrls: ['./profile-user.component.css']
})
export class ProfileUserComponent implements OnInit {
  selectedTab: string = 'posts';
  user: User | undefined;
  userPosts: Post[] = [];
  isLoading = true;
  error: string | null = null;

  tabs = [
    { id: '1', key: 'posts', label: 'Stories', icon: 'fas fa-book-open' },
    { id: '2', key: 'comments', label: 'Comments', icon: 'fas fa-comment-alt' },
    { id: '3', key: 'about', label: 'About', icon: 'fas fa-user' }
  ];

  constructor(
    private usersService: UsersService,
    private blogPostService: BlogPostService,
    private router: Router,
    private toastr: ToastrService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.authService.isLoggedIn$.subscribe(loggedIn => {
      if (!loggedIn) {
        this.router.navigate(['/auth/login']);
      } else {
        this.fetchUserProfile();
        this.fetchUserPosts();
      }
    });
  }

  fetchUserProfile(): void {
    // Ensure user is authenticated before attempting to fetch profile
    if (!this.authService.isAuthenticated()) {
      this.error = 'Authentication required to load profile.';
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.usersService.getProfile().pipe(
      catchError((error) => {
        console.error('Error fetching user profile:', error);
        this.error = 'Failed to load user profile.';
        this.isLoading = false;
        return throwError(() => error);
      })
    ).subscribe(response => {
      if (response.success && response.data && response.data.user) {
        this.user = response.data.user;
        // Set avatar from userUploads if available
        if (this.user.userUploads && this.user.userUploads.length > 0) {
          const avatarMedia = this.user.userUploads.find(media => media.file?.type === 'image');
          if (avatarMedia) {
            this.user.avatar = avatarMedia.file.url;
          }
        }
      }
      this.isLoading = false;
    });
  }

  fetchUserPosts(): void {
    // Ensure user is authenticated before attempting to fetch posts
    if (!this.authService.isAuthenticated()) {
      this.error = 'Authentication required to load your posts.';
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.blogPostService.getMyPosts().pipe(
      catchError((error) => {
        console.error('Error fetching user posts:', error);
        this.error = 'Failed to load user posts.';
        this.isLoading = false;
        return throwError(() => error);
      })
    ).subscribe(response => {
      if (response.success && response.data?.posts) {
        this.userPosts = response.data.posts;
      }
      this.isLoading = false;
    });
  }

  selectTab(tabKey: string, event: Event): void {
    event.preventDefault();
    this.selectedTab = tabKey;
  }

  editProfile(): void {
    this.router.navigate(['/dashboard/settings']);
  }

  editPost(postId: number): void {
    this.router.navigate(['/blog/update-post', postId]);
  }

  deletePost(postId: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this post!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
    }).then((result) => {
      if (result.isConfirmed) {
        this.blogPostService.deletePost(postId).pipe(
          catchError((error) => {
            console.error('Error deleting post:', error);
            this.toastr.error('Failed to delete post.');
            return throwError(() => error);
          })
        ).subscribe(response => {
          if (response.success) {
            Swal.fire(
              'Deleted!',
              'Your post has been deleted.',
              'success'
            );
            this.fetchUserPosts(); // Refresh the list of posts
          } else {
            this.toastr.error(response.message || 'Failed to delete post.');
          }
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        this.toastr.info('Your post is safe :)');
      }
    });
  }
}
