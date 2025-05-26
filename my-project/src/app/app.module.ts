// src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule,  } from 'ngx-toastr';

@NgModule({
  declarations: [
    AppComponent,
      // Đảm bảo khai báo ở đây
  ],
  imports: [BrowserModule,
    AppRoutingModule,
    FormsModule ,
    HttpClient,
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      positionClass: 'toast-top-center', // hoặc toast-bottom-right, toast-center-center,...
      timeOut: 3000,
      closeButton: true,
      progressBar: true,
    }),
    ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }
