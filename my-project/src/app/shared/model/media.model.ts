export interface Media {
  id: number;
  url: string;
  type: 'image' | 'video' | 'audio' | 'other'; // hoặc bạn có thể mở rộng thêm
  altText?: string;  // mô tả ảnh/video
  created_at?: string;
  updated_at?: string;
}