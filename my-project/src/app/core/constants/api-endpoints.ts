/**
 * Constants cho các đường dẫn API của ứng dụng
 * Dựa trên các routes được định nghĩa trong backend/routes/api.js
 */

export const API_BASE = 'http://localhost:3000';

// Đường dẫn API cho xác thực
export const AUTH_API = {
  BASE: `${API_BASE}/auth`,
  REGISTER: `${API_BASE}/auth/register`,
  LOGIN: `${API_BASE}/auth/login`,
  REFRESH_TOKEN: `${API_BASE}/auth/refresh-token`,
  FORGOT_PASSWORD: `${API_BASE}/auth/forgot-password`,
  RESET_PASSWORD: `${API_BASE}/auth/reset-password`,
  LOGOUT: `${API_BASE}/auth/logout`,
};

// Đường dẫn API cho người dùng
export const USER_API = {
  BASE: `${API_BASE}/users`,
  ME: `${API_BASE}/users/me`,
  GET_PROFILE: `${API_BASE}/users/me`,
  UPDATE_PROFILE: `${API_BASE}/users/me`,
  SAVE_SETTINGS: `${API_BASE}/users/me/settings`,
  CHANGE_PASSWORD: `${API_BASE}/users/me/changePassword`,
  ADMIN: {
    BASE: `${API_BASE}/users/admin`,
    GET_ALL: `${API_BASE}/users/admin`,
    CREATE: `${API_BASE}/users/admin`,
  },
  GET_BY_ID: (id: string | number) => `${API_BASE}/users/${id}`,
  UPDATE: (id: string | number) => `${API_BASE}/users/${id}`,
  DELETE: (id: string | number) => `${API_BASE}/users/${id}`,
};

// Đường dẫn API cho bài viết
export const POST_API = {
  BASE: `${API_BASE}/posts`,
  GET_ALL: `${API_BASE}/posts`,
  GET_MY: `${API_BASE}/posts/my`,
  CREATE: `${API_BASE}/posts`,
  UPDATE: (id: string | number) => `${API_BASE}/posts/${id}`,
  DELETE: (id: string | number) => `${API_BASE}/posts/${id}`,
  UPDATE_STATUS: (id: string | number) => `${API_BASE}/posts/${id}/status`,
  GET_BY_SLUG: (slug: string) => `${API_BASE}/posts/slug/${slug}`,
  GET_BY_CATEGORY: (categoryId: string | number) => `${API_BASE}/posts/categories/${categoryId}`,
  GET_BY_AUTHOR: (userId: string | number) => `${API_BASE}/posts/author/${userId}`,
  GET_BY_ID: (id: string | number) => `${API_BASE}/posts/${id}`,
  GET_COMMENTS: (postId: string | number) => `${API_BASE}/posts/${postId}/comments`,
  ADD_COMMENT: (postId: string | number) => `${API_BASE}/posts/${postId}/comments`,
};

// Đường dẫn API cho bình luận (old routes, will be removed or refactored if needed)
export const COMMENT_API = {
  BASE: `${API_BASE}/comments`,
  // These will be deprecated/removed if not used elsewhere
  // GET_BY_POST: (postId: string | number) => `${API_BASE}/comments/post/${postId}`,
  // ADD_TO_POST: (postId: string | number) => `${API_BASE}/comments/post/${postId}`,
  GET_MY: `${API_BASE}/comments/my`,
  UPDATE: (commentId: string | number) => `${API_BASE}/comments/${commentId}`,
  DELETE: (commentId: string | number) => `${API_BASE}/comments/${commentId}`,
};

// Đường dẫn API cho danh mục
export const CATEGORY_API = {
  BASE: `${API_BASE}/categories`,
  GET_ALL: `${API_BASE}/categories`,
  GET_BY_ID: (id: string | number) => `${API_BASE}/categories/${id}`,
  CREATE: `${API_BASE}/categories`,
  UPDATE: (id: string | number) => `${API_BASE}/categories/${id}`,
  DELETE: (id: string | number) => `${API_BASE}/categories/${id}`,
};

// Đường dẫn API cho ngôn ngữ
export const LANGUAGE_API = {
  BASE: `${API_BASE}/languages`,
  GET_ALL: `${API_BASE}/languages`,
  GET_BY_ID: (id: string | number) => `${API_BASE}/languages/${id}`,
  CREATE: `${API_BASE}/languages`,
  UPDATE: (id: string | number) => `${API_BASE}/languages/${id}`,
  DELETE: (id: string | number) => `${API_BASE}/languages/${id}`,
  GET_TRANSLATIONS: (id: string | number) => `${API_BASE}/languages/${id}/translations`,
  ADD_TRANSLATION: (id: string | number) => `${API_BASE}/languages/${id}/translations`,
  UPDATE_TRANSLATION: (id: string | number, translationId: string | number) => `${API_BASE}/languages/${id}/translations/${translationId}`,
  DELETE_TRANSLATION: (id: string | number, translationId: string | number) => `${API_BASE}/languages/${id}/translations/${translationId}`,
};

// Đường dẫn API cho tải lên tệp
export const UPLOAD_API = {
  BASE: `${API_BASE}/uploads`,
  GET_ALL_MEDIA: `${API_BASE}/uploads`,
  UPLOAD_SINGLE: `${API_BASE}/uploads/image`,
  UPLOAD_MULTIPLE: `${API_BASE}/uploads/images`,
  UPLOAD_EDITOR: `${API_BASE}/uploads/editor`,
  DELETE: (publicId: string) => `${API_BASE}/uploads/${publicId}`,
};

// Đường dẫn API cho liên hệ
export const CONTACT_API = {
  BASE: `${API_BASE}/contact`,
  SEND_MESSAGE: `${API_BASE}/contact`,
};

// Nhóm tất cả các API vào một đối tượng
export const API_ENDPOINTS = {
  AUTH: AUTH_API,
  USER: USER_API,
  POST: POST_API,
  COMMENT: COMMENT_API,
  CATEGORY: CATEGORY_API,
  LANGUAGE: LANGUAGE_API,
  UPLOAD: UPLOAD_API,
  CONTACT: CONTACT_API,
  BASE: API_BASE,
};

// DTOs (Data Transfer Objects)
export interface AuthRegisterDto {
  username: string;
  email: string;
  password: string;
}

export interface AuthLoginDto {
  usernameOrEmail: string;
  password: string;
}

export interface CreateCommentDto {
  content: string;
  parentId?: string | number;
}

export interface UpdateCommentDto {
  content: string;
}

export interface CreatePostDto {
  title: string;
  content: string;
  description?: string;
  category_id: string | number;
  tags?: string[];
  status?: string;
  translations?: Array<{
    language_id: number;
    title: string;
    content: string;
    description?: string;
  }>;
}

export interface UpdatePostDto {
  title?: string;
  content?: string;
  description?: string;
  category_id?: string | number;
  tags?: string[];
  status?: string;
  translations?: Array<{
    language_id: number;
    title: string;
    content: string;
    description?: string;
  }>;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
  slug?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
  slug?: string;
}

export interface PostSearchParams {
  query?: string;
  category?: string | number;
  tags?: string[];
  author?: string | number;
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Translation interfaces
export interface TranslationDto {
  id?: number;
  key: string;
  value: string;
  language_id: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateTranslationDto {
  key: string;
  value: string;
  language_id: number;
}

export interface UpdateTranslationDto {
  key?: string;
  value?: string;
}

export interface LanguageTranslationParams {
  page?: number;
  limit?: number;
  search?: string;
  key?: string;
  [key: string]: string | number | boolean | undefined;
}