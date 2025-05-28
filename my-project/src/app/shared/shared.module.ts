import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarIntroduceComponent } from './components/navbar-introduce/navbar-introduce.component';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router'; // Import RouterModule if you need routing in your shared module
import { RouterOutlet } from '@angular/router'; // Import RouterOutlet if you need it in your shared module
import { FooterComponent } from './components/footer/footer.component';
import { HeroSectionComponent } from './components/hero-section/hero-section.component';
import { PostCardComponent } from './components/post-card/post-card.component';
import { NavBarComponent } from './components/navbar/navbar.component';
import { QuillModule } from 'ngx-quill'; // Import QuillModule if you are using it in your shared module
import { QuillEditorComponent } from './components/quill-editor/quill-editor.component'; // Import your QuillEditorComponent if you have it
import { FilterMovieComponent } from './components/filter-movie/filter-movie.component'; // Import your FilterMovieComponent if you have it
import { SidebarDashboardComponent } from './components/sidebar-dashboard/sidebar-dashboard.component';
import { HeaderDashboardComponent } from './components/header-dashboard/header-dashboard.component';
import { UploadModalComponent } from './components/upload-modal/upload-modal.component';
import { HeaderComponent } from './components/header/header.component';
@NgModule({

  declarations: [

  ],
  exports: [
    NavbarIntroduceComponent,
    FooterComponent,
    HeroSectionComponent,
    PostCardComponent,
    NavBarComponent,
    QuillEditorComponent, // Export your QuillEditorComponent if you want to use it in other modules
    FilterMovieComponent,
    HeaderDashboardComponent,
    SidebarDashboardComponent,
    UploadModalComponent,
    HeaderComponent,
  ],
  imports: [
    CommonModule,
    NavbarIntroduceComponent,
    FormsModule,
    RouterModule,
    RouterOutlet,
    FooterComponent,
    HeroSectionComponent,
    PostCardComponent,
    NavBarComponent,
    QuillModule,
    QuillEditorComponent,
    FilterMovieComponent, // Import your FilterMovieComponent if you want to use it in this module,
    HeaderDashboardComponent,
    SidebarDashboardComponent,
    UploadModalComponent,
    HeaderComponent
  ]
})
export class SharedModule { }
