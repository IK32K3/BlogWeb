export interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  content: string;
  parent_id?: number; // Nếu bạn có bình luận cha

  created_at: string;
  updated_at: string;

  // Quan hệ với User (được gọi là 'user' trong Sequelize)
  user?: {
    id: number;
    username: string;
    email: string;
    avatar?: string;
  };

  // Quan hệ với Post (được gọi là 'post' trong Sequelize)
  post?: {
    id: number;
    title: string;
    slug: string;
  };
}
export interface CommentDto {
  content: string;
  post_id: number;
  user_id: number;
  parent_id?: number;
}