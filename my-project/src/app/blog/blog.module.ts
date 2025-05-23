import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlogRoutingModule } from './blog-routing.module';
import { ContactUsComponent } from './contact-us/contact-us.component';
import { NavBarComponent } from '../shared/components/navbar/navbar.component';
import { FooterComponent } from '../shared/components/footer/footer.component';
import { WritePostComponent } from './write-post/write-post.component';
import { PostDetailComponent } from './post-detail/post-detail.component';
import { UpdatePostComponent } from './update-post/update-post.component';
import { AppComponent } from '../app.component';
import { FormsModule } from '@angular/forms'; // Nếu bạn sử dụng FormsModule trong các component
import { SharedModule } from '../shared/shared.module'; // Nếu bạn có module chia sẻ nào đó
import { RouterModule } from '@angular/router'; // Import RouterModule if you need routing in your shared module
import { ReactiveFormsModule } from '@angular/forms'; // Nếu bạn sử dụng ReactiveFormsModule trong các component
@NgModule({
  declarations: [
    WritePostComponent,
    PostDetailComponent,
    ContactUsComponent,
    NavBarComponent,
    FooterComponent,
    UpdatePostComponent,
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
      { path: 'update-post/:id', component: UpdatePostComponent},
    ]),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class BlogModule { }
