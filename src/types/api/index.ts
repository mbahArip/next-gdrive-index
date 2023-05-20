export interface API_Response<T = unknown> {
  success: boolean;
  timestamp: string;
  responseTime?: number;
  data?: T;
}

export interface API_Error {
  success: boolean;
  timestamp: string;
  responseTime?: number;
  code: number;
  message: string;
  category: string;
  reason: string;
}
