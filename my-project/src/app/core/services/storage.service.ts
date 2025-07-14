import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  constructor() {}

  // ============================================
  // LƯU GIÁ TRỊ VÀO LOCALSTORAGE - setLocalItem
  // ============================================
  /**
   * Lưu giá trị vào localStorage
   * @param key - Khóa lưu trữ
   * @param value - Giá trị cần lưu
   */
  setLocalItem(key: string, value: any): void {
    try {
      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
    } catch (e) {
      console.error('Lỗi khi lưu vào localStorage:', e);
    }
  }

  // ============================================
  // LẤY GIÁ TRỊ TỪ LOCALSTORAGE - getLocalItem
  // ============================================
  /**
   * Lấy giá trị từ localStorage
   * @param key - Khóa lưu trữ
   * @returns Giá trị đã lưu trữ hoặc null nếu không tồn tại
   */
  getLocalItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return null;
      
      try {
        return JSON.parse(item) as T;
      } catch {
        return item as unknown as T;
      }
    } catch (e) {
      console.error('Lỗi khi đọc từ localStorage:', e);
      return null;
    }
  }

  // ============================================
  // XÓA ITEM KHỎI LOCALSTORAGE - removeLocalItem
  // ============================================
  /**
   * Xóa item khỏi localStorage
   * @param key - Khóa lưu trữ
   * @returns void
   */
  removeLocalItem(key: string): void {
    localStorage.removeItem(key);
  }

  // ============================================
  // XÓA TẤT CẢ DỮ LIỆU KHỎI LOCALSTORAGE - clearLocalStorage
  // ============================================
  /**
   * Xóa tất cả dữ liệu khỏi localStorage
   * @returns void
   */
  clearLocalStorage(): void {
    localStorage.clear();
  }

  // ============================================
  // LƯU GIÁ TRỊ VÀO SESSIONSTORAGE - setSessionItem
  // ============================================
  /**
   * Lưu giá trị vào sessionStorage
   * @param key - Khóa lưu trữ
   * @param value - Giá trị cần lưu
   */
  setSessionItem(key: string, value: any): void {
    try {
      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
      sessionStorage.setItem(key, serializedValue);
    } catch (e) {
      console.error('Lỗi khi lưu vào sessionStorage:', e);
    }
  }

  // ============================================
  // LẤY GIÁ TRỊ TỪ SESSIONSTORAGE - getSessionItem
  // ============================================
  /**
   * Lấy giá trị từ sessionStorage
   * @param key - Khóa lưu trữ
   * @returns Giá trị đã lưu trữ hoặc null nếu không tồn tại
   */
  getSessionItem<T>(key: string): T | null {
    try {
      const item = sessionStorage.getItem(key);
      if (item === null) return null;
      try {
        return JSON.parse(item) as T;
      } catch {
        return item as unknown as T;
      }
    } catch (e) {
      console.error('Lỗi khi đọc từ sessionStorage:', e);
      return null;
    }
  }

  // ============================================
  // XÓA ITEM KHỎI SESSIONSTORAGE - removeSessionItem
  // ============================================
  /**
   * Xóa item khỏi sessionStorage
   * @param key - Khóa lưu trữ
   * @returns void
   */
  removeSessionItem(key: string): void {
    sessionStorage.removeItem(key);
  }

  // ============================================
  // XÓA TẤT CẢ DỮ LIỆU KHỎI SESSIONSTORAGE - clearSessionStorage
  // ============================================
  /**
   * Xóa tất cả dữ liệu khỏi sessionStorage
   * @returns void
   */
  clearSessionStorage(): void {
    sessionStorage.clear();
  }

}
