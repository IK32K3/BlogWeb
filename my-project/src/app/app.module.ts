// src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
      // Đảm bảo khai báo ở đây
  ],
  imports: [BrowserModule,AppRoutingModule,FormsModule ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
