import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  // { path: '', component: PostListComponent },
  // { path: 'post/:id', component: PostDetailComponent },
  // { path: 'write', component: WritePostComponent },
  // { path: 'edit/:id', component: UpdatePostComponent },
  // { path: 'contact', component: ContactUsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BlogRoutingModule { }
