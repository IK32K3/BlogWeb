export interface Language {
  id: number;
  name: string;
  locale: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
export interface LanguageCreateDto {
  name: string;
  locale: string;
  is_active?: boolean; // không bắt buộc, mặc định true
}

// Interface dùng để cập nhật Language (có thể cập nhật 1 vài trường)
export interface LanguageUpdateDto {
  name?: string;
  locale?: string;
  is_active?: boolean;
}