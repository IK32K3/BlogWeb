import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CATEGORY_API, CreateCategoryDto, UpdateCategoryDto } from '../constants/api-endpoints';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  constructor(private http: HttpClient) { }

  getAll(params?: any): Observable<any> {
    return this.http.get(CATEGORY_API.BASE, { params });
  }

  getById(id: number | string): Observable<any> {
    return this.http.get(CATEGORY_API.GET_BY_ID(id));
  }

  create(data: CreateCategoryDto): Observable<any> {
    return this.http.post(CATEGORY_API.BASE, data);
  }

  update(id: number | string, data: UpdateCategoryDto): Observable<any> {
    return this.http.put(CATEGORY_API.GET_BY_ID(id), data);
  }

  delete(id: number | string): Observable<any> {
    return this.http.delete(CATEGORY_API.GET_BY_ID(id));
  }
}
