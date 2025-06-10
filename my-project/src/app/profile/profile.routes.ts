import { Routes } from '@angular/router';
import { ProfileUserComponent } from './profile-user/profile-user.component';
import { ProfileSettingsComponent } from './profile-settings/profile-settings.component';

export const routes: Routes = [
  { path: 'profile-user', component: ProfileUserComponent },
  { path: 'profile', component: ProfileSettingsComponent },
  { path: '', redirectTo: 'profile-user', pathMatch: 'full' }
];
