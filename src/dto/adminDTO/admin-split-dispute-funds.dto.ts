export interface SplitDisputeFundsDTO {
  clientPercentage: number;
  freelancerPercentage: number;
}

export interface SplitDisputeFundsResponseDTO {
  success: boolean;
  message: string;
  clientRefundAmount: number;
  freelancerReleaseAmount: number;
}
