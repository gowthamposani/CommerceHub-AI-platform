export type ThemeMode = "light" | "dark";

export type SortDirection = "asc" | "desc";

export interface Option {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  totalItems: number;
}

export interface ApiErrorDetail {
  code?: string;
  field?: string;
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  timestamp: string;
  requestId?: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors: ApiErrorDetail[];
  timestamp: string;
  requestId?: string;
}
