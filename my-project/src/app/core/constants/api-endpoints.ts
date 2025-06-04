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
  // ...thêm các endpoint khác nếu có
};

// Đường dẫn API cho ngôn ngữ
export const LANGUAGE_API = {
  BASE: `${API_BASE}/languages`,
  GET_BY_ID: (id: string | number) => `${API_BASE}/languages/${id}`,
};

// Đường dẫn API cho danh mục
export const CATEGORY_API = {
  BASE: `${API_BASE}/categories`,
  GET_BY_ID: (id: string | number) => `${API_BASE}/categories/${id}`,
};

// Đường dẫn API cho người dùng
export const USER_API = {
  BASE: `${API_BASE}/users`,
  GET_BY_ID: (id: string | number) => `${API_BASE}/users/${id}`,
  GET_COMMENTS_BY_USER: (userId: string | number) => `${API_BASE}/users/${userId}/comments`,
  // ...thêm các endpoint khác nếu có
};

// Đường dẫn API cho bài viết
export const POST_API = {
  BASE: `${API_BASE}/posts`,
  SEARCH: `${API_BASE}/posts/search`,
  GET_BY_CATEGORY: (categoryId: string | number) => `${API_BASE}/posts/categories/${categoryId}`,
  GET_BY_USER: (userId: string | number) => `${API_BASE}/posts/author/${userId}`,
  GET_BY_ID: (id: string | number) => `${API_BASE}/posts/${id}`,
  GET_BY_SLUG: (slug: string) => `${API_BASE}/posts/slug/${slug}`,
  GET_MY: `${API_BASE}/posts/my`,
  GET_COMMENTS: (postId: string | number) => `${API_BASE}/comments/post/${postId}`,
  ADD_COMMENT: (postId: string | number) => `${API_BASE}/comments/post/${postId}`,
};

// Đường dẫn API cho bình luận
export const COMMENT_API = {
  BASE: `${API_BASE}/comments`,
  GET_BY_ID: (id: string | number) => `${API_BASE}/comments/${id}`,
  UPDATE: (id: string | number) => `${API_BASE}/comments/${id}`,
  DELETE: (id: string | number) => `${API_BASE}/comments/${id}`,
  GET_MY: `${API_BASE}/comments/my`,
};

// Đường dẫn API cho tải lên tệp (nếu có)
export const UPLOAD_API = {
  BASE: `${API_BASE}/media`,
  UPLOAD_IMAGE: `${API_BASE}/media`,
  UPLOAD_IMAGES: `${API_BASE}/media/multiple`,
  UPLOAD_EDITOR: `${API_BASE}/media/editor`,
  DELETE_FILE: (id: string | number) => `${API_BASE}/media/${id}`,
};

// Đường dẫn API cho liên hệ
export const CONTACT_API = {
  BASE: `${API_BASE}/contact`,
};

// Nhóm tất cả các API vào một đối tượng
export const API_ENDPOINTS = {
  AUTH: AUTH_API,
  LANGUAGE: LANGUAGE_API,
  CATEGORY: CATEGORY_API,
  USER: USER_API,
  POST: POST_API,
  COMMENT: COMMENT_API,
  UPLOAD: UPLOAD_API,
  BASE: API_BASE,
  CONTACT: CONTACT_API,
};

// DTOs (Data Transfer Objects)
export interface AuthRegisterDto {
  email: string;
  password: string;
  name: string;
}

export interface AuthLoginDto {
  email: string;
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
  slug?: string;
  excerpt?: string;
  category_id: string | number;
  tags?: string[];
  status?: string;
}

export interface UpdatePostDto {
  title?: string;
  content?: string;
  slug?: string;
  excerpt?: string;
  category_id?: string | number;
  tags?: string[];
  status?: string;
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