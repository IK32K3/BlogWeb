import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';
import { AboutPageComponent } from './about-page/about-page.component';
import { IntroducePageComponent } from './introduce-page/introduce-page.component';
const routes: Routes = [
  { path: 'home-page', component: HomePageComponent },
    { path: 'about-page', component: AboutPageComponent },
    { path: 'introduce-page', component: IntroducePageComponent },
    { path: '', redirectTo: 'introduce-page', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
