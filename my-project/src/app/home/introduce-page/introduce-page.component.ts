import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarIntroduceComponent } from '../../shared/components/navbar-introduce/navbar-introduce.component';
import { FormsModule } from '@angular/forms';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { HeroSectionComponent } from '../../shared/components/hero-section/hero-section.component';
import { PostCardComponent } from '../../shared/components/post-card/post-card.component';
@Component({
  selector: 'app-introduce-page',
  imports: [CommonModule,RouterOutlet,NavbarIntroduceComponent,FormsModule,FooterComponent,HeroSectionComponent,PostCardComponent],
  templateUrl: './introduce-page.component.html',
  styleUrl: './introduce-page.component.css'
})
export class IntroducePageComponent {

}
