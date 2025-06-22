import { Routes } from '@angular/router';
import { PostDetailComponent } from './blog/post-detail/post-detail.component';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then(m => m.routes)
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.routes').then(m => m.routes)
  },
  {
    path: 'blog',
    loadChildren: () => import('./blog/blog.routes').then(m => m.routes)
  },
  {
    path: 'posts/:id',
    component: PostDetailComponent
  },
  {
    path: 'profile',
    loadChildren: () => import('./profile/profile.routes').then(m => m.routes)
  },
  {
    path: 'category',
    loadChildren: () => import('./category/category.routes').then(m => m.routes)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard.routes').then(m => m.routes)
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },
  {
    path: '',
    redirectTo: 'home/introduce-page',
    pathMatch: 'full'
  }
];
