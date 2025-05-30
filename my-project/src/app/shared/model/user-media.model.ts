export interface UserMedia {
  id: number;
  user_id: number;
  media_id: number;
  created_at: string;
  updated_at: string;

  // Quan hệ với User
  user?: {
    id: number;
    username: string;
    email: string;
    avatar?: string;
  };

  // Quan hệ với Media
  media?: {
    id: number;
    url: string;
    type: string;
    alt?: string;
  };
}
export interface UserMediaDto {
  user_id: number;
  media_id: number;
}