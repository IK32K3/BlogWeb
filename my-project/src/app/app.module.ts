// src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { authInterceptor } from './core/interceptors/auth.interceptor';

@NgModule({
  imports: [BrowserModule,
    AppRoutingModule,
    FormsModule ,
    HttpClientModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      positionClass: 'toast-bottom-right', // hoặc toast-bottom-right, toast-center-center,...
      timeOut: 3000,
      closeButton: true,
      progressBar: true,
    }),
    ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useValue: authInterceptor,
      multi: true
    }
  ],
  bootstrap: [],
})
export class AppModule {
  constructor() {
  }
}
