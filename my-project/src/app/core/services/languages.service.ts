import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Language, LanguageCreateDto, LanguageUpdateDto } from '../../shared/model/language.model';

@Injectable({
  providedIn: 'root'
})
export class LanguagesService {
  private API_URL = '/api/languages';

  constructor(private http: HttpClient) { }

  // Lấy tất cả ngôn ngữ (có thể truyền params: page, limit, search, is_active)
  getAll(params?: any): Observable<{ languages: Language[], pagination: any }> {
    return this.http.get<{ languages: Language[], pagination: any }>(this.API_URL, { params });
  }

  // Lấy ngôn ngữ theo id
  getById(id: number | string): Observable<{ language: Language }> {
    return this.http.get<{ language: Language }>(`${this.API_URL}/${id}`);
  }

  // Thêm mới ngôn ngữ
  create(data: LanguageCreateDto): Observable<{ message: string, language: Language }> {
    return this.http.post<{ message: string, language: Language }>(this.API_URL, data);
  }

  // Sửa ngôn ngữ
  update(id: number | string, data: LanguageUpdateDto): Observable<{ message: string, language: Language }> {
    return this.http.put<{ message: string, language: Language }>(`${this.API_URL}/${id}`, data);
  }

  // Xóa ngôn ngữ
  delete(id: number | string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.API_URL}/${id}`);
  }
}
