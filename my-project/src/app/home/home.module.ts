import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeRoutingModule } from './home-routing.module';
import { HomePageComponent } from './home-page/home-page.component';
import { AboutPageComponent } from './about-page/about-page.component';
import { IntroducePageComponent } from './introduce-page/introduce-page.component';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Nếu bạn sử dụng FormsModule trong các component
import { NavbarIntroduceComponent } from '../shared/components/navbar-introduce/navbar-introduce.component'; // Đảm bảo đường dẫn đúng đến NavbarIntroduceComponent
import { SharedModule } from '../shared/shared.module'; // Nếu bạn có module chia sẻ nào đó
import { AppComponent } from '../app.component';
import { FooterComponent } from '../shared/components/footer/footer.component';
import { HeroSectionComponent } from '../shared/components/hero-section/hero-section.component';


@NgModule({
  declarations: [

  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    RouterModule.forChild([
      { path: 'home-page', component: HomePageComponent },
      { path: 'about-page', component: AboutPageComponent },
      { path: 'introduce-page', component: IntroducePageComponent },
    ]),
    SharedModule, // Nếu bạn có module chia sẻ nào đó
    FormsModule, // Nếu bạn sử dụng FormsModule trong các component
  ],
  providers: [],
  bootstrap: [],
})
export class HomeModule { }
