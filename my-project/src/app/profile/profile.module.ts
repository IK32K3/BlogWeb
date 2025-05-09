import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileRoutingModule } from './profile-routing.module';
import { ProfileUserComponent } from './profile-user/profile-user.component';
import { ProfileSettingsComponent } from './profile-settings/profile-settings.component';
import { NavBarComponent } from '../shared/components/navbar/navbar.component';
import { FooterComponent } from '../shared/components/footer/footer.component';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Nếu bạn sử dụng FormsModule trong các component
import { SharedModule } from '../shared/shared.module'; // Nếu bạn có module chia sẻ nào đó
import { AppComponent } from '../app.component'; // Nếu bạn muốn sử dụng AppComponent ở đây
@NgModule({
  declarations: [
    ProfileUserComponent,
    ProfileSettingsComponent,
    NavBarComponent,
    FooterComponent
  ],
  imports: [
    CommonModule,
    ProfileRoutingModule,
    RouterModule.forChild([
      { path: 'profile-user', component: ProfileUserComponent },
      { path: 'profile', component: ProfileSettingsComponent },
    ]),
    SharedModule, // Nếu bạn có module chia sẻ nào đó
    FormsModule, // Nếu bạn sử dụng FormsModule trong các component
  ],
  providers: [],
  bootstrap: [AppComponent], // Nếu bạn muốn sử dụng AppComponent ở đây
})
export class ProfileModule { }
