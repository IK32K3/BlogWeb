import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AppComponent } from '../app.component';
import { SharedModule } from '../shared/shared.module';
import { CategoryRoutingModule } from './category-routing.module';
import { CategoryPageComponent } from './category-page/category-page.component';
import { NavBarComponent } from '../shared/components/navbar/navbar.component';
import { FooterComponent } from '../shared/components/footer/footer.component';


@NgModule({
  declarations: [
    CategoryPageComponent,
    NavBarComponent,
    FooterComponent,
  ],
  imports: [
    CommonModule,
        CategoryRoutingModule,
        SharedModule, // Nếu bạn có module chia sẻ nào đó
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forChild([
          { path: 'category', component: CategoryPageComponent }, 
        ]),
      ],
      providers: [],
      bootstrap: [AppComponent],
})
export class CategoryModule { }
