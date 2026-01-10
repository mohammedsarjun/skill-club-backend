export interface WorklogValidationResponseDTO {
  canLogWork: boolean;
  reason?: string;
  weeklyHoursWorked?: number;
  estimatedHoursPerWeek?: number;
  contractStatus?: string;
}
