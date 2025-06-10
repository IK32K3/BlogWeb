export interface Role {
  id: number;
  name: string;
}

export interface UploadedFile {
  id: number;
  url: string;
  name?: string;
  type?: 'image' | 'video' | 'document' | 'gallery';
  metadata?: Record<string, any>;
}

export interface UserUpload {
  id: number;
  user_id: number;
  file_id: number;
  createdAt: string;
  updatedAt: string;
  file: UploadedFile;
}

export interface Settings {
  id: number;
  settings: {
    theme: string;
    language: string;
    notifications: boolean;
  };
}

export interface User {
  id: number;
  username: string;
  email: string;
  role_id: number;
  description: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
  role: Role;
  settings?: Settings;
  userUploads?: UserUpload[];
  avatar?: string;
}