import { Routes } from '@angular/router';
import { WritePostComponent } from './write-post/write-post.component';
import { PostDetailComponent } from './post-detail/post-detail.component';
import { UpdatePostComponent } from './update-post/update-post.component';
import { ContactUsComponent } from './contact-us/contact-us.component';

export const routes: Routes = [
    { path: 'write-post', component: WritePostComponent },
    { path: 'post-detail/:id', component: PostDetailComponent },
    { path: 'contact-us', component: ContactUsComponent },
    { path: 'update-post/:id', component: UpdatePostComponent},
    { path: '', redirectTo: 'post-detail/:id', pathMatch: 'full' }
];
