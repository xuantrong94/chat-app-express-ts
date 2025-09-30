export interface IApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: ErrorDetail;
  metadata?: ResponseMetadata;
}

export interface ErrorDetail {
  code: string;
  details?: any;
  stack?: string;
}

export interface ResponseMetadata {
  timestamp: string;
  requestId: string;
  page?: number;
  limit?: number;
  total?: number;
}

export interface PaginationResponse<T> extends IApiResponse<T> {
  metadata: ResponseMetadata & {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
