import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlogRoutingModule } from './blog-routing.module';
import { ContactUsComponent } from './contact-us/contact-us.component';
import { WritePostComponent } from './write-post/write-post.component';
import { PostDetailComponent } from './post-detail/post-detail.component';
import { UpdatePostComponent } from './update-post/update-post.component';
import { FormsModule } from '@angular/forms'; // Nếu bạn sử dụng FormsModule trong các component
import { SharedModule } from '../shared/shared.module'; // Nếu bạn có module chia sẻ nào đó
import { RouterModule } from '@angular/router'; // Import RouterModule if you need routing in your shared module
import { ReactiveFormsModule } from '@angular/forms'; // Nếu bạn sử dụng ReactiveFormsModule trong các component
import { HttpClientModule } from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';

@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    BlogRoutingModule,
    SharedModule, // Nếu bạn có module chia sẻ nào đó
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      { path: 'write-post', component: WritePostComponent },
      { path: 'post-detail', component: PostDetailComponent },
      { path: 'contact-us', component: ContactUsComponent },
      { path: 'update-post/:id', component: UpdatePostComponent },
    ]),
    HttpClientModule,
    ToastrModule.forRoot({
      positionClass: 'toast-top-center', // hoặc toast-bottom-right, toast-center-center,...
      timeOut: 2000,
      closeButton: true,
      progressBar: true,
    }),
  ],
  providers: []
})
export class BlogModule { }
