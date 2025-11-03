export interface IPaginate<T> {
  items: T[];
  meta?: IMeta;
}

export interface IMeta {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}
