export interface PostMedia {
  post_id: number;
  media_id: number;
  is_featured: boolean;
  created_at: string;  // do timestamps: true Sequelize tự động tạo
  updated_at: string;

  // Quan hệ với Post (optional, có thể không có nếu không eager loading)
  post?: {
    id: number;
    title?: string;
    slug?: string;
    // ...các trường khác nếu cần
  };

  // Quan hệ với Media (optional)
  media?: {
    id: number;
    url?: string;
    // ...các trường khác nếu cần
  };
}
export interface PostMediaDto {
  post_id: number;
  media_id: number;
  is_featured?: boolean;
}