import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Language, LanguageCreateDto, LanguageUpdateDto } from '../../shared/model/language.model';
import { 
  LANGUAGE_API, 
  TranslationDto, 
  CreateTranslationDto, 
  UpdateTranslationDto, 
  LanguageTranslationParams 
} from '../constants/api-endpoints';

@Injectable({
  providedIn: 'root'
})
export class LanguagesService {

  constructor(private http: HttpClient) { }

  // Lấy tất cả ngôn ngữ (có thể truyền params: page, limit, search, is_active)
  getAll(params?: any): Observable<{ languages: Language[], pagination: any }> {
    return this.http.get<{ languages: Language[], pagination: any }>(LANGUAGE_API.GET_ALL, { params });
  }

  // Lấy ngôn ngữ theo id
  getById(id: number | string): Observable<{ language: Language }> {
    return this.http.get<{ language: Language }>(LANGUAGE_API.GET_BY_ID(id));
  }

  // Thêm mới ngôn ngữ
  create(data: LanguageCreateDto): Observable<{ message: string, language: Language }> {
    return this.http.post<{ message: string, language: Language }>(LANGUAGE_API.CREATE, data);
  }

  // Sửa ngôn ngữ
  update(id: number | string, data: LanguageUpdateDto): Observable<{ message: string, language: Language }> {
    return this.http.put<{ message: string, language: Language }>(LANGUAGE_API.UPDATE(id), data);
  }

  // Xóa ngôn ngữ
  delete(id: number | string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(LANGUAGE_API.DELETE(id));
  }

  // Lấy danh sách translation của một ngôn ngữ
  getTranslations(languageId: number | string, params?: any): Observable<{ translations: TranslationDto[], pagination: any }> {
    return this.http.get<{ translations: TranslationDto[], pagination: any }>(LANGUAGE_API.GET_TRANSLATIONS(languageId), { params });
  }

  // Thêm translation cho một ngôn ngữ
  addTranslation(languageId: number | string, data: CreateTranslationDto): Observable<{ message: string, translation: TranslationDto }> {
    return this.http.post<{ message: string, translation: TranslationDto }>(LANGUAGE_API.ADD_TRANSLATION(languageId), data);
  }

  // Sửa translation
  updateTranslation(languageId: number | string, translationId: number | string, data: UpdateTranslationDto): Observable<{ message: string, translation: TranslationDto }> {
    return this.http.put<{ message: string, translation: TranslationDto }>(LANGUAGE_API.UPDATE_TRANSLATION(languageId, translationId), data);
  }

  // Xóa translation
  deleteTranslation(languageId: number | string, translationId: number | string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(LANGUAGE_API.DELETE_TRANSLATION(languageId, translationId));
  }

  // Lấy ngôn ngữ đang hoạt động
  getActiveLanguages(): Observable<{ languages: Language[] }> {
    return this.http.get<{ languages: Language[] }>(LANGUAGE_API.GET_ALL, { 
      params: { is_active: true } 
    });
  }

  // Thay đổi trạng thái hoạt động của ngôn ngữ
  toggleActiveStatus(id: number | string, isActive: boolean): Observable<{ message: string, language: Language }> {
    return this.http.patch<{ message: string, language: Language }>(LANGUAGE_API.UPDATE(id), { 
      is_active: isActive 
    });
  }

  // Lấy tất cả translation keys cho một ngôn ngữ
  getTranslationKeys(languageId: number | string): Observable<{ keys: string[] }> {
    return this.http.get<{ keys: string[] }>(`${LANGUAGE_API.GET_TRANSLATIONS(languageId)}/keys`);
  }

  // Import translations từ file
  importTranslations(languageId: number | string, file: File): Observable<{ message: string, imported: number }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ message: string, imported: number }>(`${LANGUAGE_API.ADD_TRANSLATION(languageId)}/import`, formData);
  }

  // Export translations ra file
  exportTranslations(languageId: number | string, format: 'json' | 'csv' = 'json'): Observable<Blob> {
    return this.http.get(`${LANGUAGE_API.GET_TRANSLATIONS(languageId)}/export`, {
      params: { format },
      responseType: 'blob'
    });
  }

  getPostTranslation(postId: number | string, lang: string) {
    return this.http.get<{ title: string, description: string, content: string }>(`/api/posts/${postId}/translate`, {
      params: { lang }
    });
  }
}
