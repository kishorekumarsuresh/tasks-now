export interface UserRecord {
  id: string;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

// What we safely return to the client (NEVER return password_hash)
export interface UserResponse {
  id: string;
  email: string;
  createdAt: Date;
}

export interface AuthResponse {
  token: string;
  user: UserResponse;
}

export interface JwtPayload {
  sub: string; // standard JWT claim for Subject (User ID)
}