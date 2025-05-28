import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LANGUAGE_API } from '../constants/api-endpoints';

@Injectable({
  providedIn: 'root'
})
export class LanguagesService {
  constructor(private http: HttpClient) { }

  getAll(params?: any): Observable<any> {
    return this.http.get(LANGUAGE_API.BASE, { params });
  }

  getById(id: number | string): Observable<any> {
    return this.http.get(LANGUAGE_API.GET_BY_ID(id));
  }
}
