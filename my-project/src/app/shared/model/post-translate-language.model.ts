export interface PostTranslateLanguage {
  id: number;
  post_id: number;
  language_id: number;
  title: string;
  content: string;
  description: string;
  created_at: string;
  updated_at: string;

  // Quan hệ với Post
  post?: {
    id: number;
    title: string;
    slug: string;
    // ...các trường khác nếu cần
  };

  // Quan hệ với Language
  language?: {
    id: number;
    name: string;
    code: string;
  };
}
export interface PostTranslateLanguageDto {
  post_id: number;
  language_id: number;
  title: string;
  content: string;
  description: string;
}