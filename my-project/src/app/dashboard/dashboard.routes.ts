import { Routes } from '@angular/router';
import { DashboardMainComponent } from './dashboard-main/dashboard-main.component';
import { MediaComponent } from './media/media.component';
import { PostsComponent } from './posts/posts.component';
import { SettingComponent } from './setting/setting.component'; 


export const routes: Routes = [
    { path: 'dashboard-blogger', component: DashboardMainComponent },
    { path: 'media', component: MediaComponent },
    { path: 'dashboard-post', component: PostsComponent },
    { path: 'setting', component:SettingComponent },
    { path: '', redirectTo: 'dashboard-blogger', pathMatch: 'full' }
];
