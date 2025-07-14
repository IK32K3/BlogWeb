import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminUsersComponent } from './admin-users/admin-users.component';
import { AdminPostsComponent } from './admin-posts/admin-posts.component';
import { AdminCategoriesComponent } from './admin-categories/admin-categories.component';
import { AdminCommentsComponent } from './admin-comments/admin-comments.component';
import { AdminMediaComponent } from './admin-media/admin-media.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: AdminDashboardComponent,
    title: 'Admin Dashboard'
  },
  // Future admin routes can be added here
  {
    path: 'users',
    component: AdminUsersComponent,
    title: 'User Management'
  },
  {
    path: 'posts',
    component: AdminPostsComponent,
    title: 'Post Management'
  },
  {
    path: 'categories',
    component: AdminCategoriesComponent,
    title: 'Category Management'
  },
  {
    path: 'comments',
    component: AdminCommentsComponent,
    title: 'Comment Management'
  },
  {
    path: 'media',
    component: AdminMediaComponent,
    title: 'Admin media'
  }
];
