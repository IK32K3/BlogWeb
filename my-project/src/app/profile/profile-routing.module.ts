import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileUserComponent } from './profile-user/profile-user.component';
import { ProfileSettingsComponent } from './profile-settings/profile-settings.component';

const routes: Routes = [
  { path: 'profile-user', component: ProfileUserComponent },
  { path: 'profile-settings/:id', component: ProfileSettingsComponent },
  { path: '', redirectTo: 'profile-user', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfileRoutingModule { }
