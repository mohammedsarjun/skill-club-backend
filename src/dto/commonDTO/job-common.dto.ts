export interface JobQueryParams {
  search: string;
  page: number;
  limit: number;
  filters: {
    category?: string | null;
    status?:
      | 'pending_verification'
      | 'open'
      | 'partially_filled'
      | 'in_progress'
      | 'closed'
      | 'archived'
      | 'rejected';
  };
}
