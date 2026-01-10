export interface ClientMilestonesDetailDTO {
  id: string;
  title: string;
  amount: number;
  amountBaseUSD?: number;
  expectedDelivery: string;
  status: 'pending' | 'pending_funding' | 'funded' | 'under_review' | 'submitted' | 'approved' | 'paid' | 'changes_requested';
  submittedAt?: string;
  approvedAt?: string;
  revisionsAllowed?: number;
  deliverables?: MilestoneDeliverableResponseDTO[];
  extensionRequest?: MilestoneExtensionResponseDTO;
}


export interface ApproveMilestoneDeliverableDTO {
  milestoneId: string;
  deliverableId: string;
  message?: string;
}

export interface RequestMilestoneChangesDTO {
  milestoneId: string;
  deliverableId: string;
  message: string;
}

export interface RespondToExtensionDTO {
  milestoneId: string;
  approved: boolean;
  responseMessage?: string;
}

export interface MilestoneDeliverableResponseDTO {
  id: string;
  submittedBy: string;
  files: { fileName: string; fileUrl: string }[];
  message?: string;
  status: 'submitted' | 'approved' | 'changes_requested';
  version: number;
  submittedAt: string;
  approvedAt?: string;
  revisionsRequested?: number;
  revisionsAllowed?: number;
  revisionsLeft?: number;
}

export interface MilestoneExtensionResponseDTO {
  requestedBy: string;
  requestedDeadline: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  respondedAt?: string;
  responseMessage?: string;
}


