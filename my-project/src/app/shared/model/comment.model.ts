export interface User {
  id: number;
  username: string;
  email: string;
  avatar?: string;
}

export interface Post {
  id: number;
  title: string;
  slug: string;
}

export interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  content: string;
  parent_id?: number;

  createdAt: string;
  updatedAt: string;

  user?: User;
  post?: Post;

  replies?: Comment[]; // Cho phép nested comment
}

export interface CreateCommentDto {
  content: string;
  parent_id?: number;
}

export interface UpdateCommentDto {
  content: string;
}

export interface CommentDto {
  content: string;
  post_id: number;
  user_id: number;
  parent_id?: number;
}