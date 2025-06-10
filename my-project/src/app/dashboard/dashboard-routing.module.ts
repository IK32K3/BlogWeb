import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardMainComponent } from './dashboard-main/dashboard-main.component';
import { MediaComponent } from './media/media.component';
import { PostsComponent } from './posts/posts.component';
import { SettingComponent } from './setting/setting.component';

const routes: Routes = [
  { path: 'dashboard-blogger', component: DashboardMainComponent },
  { path: 'media', component: MediaComponent },
  { path: 'dashboard-post', component: PostsComponent },
  { path: 'settings', component: SettingComponent },
  { path: '', redirectTo: 'dashboard-blogger', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
