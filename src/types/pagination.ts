export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  last_page: number;
}
