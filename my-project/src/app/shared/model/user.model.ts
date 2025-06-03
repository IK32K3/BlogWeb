export interface Role {
  id: number;
  name: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: Role | string;
  avatar?: string;
  created_at?: string;
  updated_at?: string;
}