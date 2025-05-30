export interface CategoryTranslateLanguage {
  category_id: number;
  language_id: number;
  name: string;
  slug: string;
  is_active?: boolean;

  language?: {
    id: number;
    name: string;
    locale: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  };

  categories?: {
    id: number;
    name: string;
    slug?: string;
  };
}
export interface CategoryTranslateLanguageCreateDto {
  category_id: number;
  language_id: number;
  name: string;
  slug: string;
  is_active?: boolean; // không bắt buộc, mặc định true
}

export interface CategoryTranslateLanguageUpdateDto {
  name?: string;
  slug?: string;
  is_active?: boolean;
}