export interface JWTPayload<T> {
  payload: T;
  exp: number;
  iat: number;
  isExpired: boolean;
}
export interface ExpiredJWTPayload {
  iat: number;
  exp: number;
  isExpired: boolean;
}

export interface ProtectionPayload {
  fileId: string;
  password: string;
}
