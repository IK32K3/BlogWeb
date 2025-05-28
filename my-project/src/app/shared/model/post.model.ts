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
  language: {
    id: number;
    locale: string;
    name: string;
  };
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
  id_post_original?: number;
  created_at: string;
  updated_at: string;
  user?: User;
  categories?: Category;
  postMedia?: any[];
  postTranslateLanguage?: PostTranslateLanguage[];
  tags?: string[];
  likes?: number;
}
export interface PostDto {
  title: string;
  content: string;
  description?: string;
  category_id: number;
  tags?: string[];
  status?: 'draft' | 'published' | 'archived';
  postMedia?: any[]; // hoặc kiểu dữ liệu media bạn định nghĩa
  postTranslateLanguage?: {
    language_id: number;
    title: string;
    content: string;
    description?: string;
    is_original?: boolean;
  }[];
}