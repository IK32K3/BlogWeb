export interface Category {
  id: number;
  name: string;
  slug?: string;
}

export interface User {
  id: number;
  username: string;
  avatarUrl?: string;
}

export interface Language {
  id: number;
  locale: string;  // ví dụ: 'en', 'vi', ...
  name: string;
}

export interface Media {
  id: number;
  url: string;
  // Add other media properties if needed
}

export interface PostTranslateLanguage {
  id: number;
  post_id: number;
  language_id: number;
  title: string;
  content: string;
  description: string;
  created_at: string;
  updated_at: string;
  is_original: boolean;
  language: Language;
}

export interface PostMedia {
  post_id: number;
  media_id: number;
  is_featured: boolean;
  created_at?: string;
  updated_at?: string;
  
  media?: Media;
}

export interface Post {
  id: number;
  user_id: number;
  category_id: number;
  title: string;
  content: string;
  description: string;
  status: 'draft' | 'published' | 'archived';
  views: number;
  slug: string;
  id_post_original?: number | null;
  created_at: string;
  updated_at: string;
  comments?: number;

  user?: User;
  categories?: Category;
  postMedia?: PostMedia[];
  postTranslateLanguage?: PostTranslateLanguage[];
  tags?: string[];
  likes?: number;
}

export interface PostTranslateLanguageDto {
  language_id: number;
  title: string;
  content: string;
  description?: string;
  is_original?: boolean;
}

export interface PostDto {
  title: string;
  content: string;
  description?: string;
  category_id: number;
  tags?: string[];
  status?: 'draft' | 'published' | 'archived';
  postMedia?: PostMedia[];  // Bạn có thể định nghĩa kiểu media riêng nếu cần
  postTranslateLanguage?: PostTranslateLanguageDto[];
}
