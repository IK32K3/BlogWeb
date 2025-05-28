// Các key dùng cho localStorage/sessionStorage

export const AUTH_TOKEN_KEY = 'auth_token';
export const USER_INFO_KEY = 'user_info';
export const REMEMBER_ME_KEY = 'remember_me';
export const THEME_KEY = 'app_theme';

// Hàm tiện ích cho localStorage
export const StorageUtil = {
  set(key: string, value: any) {
    localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
  },
  get<T = any>(key: string): T | null {
    const val = localStorage.getItem(key);
    try {
      return val ? (JSON.parse(val) as T) : null;
    } catch {
      return val as any;
    }
  },
  remove(key: string) {
    localStorage.removeItem(key);
  },
  clear() {
    localStorage.clear();
  }
};

// Hàm tiện ích cho sessionStorage
export const SessionStorageUtil = {
  set(key: string, value: any) {
    sessionStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
  },
  get<T = any>(key: string): T | null {
    const val = sessionStorage.getItem(key);
    try {
      return val ? (JSON.parse(val) as T) : null;
    } catch {
      return val as any;
    }
  },
  remove(key: string) {
    sessionStorage.removeItem(key);
  },
  clear() {
    sessionStorage.clear();
  }
};