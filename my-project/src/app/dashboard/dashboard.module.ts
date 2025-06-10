import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardMainComponent } from './dashboard-main/dashboard-main.component';
import { MediaComponent } from './media/media.component';
import { PostsComponent } from './posts/posts.component';
import { SettingComponent } from './setting/setting.component';
import { SharedModule } from '../shared/shared.module'; // Import your shared module if you have one
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router'; // Import RouterModule if you need routing in your dashboard module
import { AppComponent } from '../app.component'; // Import your AppComponent if you need it in your dashboard module

@NgModule({
  imports: [
    CommonModule,
    DashboardRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    DashboardMainComponent,
    MediaComponent,
    PostsComponent,
    SettingComponent
  ],
  providers: []
})
export class DashboardModule { }
