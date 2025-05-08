import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarIntroduceComponent } from './components/navbar-introduce/navbar-introduce.component';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router'; // Import RouterModule if you need routing in your shared module
import { RouterOutlet } from '@angular/router'; // Import RouterOutlet if you need it in your shared module
import { FooterComponent } from './components/footer/footer.component';
import { HeroSectionComponent } from './components/hero-section/hero-section.component';
import { PostCardComponent } from './components/post-card/post-card.component';


@NgModule({
  declarations: [
    NavbarIntroduceComponent,
    FooterComponent,
    HeroSectionComponent,
    PostCardComponent,
  ],
  exports: [
    NavbarIntroduceComponent,
    FooterComponent,
    HeroSectionComponent,
    PostCardComponent,
  ],
  imports: [
    CommonModule,
    NavbarIntroduceComponent,
    FormsModule,
    RouterModule,
    RouterOutlet ,
    FooterComponent,
  ]
})
export class SharedModule { }
