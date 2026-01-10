import mongoose, { Schema } from 'mongoose';
import {
  IContract,
  ContractMilestone,
  ContractDeliverable,
  ContractTimesheet,
  HourLog,
  MilestoneDeliverable,
  MilestoneExtensionRequest,
  ContractExtensionRequest,
  TimelineEntry,
} from '../models/interfaces/contract.model.interface';

const MilestoneDeliverableSchema = new Schema<MilestoneDeliverable>({
  submittedBy: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  files: [{ fileName: String, fileUrl: String }],
  message: String,
  status: {
    type: String,
    enum: ['submitted', 'approved', 'changes_requested'],
    default: 'submitted',
  },
  version: { type: Number, required: true },
  submittedAt: { type: Date, default: Date.now },
  approvedAt: Date,
  revisionsRequested: { type: Number, default: 0 },
});

const MilestoneExtensionRequestSchema = new Schema<MilestoneExtensionRequest>({
  requestedBy: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  requestedDeadline: { type: Date, required: true },
  reason: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  requestedAt: { type: Date, default: Date.now },
  respondedAt: Date,
  responseMessage: String,
});

const ContractExtensionRequestSchema = new Schema<ContractExtensionRequest>({
  requestedBy: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  requestedDeadline: { type: Date, required: true },
  reason: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  requestedAt: { type: Date, default: Date.now },
  respondedAt: Date,
  responseMessage: String,
});

const ContractMilestoneSchema = new Schema<ContractMilestone>({
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  expectedDelivery: { type: Date, required: true },
  status: {
    type: String,
    enum: ['pending_funding', 'funded','changes_requested','submitted', 'approved', 'paid'],
    default: 'pending_funding',
  },
  submittedAt: Date,
  approvedAt: Date,
  revisionsAllowed: { type: Number, default: 0 },
  deliverables: [MilestoneDeliverableSchema],
  extensionRequest: MilestoneExtensionRequestSchema,
});

const ContractDeliverableSchema = new Schema<ContractDeliverable>({
  submittedBy: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  files: [{ fileName: String, fileUrl: String }],
  message: String,
  status: {
    type: String,
    enum: ['submitted', 'approved', 'changes_requested'],
    default: 'submitted',
  },
  version: { type: Number, required: true },
  submittedAt: { type: Date, default: Date.now },
  approvedAt: Date,
  revisionsRequested: { type: Number, default: 0 },
});

const HourLogSchema = new Schema<HourLog>({
  date: { type: Date, required: true },
  hours: { type: Number, required: true },
});

const ContractTimesheetSchema = new Schema<ContractTimesheet>({
  weekStart: { type: Date, required: true },
  weekEnd: { type: Date, required: true },
  totalHours: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'approved', 'paid'], default: 'pending' },
  hoursLogged: [HourLogSchema],
});

const TimelineEntrySchema = new Schema<TimelineEntry>({
  action: { type: String, required: true },
  performedBy: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  milestoneId: { type: Schema.Types.ObjectId, ref: 'ContractMilestone' },
  details: String,
  timestamp: { type: Date, default: Date.now },
});

const ContractSchema = new Schema<IContract>(
  {
    contractId: { type: String, required: true, unique: true, index: true },
    offerId: { type: Schema.Types.ObjectId, required: true, ref: 'Offer' },
    clientId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    freelancerId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    jobId: { type: Schema.Types.ObjectId, ref: 'Job' },
    proposalId: { type: Schema.Types.ObjectId, ref: 'Proposal' },

    paymentType: {
      type: String,
      enum: ['fixed', 'fixed_with_milestones', 'hourly'],
      required: true,
    },
    budget: Number,
    hourlyRate: Number,
    estimatedHoursPerWeek: Number,

    milestones: [ContractMilestoneSchema],
    timesheets: [ContractTimesheetSchema],
    deliverables: [ContractDeliverableSchema],
    extensionRequest: ContractExtensionRequestSchema,
    timeline: [TimelineEntrySchema],

    title: { type: String, required: true },
    description: { type: String, required: true },
    revisions: { type: Number, default: 0 },
    revisionAllowed: { type: Number, default: 0 },
    expectedStartDate: { type: Date, required: true },
    expectedEndDate: { type: Date, required: true },
    referenceFiles: [{ fileName: String, fileUrl: String }],
    referenceLinks: [{ description: String, link: String }],
    communication: { type: Schema.Types.Mixed },
    reporting: { type: Schema.Types.Mixed },

    status: {
      type: String,
      enum: ['pending_funding','held' ,'active', 'completed', 'cancelled', 'refunded','disputed'],
      default: 'pending_funding',
    },
    fundedAmount: { type: Number, default: 0 },
    totalPaid: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
  },
  { timestamps: true },
);
// Pre-validate hook to generate a human-friendly unique contractId if not set
ContractSchema.pre<IContract>('validate', async function (next) {
  if (this.contractId && String(this.contractId).trim().length > 0) return next();

  const prefix = '#CON';
  const gen = () => `${prefix}${Math.floor(100000 + Math.random() * 900000)}`; // #CON123456

  let candidate = gen();
  // ensure uniqueness (rare collision) - attempt up to a small number of times
  for (let i = 0; i < 5; i++) {
    // use model lookup to check existing contractId

    const existing = await mongoose.models.Contract?.findOne({ contractId: candidate }).lean();
    if (!existing) {
      this.contractId = candidate;
      return next();
    }
    candidate = gen();
  }

  // fallback: append timestamp
  this.contractId = `${prefix}${Date.now()}`;
  return next();
});

export const Contract = mongoose.model<IContract>('Contract', ContractSchema);
