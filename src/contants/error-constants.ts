export const ERROR_MESSAGES = {
  INVALID_ID: 'Invalid ID provided',
  AUTH: {
    EMAIL_ALREADY_EXIST: 'Email already exists',
    ALREADY_EXIST: 'Email or phone number already exists',
    INVALID_CREDENTIALS: 'Invalid username or password',
    TOKEN_EXPIRED: 'Token has expired',
    UNAUTHORIZED: 'You are not authorized to access this resource',
    INCORRECT_PASSWORD: 'Incorrect Password',
    NOT_FOUND: 'Email does not exist',
  },
  CATEGORY: {
    ALREADY_EXIST: 'Category with this name already exists',
  },
  SKILL: {
    ALREADY_EXIST: 'Skill with this name already exists',
    NOT_FOUND: 'Skill not Found',
  },
  SPECIALITY: {
    ALREADY_EXIST: 'Speciality with this name already exists',
  },
  GENERAL: {
    SERVER_ERROR: 'Something went wrong, please try again later',
    BAD_REQUEST: 'Invalid request',
  },
  TOKEN: {
    INVALID_TOKEN: 'Invalid or Expired Token',
  },
  OTP: {
    EXPIRED: 'OTP has expired',
    INCORRECT_OTP: 'Enter otp is incorrect',
  },
  CLIENT: {
    FAILED_CREATE: 'Failed to create client profile',
    FETCH_FAILED: 'Failed to fetch Client data',
    NOT_FOUND: "Client or Client profile doesn't exist",
  },
  FREELANCER: {
    FAILED_CREATE: 'Failed to create Freelancer profile',
    NOT_FOUND: "Freelancer or Freelancer profile doesn't exist",
    FETCH_FAILED: 'Failed to fetch Freelancer data',
  },
  USER: {
    NOT_FOUND: 'User Not Found',
    ID_REQUIRED: 'User Id Required',
  },
  VALIDATION: {
    FAILED: 'Validation failed',
  },
  PORTFOLIO: {
    NOT_FOUND: 'No Portfolio Found for This Freelancer ID',
  },
  ACTION_VERIFICATION: {
    CHANGE_EMAIL: {
      NOT_FOUND: 'No pending email change request found.',
      PASSWORD_NOT_VERFIED: 'Password Not Verfied',
      OTP_NOT_SENT: 'Otp not sent',
    },
  },
  JOB: {
    NOT_FOUND: 'Job not found',
    INVALID_STATUS: 'Job status is not valid for this operation',
  },
  PROPOSAL: {
    ALREADY_EXIST: 'Proposal already sent',
    NOT_FOUND: 'Proposal Not Found',
  },
  CONTRACT: {
    NOT_FOUND: 'Contract not found',
    UNAUTHORIZED_ACCESS: 'You are not authorized to access this contract',
    MILESTONE_NOT_FOUND: 'Milestone not found',
    MILESTONE_NOT_FUNDED: 'Milestone must be funded to request extension',
    EXTENSION_REQUEST_PENDING: 'An extension request is already pending for this milestone',
    EXTENSION_REQUEST_NOT_FOUND: 'No extension request found for this milestone',
    INVALID_EXTENSION_DATE: 'Extension date must be after current deadline',
    INSUFFICIENT_BALANCE: 'Insufficient balance to cover estimated weekly hours',
    CONTRACT_HELD: 'Contract is on hold due to insufficient balance',
    INVALID_ACTIVATION: 'Cannot activate contract in current status',
    NOT_HOURLY: 'This operation is only valid for hourly contracts',
    ALREADY_CANCELLED: 'Contract is already cancelled',
    INVALID_PAYMENT_TYPE: 'This operation is only valid for fixed payment contracts',
    PENDING_DELIVERABLES: 'Please approve or reject all pending deliverables before cancelling the contract',
    CANCELLATION_IN_PROGRESS: 'Contract cancellation is already in progress',
  },
  REVIEW: {
    ALREADY_SUBMITTED: 'You have already submitted a review for this contract',
    CONTRACT_NOT_FOUND: 'Contract not found',
    INVALID_STATUS: 'Contract must be completed or cancelled to submit review',
    INVALID_RATING: 'Rating must be between 1 and 5',
    NOT_FOUND: 'Review not found',
  },
  DISPUTE: {
    NOT_FOUND: 'Dispute not found',
    ALREADY_EXISTS: 'A dispute already exists for this contract',
    INVALID_REASON: 'Invalid dispute reason provided',
    UNAUTHORIZED_ACCESS: 'You are not authorized to access this dispute',
    ALREADY_RESOLVED: 'This dispute has already been resolved',
    CANNOT_RAISE_DISPUTE: 'Cannot raise dispute for this contract in current state',
    INVALID_STATUS: 'Invalid dispute status',
    WORKLOG_NOT_REJECTED: 'Worklog must be rejected to raise a dispute',
    DISPUTE_WINDOW_EXPIRED: 'The dispute window for this worklog has expired',
    WORKLOG_DISPUTE_EXISTS: 'A dispute already exists for this worklog',
  },
  MEETING: {
    NOT_FOUND: 'Meeting not found',
    UNAUTHORIZED: 'You are not authorized to perform this action on this meeting',
    INVALID_STATUS: 'Invalid meeting status for this action',
    REJECT_FAILED: 'Failed to reject meeting',
    UPDATE_FAILED: 'Failed to update meeting',
  },
};
