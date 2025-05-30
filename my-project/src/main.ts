// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import '@angular/compiler'; // Add this line for JIT compilation in development

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
