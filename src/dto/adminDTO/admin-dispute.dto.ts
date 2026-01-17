export interface AdminDisputeQueryParamsDTO {
  search?: string;
  page?: number;
  limit?: number;
  filters: {
    reasonCode?: string;
  };
}

export interface AdminDisputeListItemDTO {
  id: string;
  disputeId: string;
  contractTitle: string;
  raisedBy: {
    name: string;
    role: 'client' | 'freelancer' | 'system';
  };
  reasonCode: string;
  status: string;
  createdAt: Date;
}

export interface AdminDisputeListResultDTO {
  items: AdminDisputeListItemDTO[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}
