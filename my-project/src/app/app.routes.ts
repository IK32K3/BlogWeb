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
    path: '',
    redirectTo: 'home/introduce-page',
    pathMatch: 'full'
  }
];
