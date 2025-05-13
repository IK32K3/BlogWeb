import { Routes } from '@angular/router';

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
    path: '',
    redirectTo: 'home/introduce-page',
    pathMatch: 'full'
  }
];
