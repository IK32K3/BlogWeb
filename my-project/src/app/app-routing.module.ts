// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { routes } from './app.routes'; // Import từ file routes bạn đã có

@NgModule({
  imports: [RouterModule.forRoot(routes)], // Cấu hình routing
  exports: [RouterModule]
})
export class AppRoutingModule { }
