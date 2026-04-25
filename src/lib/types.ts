export type UserRole = 'author' | 'viewer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
}

export interface Post {
  id: string;
  title: string;
  body: string;
  image_url?: string;
  summary?: string;
  author_id: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  author?: User;
  comments?: Comment[];
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  comment_text: string;
  created_at: string;
  user?: User;
}

export interface PaginatedPosts {
  posts: Post[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}
