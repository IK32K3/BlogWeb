export interface Category {
  id: number;
  name: string;
  slug?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  name?: string;
  avatar?: string;
}

export interface Language {
  id: number;
  locale: string;  // ví dụ: 'en', 'vi', ...
  name: string;
}

export interface UploadedFile {
  id: number;
  url: string;
  name?: string;
  type?: 'image' | 'video' | 'document' | 'gallery';
  metadata?: Record<string, any>;
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

export interface PostUpload {
  post_id: number;
  file_id: number;
  is_featured: boolean;
  created_at?: string;
  updated_at?: string;
  
  file?: UploadedFile;
}

export interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export interface Post {
  id: number;
  user_id: number;
  category_id: number;
  title: string;
  content: string;
  description: string;
  thumbnail?: string;
  status: 'draft' | 'published' | 'archived';
  views: number;
  slug: string;
  id_post_original?: number | null;
  createdAt: string;
  updatedAt: string;
  comments?: number;
  likes_count?: number;
  comments_count?: number;
  commentsList?: Comment[];

  author?: User;
  category?: Category;
  postUploads?: PostUpload[];
  postTranslateLanguage?: PostTranslateLanguage[];
  tags?: string[];
  likes?: number;
}

export interface PostTranslation {
  language_id: number;
  title: string;
  content: string;
  description?: string;
  locale?: string;
}

export interface PostDto {
  title: string;
  content: string;
  description?: string;
  category_id: number;
  tags?: string[];
  status?: string;
  translations?: PostTranslation[];
  thumbnail?: string;
}
