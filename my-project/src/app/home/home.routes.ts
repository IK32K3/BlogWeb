// src/app/auth/auth.routes.ts
import { Routes } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';
import { AboutPageComponent } from './about-page/about-page.component';
import { IntroducePageComponent } from './introduce-page/introduce-page.component';
// Nếu bạn có thêm các component như Register, ForgotPassword, import ở đây tương tự

export const routes: Routes = [
  { path: 'home-page', component: HomePageComponent },
  {
    path: 'about-page',
    component: AboutPageComponent,
  },
  { path: 'introduce-page', 
    component: IntroducePageComponent 
},
  { path: '', redirectTo: 'introduce-page', pathMatch: 'full' }
];
