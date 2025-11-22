export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: 'user' | 'admin';
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateUserInput {
  full_name?: string;
  avatar_url?: string;
}

export interface SignInInput {
  email: string;
  password: string;
}

export interface SignUpInput {
  email: string;
  password: string;
  full_name?: string;
  company?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
