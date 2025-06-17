import { Routes } from '@angular/router';
import { DashboardMainComponent } from './dashboard-main/dashboard-main.component';
import { MediaComponent } from './media/media.component';
import { PostsComponent } from './posts/posts.component';
import { SettingComponent } from './setting/setting.component'; 


export const routes: Routes = [
    { path: 'dashboard-main', component: DashboardMainComponent },
    { path: 'dashboard-post', component: PostsComponent },
    { path: 'dashboard-media', component: MediaComponent },
    { path: 'dashboard-setting', component: SettingComponent },

  { path: '', redirectTo: 'dashboard-main', pathMatch: 'full' }
];
