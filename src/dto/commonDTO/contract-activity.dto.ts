export interface ContractActivityDTO {
  activityId: string;
  contractId: string;
  actor: {
    role: 'client' | 'freelancer' | 'system' | 'admin';
    userId?: string;
    name?: string;
  };
  eventType: string;
  title: string;
  description: string;
  metadata?: {
    amount?: number;
    milestoneId?: string;
    messageId?: string;
    reason?: string;
  };
  createdAt: Date;
}

export interface ContractTimelineDTO {
  activities: ContractActivityDTO[];
  total: number;
}
