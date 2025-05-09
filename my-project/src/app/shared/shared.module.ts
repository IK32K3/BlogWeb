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


@NgModule({
  declarations: [
    NavbarIntroduceComponent,
    FooterComponent,
    HeroSectionComponent,
    PostCardComponent,
    NavBarComponent,
  ],
  exports: [
    NavbarIntroduceComponent,
    FooterComponent,
    HeroSectionComponent,
    PostCardComponent,
    NavBarComponent,
  ],
  imports: [
    CommonModule,
    NavbarIntroduceComponent,
    FormsModule,
    RouterModule,
    RouterOutlet ,
    FooterComponent,
    HeroSectionComponent,
    PostCardComponent,
    NavBarComponent,
  ]
})
export class SharedModule { }
