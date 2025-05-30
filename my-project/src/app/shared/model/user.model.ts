export interface User {
  id?: number;
  username: string;
  email: string;
  password?: string; // optional nếu không trả về từ server
  role_id: number;
  description?: string;
  is_active: boolean;
  created_at?: string; // ISO string
  updated_at?: string;

  // Dữ liệu quan hệ (optional hoặc theo nhu cầu)
  role?: {
    id: number;
    name: string;
  }
  data : any;
};