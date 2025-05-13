import { Routes } from '@angular/router';
import { CategoryPageComponent } from './category-page/category-page.component';


export const routes: Routes = [
    { path: 'category', component: CategoryPageComponent },
    { path: '', redirectTo: 'category', pathMatch: 'full' }
];